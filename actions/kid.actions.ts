// actions/kid.actions.ts
"use server";

import prisma from "@/lib/db/prisma";
import { auth } from "@/lib/auth";
import { ContentType, Role } from "@prisma/client";

export interface ContentCardItem {
  id: string;
  title: string;
  description?: string | null;
  coverImageUrl?: string | null;
  contentType: ContentType;
  subject: string;
  // Add courseTitle if it's part of a course for display
  courseTitle?: string | null;
  // For "Continue Learning"
  progressPercentage?: number; // e.g. 50 for 50%
  lastAccessed?: Date;
}

// Fetch recommended content (simple version: latest published content)
export async function getRecommendedContent(
  limit: number = 4
): Promise<ContentCardItem[]> {
  try {
    const items = await prisma.learningContent.findMany({
      where: {
        // In a real app, this would be more sophisticated or from a Course that is published
        // For now, let's assume published content or just fetch recent ones
      },
      orderBy: { createdAt: "desc" },
      take: limit,
      include: { course: { select: { title: true } } }, // Include course title if content is part of a course
    });
    return items.map((item) => ({
      id: item.id,
      title: item.title,
      description: item.description,
      coverImageUrl: item.coverImageUrl,
      contentType: item.contentType,
      subject: item.subject,
      courseTitle: item.course?.title,
    }));
  } catch (error) {
    console.error("Error fetching recommended content:", error);
    return [];
  }
}

// Fetch "Continue Learning" items for the logged-in child
export async function getContinueLearningContent(
  limit: number = 4
): Promise<ContentCardItem[]> {
  const session = await auth();
  if (!session?.user || session.user.role !== Role.CHILD) return [];
  const userId = session.user.id;

  try {
    const progressItems = await prisma.userLearningProgress.findMany({
      where: {
        userId: userId,
        NOT: { status: "completed" }, // Or "passed" for quizzes if that's your completion criteria
      },
      orderBy: { lastAccessed: "desc" },
      take: limit,
      include: {
        content: {
          include: { course: { select: { title: true } } },
        },
      },
    });
    return progressItems.map((p) => ({
      id: p.content.id,
      title: p.content.title,
      description: p.content.description,
      coverImageUrl: p.content.coverImageUrl,
      contentType: p.content.contentType,
      subject: p.content.subject,
      courseTitle: p.content.course?.title,
      // progressPercentage: p.progress, // If you store current page/step in UserLearningProgress.progress
      lastAccessed: p.lastAccessed,
    }));
  } catch (error) {
    console.error("Error fetching continue learning content:", error);
    return [];
  }
}

// Fetch subjects/categories (can be dynamic from LearningContent or Course subjects)
export interface SubjectCategory {
  name: string;
  iconSlug: keyof typeof import("lucide-react"); // For display
  itemCount?: number; // Optional count of items in this subject
  // coverImageUrl?: string; // Optional image for the subject card
}
export async function getSubjectCategories(): Promise<SubjectCategory[]> {
  // For now, let's use a predefined list that matches your KidHomePage.
  // Later, this could be dynamically generated from distinct subjects in Courses/LearningContent.
  return [
    {
      name: "Mathematics",
      iconSlug: "Calculator" /* or your Puzzle icon */,
      itemCount: await prisma.learningContent.count({
        where: { subject: "Mathematics" },
      }),
    },
    {
      name: "Reading",
      iconSlug: "BookOpen",
      itemCount: await prisma.learningContent.count({
        where: { subject: "Reading" },
      }),
    },
    {
      name: "StoryTime",
      iconSlug: "Book",
      itemCount: await prisma.learningContent.count({
        where: { subject: "StoryTime" },
      }),
    }, // If StoryTime is a subject
    {
      name: "QuizZone",
      iconSlug: "HelpCircle",
      itemCount: await prisma.learningContent.count({
        where: { subject: "QuizZone" },
      }),
    },
    // Add more, ensure iconSlugs match Lucide names
  ];
}
