"use server";

import prisma from "@/lib/db/prisma";
import { auth } from "@/lib/auth"; // Adjust path
import { Role, ContentType } from "@prisma/client";
import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";

export interface ParentDashboardStats {
  totalChildren: number;
  totalStoriesCompleted: number;
  totalQuizzesPassed: number;
  averageQuizScore: number | null;
  quizzesTakenCount: number;
}

export interface ChangePasswordFormState {
  message?: string;
  error?: string;
  success?: boolean;
}

export interface UpdateProfileFormState {
  message?: string;
  error?: string;
  success?: boolean;
  updatedName?: string;
}

export interface ActivityFeedItem {
  id: string; // ID of the UserLearningProgress record
  childId: string;
  childName: string | null;
  childUsername: string | null;
  contentTitle: string;
  contentType: ContentType;
  actionText: string; // e.g., "completed", "scored 80% on", "started"
  timestamp: Date;
  contentLink?: string; // Optional link directly to the content
}

export async function getParentDashboardStats(): Promise<{
  stats?: ParentDashboardStats;
  error?: string;
}> {
  const session = await auth();
  if (!session?.user || session.user.role !== Role.PARENT) {
    return { error: "Unauthorized." };
  }
  const parentId = session.user.id;

  try {
    // Get all child IDs linked to this parent
    const childLinks = await prisma.parentChildLink.findMany({
      where: { parentId: parentId },
      select: { childId: true },
    });
    const childIds = childLinks.map((link) => link.childId);

    const totalChildren = childIds.length;

    if (totalChildren === 0) {
      return {
        stats: {
          totalChildren: 0,
          totalStoriesCompleted: 0,
          totalQuizzesPassed: 0,
          averageQuizScore: null,
          quizzesTakenCount: 0,
        },
      };
    }

    // Fetch all progress items for these children
    const progressItems = await prisma.userLearningProgress.findMany({
      where: {
        userId: { in: childIds }, // Progress for any of the parent's children
      },
      select: {
        status: true,
        score: true,
        content: {
          // Include content to get contentType
          select: {
            contentType: true,
          },
        },
      },
    });

    let totalStoriesCompleted = 0;
    let totalQuizzesPassed = 0;
    let quizzesTakenCount = 0;
    let totalQuizScoreSum = 0;

    for (const item of progressItems) {
      if (
        item.content.contentType === ContentType.STORY &&
        item.status === "completed"
      ) {
        totalStoriesCompleted++;
      } else if (item.content.contentType === ContentType.QUIZ) {
        if (item.status === "passed") {
          totalQuizzesPassed++;
        }
        if (item.score !== null) {
          quizzesTakenCount++;
          totalQuizScoreSum += item.score;
        }
      }
    }

    const averageQuizScore =
      quizzesTakenCount > 0
        ? Math.round(totalQuizScoreSum / quizzesTakenCount)
        : null;

    return {
      stats: {
        totalChildren,
        totalStoriesCompleted,
        totalQuizzesPassed,
        averageQuizScore,
        quizzesTakenCount,
      },
    };
  } catch (error) {
    console.error("Error fetching parent dashboard stats:", error);
    return { error: "Failed to load dashboard statistics." };
  }
}

// -- Update Profile
export async function updateParentProfile(
  prevState: UpdateProfileFormState | undefined,
  formData: FormData
): Promise<UpdateProfileFormState> {
  const session = await auth();
  if (!session?.user || session.user.role !== Role.PARENT) {
    return { error: "Unauthorized." };
  }
  const userId = session.user.id;

  try {
    const name = formData.get("name") as string;

    if (name === null || name.trim() === "") {
      // Allow empty string to clear name if desired, or add validation
      // If name is required, add: return { error: "Name cannot be empty." };
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        name: name.trim() === "" ? null : name.trim(), // Store null if name is cleared
      },
      select: { name: true }, // Only select the name to return
    });

    revalidatePath("/parent/settings");
    revalidatePath("/parent/overview");
    revalidatePath("/(platform)/layout", "layout");

    return {
      success: true,
      message: "Profile updated successfully!",
      updatedName: updatedUser.name || "",
    };
  } catch (error) {
    console.error("Error updating parent profile:", error);
    return { error: "Failed to update profile." };
  }
}

// -- Change Password

export async function changeParentPassword(
  prevState: ChangePasswordFormState | undefined,
  formData: FormData
): Promise<ChangePasswordFormState> {
  const session = await auth();
  if (!session?.user || !session.user.id) {
    // Check for user.id as well
    return { error: "Unauthorized. Please sign in again." };
  }
  const userId = session.user.id;

  try {
    const currentPassword = formData.get("currentPassword") as string;
    const newPassword = formData.get("newPassword") as string;
    const confirmNewPassword = formData.get("confirmNewPassword") as string;

    // --- Validation ---
    if (!currentPassword || !newPassword || !confirmNewPassword) {
      return { error: "Please fill in all password fields." };
    }
    if (newPassword.length < 6) {
      // Enforce your minimum password length
      return { error: "New password must be at least 6 characters long." };
    }
    if (newPassword !== confirmNewPassword) {
      return { error: "New passwords do not match." };
    }

    // --- Fetch current user to verify current password ---
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { password: true }, // Only fetch the password hash
    });

    if (!user || !user.password) {
      // This should not happen if user is authenticated and has a password
      return { error: "Could not verify current user information." };
    }

    // --- Verify current password ---
    const isCurrentPasswordValid = await bcrypt.compare(
      currentPassword,
      user.password
    );
    if (!isCurrentPasswordValid) {
      return { error: "Incorrect current password." };
    }

    // --- Hash the new password ---
    const hashedNewPassword = await bcrypt.hash(newPassword, 10);

    // --- Update the password ---
    await prisma.user.update({
      where: { id: userId },
      data: {
        password: hashedNewPassword,
      },
    });

    return { success: true, message: "Password updated successfully!" };
  } catch (error) {
    console.error("Error changing parent password:", error);
    return { error: "Failed to change password. Please try again." };
  }
}

// -- Activity Feed

export async function getRecentActivityFeed(
  limit: number = 5 // Default to fetching last 5 activities
): Promise<{ feed?: ActivityFeedItem[]; error?: string }> {
  const session = await auth();
  if (!session?.user || session.user.role !== Role.PARENT) {
    return { error: "Unauthorized." };
  }
  const parentId = session.user.id;

  try {
    // Get all child IDs linked to this parent
    const childLinks = await prisma.parentChildLink.findMany({
      where: { parentId: parentId },
      select: { childId: true },
    });
    const childIds = childLinks.map((link) => link.childId);

    if (childIds.length === 0) {
      return { feed: [] }; // No children, so no activity
    }

    const recentProgress = await prisma.userLearningProgress.findMany({
      where: {
        userId: { in: childIds },
      },
      orderBy: {
        lastAccessed: "desc", // Get the most recent activities
      },
      take: limit, // Limit the number of results
      include: {
        user: {
          // Include child's user data to get their name/username
          select: { name: true, username: true },
        },
        content: {
          // Include content data to get title and type
          select: { title: true, contentType: true, id: true },
        },
      },
    });

    const feed: ActivityFeedItem[] = recentProgress.map((item) => {
      let actionText = "";
      switch (item.content.contentType) {
        case ContentType.STORY:
          actionText =
            item.status === "completed"
              ? "finished reading"
              : `interacted with`;
          break;
        case ContentType.QUIZ:
          if (item.status === "passed" || item.status === "failed") {
            actionText = `scored ${item.score}% on`;
          } else if (item.status === "completed") {
            actionText = `completed`;
          } else {
            actionText = `attempted`;
          }
          break;
        default:
          actionText = `interacted with`;
      }

      let contentLink = "";
      if (item.content.contentType === ContentType.STORY) {
        contentLink = `/kid/stories/${item.contentId}`;
      } else if (item.content.contentType === ContentType.QUIZ) {
        contentLink = `/kid/quizzes/${item.contentId}`;
      }
      // Add links for other content types later

      return {
        id: item.id,
        childId: item.userId,
        childName: item.user.name,
        childUsername: item.user.username,
        contentTitle: item.content.title,
        contentType: item.content.contentType,
        actionText: actionText,
        timestamp: item.lastAccessed, // Or item.completedAt if preferred for completed items
        contentLink: contentLink,
      };
    });

    return { feed };
  } catch (error) {
    console.error("Error fetching recent activity feed:", error);
    return { error: "Failed to load recent activity." };
  }
}
