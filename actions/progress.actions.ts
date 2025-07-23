"use server";

import prisma from "@/lib/db/prisma";
import { auth } from "@/lib/auth";
import { Role, ContentType } from "@prisma/client";
import {
  getEarnedBadgesForUser,
  EarnedBadge as GamificationEarnedBadge,
} from "./gamification.actions";
import { revalidatePath } from "next/cache";
import { updateRoadmapProgress } from "./roadmap.actions";

// Interface for individual progress items (can be a story or quiz)
export interface ProgressItemSummary {
  contentId: string;
  contentTitle: string;
  contentType: ContentType;
  status: string;
  score?: number | null; // For quizzes
  completedAt?: Date | null;
  lastAccessed: Date;
}

// Updated main interface for the data returned to the child detail page
export interface FullChildProgressDetails {
  child: {
    id: string;
    name: string | null;
    username: string | null;
  };
  progressItems: ProgressItemSummary[]; // A combined list of all progress
}

export interface SubjectProgress {
  subject: string;
  totalAvailable: number;
  totalCompleted: number;
  totalPassed?: number; // Specifically for quizzes
  averageScore?: number | null; // Specifically for quizzes
}

export interface ActivityOverTimePoint {
  date: string; // e.g., "YYYY-MM-DD" or "Mon, Jan 1"
  count: number; // Number of activities completed/accessed on that date
}

export interface DetailedChildReport {
  child: {
    id: string;
    name: string | null;
    username: string | null;
    // avatarUrl?: string; // If we add avatars
  };
  overallStats: {
    totalActivitiesAttempted: number;
    totalActivitiesCompleted: number; // Stories completed + Quizzes passed/completed
    totalStoriesCompleted: number;
    totalQuizzesAttempted: number;
    totalQuizzesPassed: number;
    averageQuizScoreAllTime: number | null;
  };
  progressBySubject: SubjectProgress[];
  activityFeed: ProgressItemSummary[]; // The existing detailed feed, maybe limit to more items
  activityCalendar?: ActivityOverTimePoint[];
  earnedBadges: GamificationEarnedBadge[];
}

export async function getChildProgressDetails(
  childId: string
): Promise<{ data?: FullChildProgressDetails; error?: string }> {
  const session = await auth();
  if (!session?.user || session.user.role !== Role.PARENT) {
    return { error: "Unauthorized." };
  }
  const parentId = session.user.id;

  // Verify parent-child link first for security
  const link = await prisma.parentChildLink.findUnique({
    where: {
      parentId_childId: {
        parentId: parentId,
        childId: childId,
      },
    },
  });

  if (!link) {
    return {
      error:
        "Child not found or you do not have permission to view this child's progress.",
    };
  }

  try {
    const childUserWithProgress = await prisma.user.findUnique({
      where: { id: childId },
      select: {
        // Top-level select for the User model
        id: true,
        name: true,
        username: true,
        learningProgress: {
          orderBy: {
            lastAccessed: "desc", // Show most recent activity first
          },
          select: {
            // Specify which fields from UserLearningProgress itself
            contentId: true,
            status: true,
            score: true,
            completedAt: true,
            lastAccessed: true,
            content: {
              select: {
                title: true,
                contentType: true,
              },
            },
          },
        },
      },
    });

    if (!childUserWithProgress) {
      return { error: "Child user details not found." };
    }

    // Map the fetched progress items to the desired ProgressItemSummary structure
    const progressItems: ProgressItemSummary[] =
      childUserWithProgress.learningProgress.map((p) => ({
        contentId: p.contentId,
        contentTitle: p.content.title, // Title from the included content relation
        contentType: p.content.contentType,
        status: p.status,
        score: p.score,
        completedAt: p.completedAt,
        lastAccessed: p.lastAccessed,
      }));

    const data: FullChildProgressDetails = {
      child: {
        id: childUserWithProgress.id,
        name: childUserWithProgress.name,
        username: childUserWithProgress.username,
      },
      progressItems: progressItems,
    };

    return { data };
  } catch (error) {
    console.error(
      `Error fetching full progress details for child ${childId}:`,
      error
    );
    return { error: "Failed to load child's full progress." };
  }
}

// -- Get detailed child report for parent dashboard
export async function getChildProgressDetailsForReport(
  childId: string
): Promise<{ data?: DetailedChildReport; error?: string }> {
  const session = await auth();
  if (!session?.user || session.user.role !== Role.PARENT)
    return { error: "Unauthorized." };
  const parentId = session.user.id;

  const link = await prisma.parentChildLink.findUnique({
    where: { parentId_childId: { parentId, childId } },
  });
  if (!link) return { error: "Child not found or permission denied." };

  try {
    const childUser = await prisma.user.findUnique({
      where: { id: childId },
      select: { id: true, name: true, username: true },
    });
    if (!childUser) return { error: "Child user details not found." };

    // Fetch all learning content available (to calculate total available per subject)
    const allLearningContent = await prisma.learningContent.findMany({
      select: { id: true, subject: true, contentType: true },
    });
    const { badges: childEarnedBadges } = await getEarnedBadgesForUser(childId);

    // Fetch all progress for this child
    const childProgressRecords = await prisma.userLearningProgress.findMany({
      where: { userId: childId },
      include: {
        content: {
          select: { id: true, title: true, contentType: true, subject: true },
        },
      },
      orderBy: { lastAccessed: "desc" },
    });

    // --- Calculate Overall Stats ---
    let totalStoriesCompleted = 0;
    let totalQuizzesAttempted = 0;
    let totalQuizzesPassed = 0;
    let quizScoreSum = 0;
    let scoredQuizzesCount = 0;

    childProgressRecords.forEach((p) => {
      if (
        p.content.contentType === ContentType.STORY &&
        p.status === "completed"
      ) {
        totalStoriesCompleted++;
      } else if (p.content.contentType === ContentType.QUIZ) {
        totalQuizzesAttempted++; // Every quiz progress record is an attempt
        if (p.status === "passed") totalQuizzesPassed++;
        if (p.score !== null) {
          quizScoreSum += p.score;
          scoredQuizzesCount++;
        }
      }
    });
    const averageQuizScoreAllTime =
      scoredQuizzesCount > 0
        ? Math.round(quizScoreSum / scoredQuizzesCount)
        : null;
    const totalActivitiesCompleted = totalStoriesCompleted + totalQuizzesPassed; // Or a different definition

    // --- Calculate Progress by Subject ---
    const subjects = [...new Set(allLearningContent.map((lc) => lc.subject))]; // Get unique subjects
    const progressBySubject: SubjectProgress[] = subjects.map((subjectName) => {
      const contentInSubject = allLearningContent.filter(
        (lc) => lc.subject === subjectName
      );
      const progressInSubject = childProgressRecords.filter(
        (p) => p.content.subject === subjectName
      );

      const totalAvailable = contentInSubject.length;
      let totalCompletedInSubject = 0;
      let totalPassedInSubject = 0;
      let subjectQuizScoreSum = 0;
      let subjectScoredQuizzesCount = 0;

      progressInSubject.forEach((p) => {
        if (
          p.content.contentType === ContentType.STORY &&
          p.status === "completed"
        ) {
          totalCompletedInSubject++;
        } else if (p.content.contentType === ContentType.QUIZ) {
          if (p.status === "passed") {
            totalCompletedInSubject++; // Count passed quizzes as completed for subject
            totalPassedInSubject++;
          }
          if (p.score !== null) {
            subjectQuizScoreSum += p.score;
            subjectScoredQuizzesCount++;
          }
        }
      });
      return {
        subject: subjectName,
        totalAvailable,
        totalCompleted: totalCompletedInSubject,
        totalPassed: totalPassedInSubject,
        averageScore:
          subjectScoredQuizzesCount > 0
            ? Math.round(subjectQuizScoreSum / subjectScoredQuizzesCount)
            : null,
      };
    });

    // --- Prepare Activity Feed ---
    const activityFeed: ProgressItemSummary[] = childProgressRecords
      .slice(0, 10)
      .map((p) => ({
        contentId: p.contentId,
        contentTitle: p.content.title,
        contentType: p.content.contentType,
        status: p.status,
        score: p.score,
        completedAt: p.completedAt,
        lastAccessed: p.lastAccessed,
      }));

    // --- Prepare Activity Calendar Data (Simplified: count activities per day for last 30 days) ---
    const activityCalendar: ActivityOverTimePoint[] = [];
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const dailyCounts: { [date: string]: number } = {};
    childProgressRecords
      .filter((p) => p.lastAccessed >= thirtyDaysAgo) // Only recent
      .forEach((p) => {
        const dateStr = p.lastAccessed.toISOString().split("T")[0]; // YYYY-MM-DD
        dailyCounts[dateStr] = (dailyCounts[dateStr] || 0) + 1;
      });
    for (let i = 0; i < 30; i++) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split("T")[0];
      activityCalendar.unshift({
        date: dateStr,
        count: dailyCounts[dateStr] || 0,
      }); // unshift to have oldest first
    }

    const data: DetailedChildReport = {
      child: {
        id: childUser.id,
        name: childUser.name,
        username: childUser.username,
      },
      overallStats: {
        totalActivitiesAttempted: childProgressRecords.length,
        totalActivitiesCompleted,
        totalStoriesCompleted,
        totalQuizzesAttempted,
        totalQuizzesPassed,
        averageQuizScoreAllTime,
      },
      progressBySubject,
      activityFeed,
      activityCalendar,
      earnedBadges: childEarnedBadges || [],
    };
    return { data };
  } catch (error) {
    console.error(
      `Error fetching detailed report for child ${childId}:`,
      error
    );
    return { error: "Failed to load child's report." };
  }
}

/**
 * Checks if all lessons in a course are completed after a lesson is finished.
 * If so, it updates the user's roadmap.
 * @param userId The ID of the user.
 * @param lessonId The ID of the lesson that was just completed.
 */
async function checkAndCompleteCourse(userId: string, lessonId: string) {
  try {
    // 1. Find the course this lesson belongs to
    const lesson = await prisma.learningContent.findUnique({
      where: { id: lessonId },
      select: { courseId: true },
    });

    if (!lesson || !lesson.courseId) {
      // Not part of a course, so nothing to do
      return;
    }

    const { courseId } = lesson;

    // 2. Get all lessons for this course
    const courseLessons = await prisma.learningContent.findMany({
      where: { courseId },
      select: { id: true },
    });

    const courseLessonIds = courseLessons.map((l) => l.id);

    // 3. Get the user's progress for all lessons in this course
    const userProgressForCourse = await prisma.userLearningProgress.findMany({
      where: {
        userId,
        contentId: { in: courseLessonIds },
        status: "completed",
      },
      select: { contentId: true },
    });

    // 4. Check if all lessons are completed
    if (userProgressForCourse.length === courseLessonIds.length) {
      console.log(
        `All lessons for course ${courseId} completed by user ${userId}. Updating roadmap.`
      );
      // All lessons are complete, so update the roadmap
      await updateRoadmapProgress(userId, courseId);
      // Optional: Revalidate the roadmap page if it exists
      revalidatePath("/kid/roadmap");
    }
  } catch (error) {
    console.error(
      `Failed to check for course completion for user ${userId} and lesson ${lessonId}:`,
      error
    );
    // We don't return an error to the user as this is a background process
  }
}

const POINTS_FOR_COMPLETING_LESSON = 25;

export async function updateLessonBlockProgress(
  lessonId: string,
  blockId: string
) {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) return { error: "User not authenticated." };

  try {
    const progress = await prisma.userLearningProgress.upsert({
      where: { userId_contentId: { userId, contentId: lessonId } },
      create: {
        userId,
        contentId: lessonId,
        status: "inprogress",
        completedBlocks: [blockId],
      },
      update: {
        status: "inprogress",
        completedBlocks: { push: blockId }, // Add the new blockId to the array
        lastAccessed: new Date(),
      },
    });

    // This part is crucial to prevent duplicate block IDs in the array
    const uniqueBlocks = Array.from(
      new Set(progress.completedBlocks as string[])
    );
    await prisma.userLearningProgress.update({
      where: { id: progress.id },
      data: { completedBlocks: uniqueBlocks },
    });

    return { success: true, completedBlocks: uniqueBlocks };
  } catch (error) {
    console.error("Error updating block progress:", error);
    return { error: "Could not save block progress." };
  }
}

/**
 * Marks an entire lesson as complete and awards points.
 * This should be called when the user completes the final block.
 */
export async function completeLesson(lessonId: string) {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) return { error: "User not authenticated." };

  try {
    // Use a transaction to ensure both updates happen together
    const [updatedUser, updatedProgress] = await prisma.$transaction([
      // 1. Award points to the user
      prisma.user.update({
        where: { id: userId },
        data: {
          points: {
            increment: POINTS_FOR_COMPLETING_LESSON,
          },
        },
      }),
      // 2. Mark the lesson progress as 'completed'
      prisma.userLearningProgress.update({
        where: { userId_contentId: { userId, contentId: lessonId } },
        data: {
          status: "completed",
          completedAt: new Date(),
        },
      }),
    ]);

    // Check for course completion after successfully completing the lesson
    await checkAndCompleteCourse(userId, lessonId);

    // TODO: Add badge-awarding logic here if you have one for lessons
    // e.g., await checkAndAwardLessonBadges(userId);

    revalidatePath(`/kid/lessons/${lessonId}`);
    revalidatePath(`/kid/home`); // Revalidate home to show new points total

    return {
      success: true,
      message: `Lesson complete! You earned ${POINTS_FOR_COMPLETING_LESSON} points!`,
      newTotalPoints: updatedUser.points,
    };
  } catch (error) {
    console.error("Error completing lesson:", error);
    return { error: "Could not complete the lesson or award points." };
  }
}
