"use server";

import prisma from "@/lib/db/prisma";
import { auth } from "@/lib/auth";
import { Role, ContentType } from "@prisma/client";

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
  activityCalendar?: ActivityOverTimePoint[]; // For a calendar heatmap or line chart
  // skillBreakdown?: any; // For radar chart later
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
        // This assumes you have @@unique([parentId, childId]) on ParentChildLink
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
    // Fetch child details along with all their learning progress,
    // and for each progress item, include the title and type of the content.
    const childUserWithProgress = await prisma.user.findUnique({
      where: { id: childId },
      select: {
        // Top-level select for the User model
        id: true,
        name: true,
        username: true,
        learningProgress: {
          // Select from the related UserLearningProgress records
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
              // For each UserLearningProgress, select from its related LearningContent
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
      // This should ideally not happen if the parentChildLink check passed,
      // but it's a good defensive check.
      return { error: "Child user details not found." };
    }

    // Map the fetched progress items to the desired ProgressItemSummary structure
    const progressItems: ProgressItemSummary[] =
      childUserWithProgress.learningProgress.map((p) => ({
        contentId: p.contentId,
        contentTitle: p.content.title, // Title from the included content relation
        contentType: p.content.contentType, // Type from the included content relation
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

    // --- Prepare Activity Feed (similar to before, but ensure using full childProgressRecords) ---
    const activityFeed: ProgressItemSummary[] = childProgressRecords
      .slice(0, 10)
      .map((p) => ({
        // Example: last 10
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
