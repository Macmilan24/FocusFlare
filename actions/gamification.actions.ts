"use server";

import { auth } from "@/lib/auth";
import prisma from "@/lib/db/prisma";
import { Badge, ContentType } from "@prisma/client";

export interface EarnedBadge extends Omit<Badge, "userBadges" | "criteria"> {
  // Omit relations if not needed for display
  earnedAt: Date;
}

async function awardBadgeToUser(
  userId: string,
  badgeName: string
): Promise<Badge | null> {
  try {
    const badge = await prisma.badge.findUnique({ where: { name: badgeName } });
    if (!badge) {
      console.warn(`Badge "${badgeName}" not found in database.`);
      return null;
    }

    const existingUserBadge = await prisma.userBadge.findUnique({
      where: { userId_badgeId: { userId, badgeId: badge.id } },
    });

    if (!existingUserBadge) {
      await prisma.userBadge.create({
        data: { userId, badgeId: badge.id },
      });
      console.log(`Awarded badge "${badgeName}" to user ${userId}`);
      return badge; // Return the awarded badge details
    }
    return null; // Badge already earned
  } catch (error) {
    console.error(
      `Error awarding badge "${badgeName}" to user ${userId}:`,
      error
    );
    return null;
  }
}

// --- BADGE CHECKING LOGIC ---

export async function checkAndAwardStoryBadges(
  userId: string
): Promise<Badge | null> {
  // Check for "Story Novice" (1 completed story)
  const completedStoriesCount = await prisma.userLearningProgress.count({
    where: {
      userId,
      status: "completed",
      content: { contentType: ContentType.STORY },
    },
  });

  if (completedStoriesCount >= 1) {
    const newlyAwardedBadge = await awardBadgeToUser(userId, "Story Novice");
    if (newlyAwardedBadge) return newlyAwardedBadge;
  }
  // Add checks for other story-related badges like "Bookworm Beginner" (3 stories) here
  if (completedStoriesCount >= 3) {
    const newlyAwardedBadge = await awardBadgeToUser(
      userId,
      "Bookworm Beginner"
    );
    if (newlyAwardedBadge) return newlyAwardedBadge;
  }

  return null; // No new story badge awarded in this check
}

export async function checkAndAwardQuizBadges(
  userId: string,
  quizPassed: boolean
): Promise<Badge | null> {
  // Check for "Quiz Challenger" (1 completed quiz, pass or fail)
  const completedQuizzesCount = await prisma.userLearningProgress.count({
    where: {
      userId,
      content: { contentType: ContentType.QUIZ },
      // status: { in: ["completed", "passed", "failed"] } // any attempt counts
    },
  });

  if (completedQuizzesCount >= 1) {
    // Or check if this is the first one being saved
    const newlyAwardedBadge = await awardBadgeToUser(userId, "Quiz Challenger");
    if (newlyAwardedBadge) return newlyAwardedBadge; // Return immediately if one is awarded
  }

  // Check for "Puzzle Pro" (3 passed quizzes)
  if (quizPassed) {
    // Only check this if the current quiz was passed
    const passedQuizzesCount = await prisma.userLearningProgress.count({
      where: {
        userId,
        content: { contentType: ContentType.QUIZ },
        status: "passed",
      },
    });
    if (passedQuizzesCount >= 3) {
      const newlyAwardedBadge = await awardBadgeToUser(userId, "Puzzle Pro");
      if (newlyAwardedBadge) return newlyAwardedBadge;
    }
  }
  return null; // No new quiz badge awarded in this check
}

// -- Get Earned Badge
export async function getEarnedBadgesForUser(
  userId?: string
): Promise<{ badges?: EarnedBadge[]; error?: string }> {
  let targetUserId = userId;
  if (!targetUserId) {
    // If no userId is passed, try to get it from the session (for the logged-in child)
    const session = await auth();
    if (!session?.user) return { error: "User not authenticated." };
    targetUserId = session.user.id;
  }

  if (!targetUserId) return { error: "User ID not provided." };

  try {
    const userBadges = await prisma.userBadge.findMany({
      where: { userId: targetUserId },
      orderBy: { earnedAt: "desc" },
      include: {
        badge: true, // Include the full Badge details
      },
    });

    const badges: EarnedBadge[] = userBadges.map((ub) => ({
      ...ub.badge, // Spread all properties from the Badge model
      earnedAt: ub.earnedAt,
    }));

    return { badges };
  } catch (error) {
    console.error(`Error fetching badges for user ${targetUserId}:`, error);
    return { error: "Failed to fetch earned badges." };
  }
}
