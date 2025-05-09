"use server";

import prisma from "@/lib/db/prisma";
import { ContentType, LearningContent } from "@prisma/client";
export interface StoryListItem {
  id: string;
  title: string;
  description: string | null;
  coverImageUrl?: string | null;
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
