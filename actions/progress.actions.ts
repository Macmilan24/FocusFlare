"use server";

import prisma from "@/lib/db/prisma";
import { auth } from "@/lib/auth";
import { Role, ContentType } from "@prisma/client";

export interface ChildProgressDetails {
  child: {
    id: string;
    name: string | null;
    username: string | null;
  };
  stories: Array<{
    id: string;
    title: string;
    description: string | null;
  }>;
  storyProgress: Array<{
    contentId: string;
    status: string;
    completedAt: Date | null;
  }>;
}

export async function getChildProgressDetails(
  childId: string
): Promise<{ data?: ChildProgressDetails; error?: string }> {
  const session = await auth();
  if (!session?.user || session.user.role !== Role.PARENT) {
    return { error: "Unauthorized." };
  }
  const parentId = session.user.id;

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
    const childUser = await prisma.user.findUnique({
      where: { id: childId },
      select: { id: true, name: true, username: true },
    });

    if (!childUser) {
      return { error: "Child user details not found." };
    }

    const allStories = await prisma.learningContent.findMany({
      where: { contentType: ContentType.STORY },
      select: { id: true, title: true, description: true },
      orderBy: { title: "asc" },
    });

    const childStoryProgress = await prisma.userLearningProgress.findMany({
      where: {
        userId: childId,
        content: {
          contentType: ContentType.STORY,
        },
      },
      select: {
        contentId: true,
        status: true,
        completedAt: true,
      },
    });

    const data: ChildProgressDetails = {
      child: childUser,
      stories: allStories,
      storyProgress: childStoryProgress,
    };

    return { data };
  } catch (error) {
    console.error(
      `Error fetching progress details for child ${childId}:`,
      error
    );
    return { error: "Failed to load child's progress." };
  }
}
