"use server";
/* eslint-disable @typescript-eslint/no-explicit-any */
import prisma from "@/lib/db/prisma";
import { auth } from "@/lib/auth";
import { ContentType, Role } from "@prisma/client";

export interface StoryListItem {
  id: string;
  title: string;
  description: string | null;
  coverImageUrl?: string | null;
}

export interface StoryPageContent {
  id: string;
  title: string;
  pages: string[];
}

export interface MarkCompletionResult {
  success?: boolean;
  message?: string;
  error?: string;
}
export async function getStoriesList(): Promise<{
  stories?: StoryListItem[];
  error?: string;
}> {
  try {
    const storyContents = await prisma.learningContent.findMany({
      where: {
        contentType: ContentType.STORY,
        subject: "StoryTime",
      },
      orderBy: {
        createdAt: "asc",
      },
      select: {
        id: true,
        title: true,
        description: true,
        content: true,
      },
    });

    const stories: StoryListItem[] = storyContents.map((item) => {
      let coverImageUrl = null;
      if (
        item.content &&
        typeof item.content === "object" &&
        "coverImageUrl" in item.content
      ) {
        coverImageUrl = (item.content as any).coverImageUrl as string | null;
      }
      return {
        id: item.id,
        title: item.title,
        description: item.description,
        coverImageUrl: coverImageUrl,
      };
    });

    return { stories };
  } catch (error) {
    console.error("Error fetching stories list:", error);
    return { error: "Failed to fetch stories." };
  }
}

// --- GET STORY PAGE CONTENT ACTION ---
export async function getStoryById(
  storyId: string
): Promise<{ story?: StoryPageContent; error?: string }> {
  if (!storyId) {
    return { error: "Story ID is required." };
  }

  try {
    const contentItem = await prisma.learningContent.findUnique({
      where: {
        id: storyId,
        contentType: ContentType.STORY,
      },
      select: {
        id: true,
        title: true,
        content: true,
      },
    });

    if (!contentItem) {
      return { error: "Story not found or is not a story." };
    }

    let pages: string[] = [];
    if (
      contentItem.content &&
      typeof contentItem.content === "object" &&
      "pages" in contentItem.content &&
      Array.isArray((contentItem.content as any).pages)
    ) {
      pages = (contentItem.content as any).pages.filter(
        (page: any) => typeof page === "string"
      );
    } else {
      console.warn(
        `Story ${contentItem.id} has missing or malformed page content.`
      );
      pages = ["This story seems to be missing its pages."];
    }

    const story: StoryPageContent = {
      id: contentItem.id,
      title: contentItem.title,
      pages: pages,
    };

    return { story };
  } catch (error) {
    console.error(`Error fetching story by ID (${storyId}):`, error);
    return { error: "Failed to fetch story details." };
  }
}

// --- MARK STORY AS COMPLETED ACTION ---
export async function markStoryAsCompleted(
  contentId: string
): Promise<MarkCompletionResult> {
  const session = await auth();

  if (!session?.user || session.user.role !== Role.CHILD) {
    return {
      error:
        "Unauthorized: Only children can mark stories as completed for themselves.",
    };
  }
  const userId = session.user.id;

  if (!contentId) {
    return { error: "Content ID is required." };
  }

  try {
    await prisma.userLearningProgress.upsert({
      where: {
        userId_contentId: {
          // Using the compound unique key
          userId: userId,
          contentId: contentId,
        },
      },
      update: {
        // If record exists, update status and completedAt
        status: "completed",
        completedAt: new Date(),
        lastAccessed: new Date(),
      },
      create: {
        userId: userId,
        contentId: contentId,
        status: "completed",
        completedAt: new Date(),
        startedAt: new Date(),
        lastAccessed: new Date(),
      },
    });
    return { success: true, message: "Story marked as completed!" };
  } catch (error) {
    console.error(
      `Error marking story ${contentId} as completed for user ${userId}:`,
      error
    );
    return { error: "Failed to mark story as completed." };
  }
}
