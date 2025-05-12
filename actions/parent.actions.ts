// actions/parent.actions.ts
"use server";

import prisma from "@/lib/db/prisma"; // Adjust path
import { auth } from "@/lib/auth"; // Adjust path
import { Role, ContentType } from "@prisma/client";

export interface ParentDashboardStats {
  totalChildren: number;
  totalStoriesCompleted: number;
  totalQuizzesPassed: number;
  averageQuizScore: number | null;
  quizzesTakenCount: number;
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
