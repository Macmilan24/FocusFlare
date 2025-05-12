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
