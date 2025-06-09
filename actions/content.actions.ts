"use server";
/* eslint-disable @typescript-eslint/no-explicit-any */
import prisma from "@/lib/db/prisma";
import { auth } from "@/lib/auth";
import { checkAndAwardStoryBadges } from "./gamification.actions";
import { ContentType, Role, Badge } from "@prisma/client";
import { revalidatePath } from "next/cache";

export interface StoryListItem {
  id: string;
  title: string;
  description: string | null;
  coverImageUrl?: string | null;
  course?: {
    id: string;
    title: string;
  } | null;
}

export interface StoryPageContent {
  id: string;
  title: string;
  pages: StoryPageData[];
  coverImageUrl?: string | null;
}

export interface MarkCompletionResult {
  success?: boolean;
  message?: string;
  error?: string;
  newPointsTotal?: number;
  awardedBadge?: Badge | null;
}
export interface StoryPageData {
  text: string;
  imageUrl?: string | null;
}

export interface QuizOption {
  id: string;
  text: string;
}

export interface QuizQuestion {
  id: string;
  text: string;
  options: QuizOption[];
  correctOptionId: string;
  explanation?: string | null;
}

export interface QuizData {
  id: string;
  title: string;
  description?: string | null;
  questions: QuizQuestion[];
  passingScorePercentage?: number | null;
}

export interface LessonBlock {
  id: string;
  type: "text" | "image" | "video";
  content?: string; // for text
  url?: string; // for image/video
  alt?: string; // for image
}

export interface LessonSection {
  id: string;
  title: string;
  blocks: LessonBlock[];
}

export interface LessonData {
  id: string;
  title: string;
  description?: string | null;
  sections: LessonSection[];
  courseId?: string; // <-- Add this field for course linkage
}

// --- Quiz Interfaces (No Changes) ---
export interface QuizListItem {
  id: string;
  title: string;
  description: string | null;
  questionCount?: number;
  coverImageUrl?: string | null;
  course?: {
    // NEW: Add optional course info
    id: string;
    title: string;
  } | null;
}

export interface QuizOption {
  id: string;
  text: string;
}

export interface QuizQuestion {
  id: string;
  text: string;
  options: QuizOption[];
  correctOptionId: string;
  explanation?: string | null;
}

export interface QuizData {
  id: string;
  title: string;
  description?: string | null;
  questions: QuizQuestion[];
  passingScorePercentage?: number | null;
}

export interface LessonBlock {
  id: string;
  type: "text" | "image" | "video";
  content?: string; // for text
  url?: string; // for image/video
  alt?: string; // for image
}

export interface LessonSection {
  id: string;
  title: string;
  blocks: LessonBlock[];
}

export interface LessonData {
  id: string;
  title: string;
  description?: string | null;
  sections: LessonSection[];
  courseId?: string; // <-- Add this field for course linkage
}

export async function getStorySubjects(): Promise<string[]> {
  try {
    const subjects = await prisma.learningContent.findMany({
      where: {
        contentType: ContentType.STORY,
      },
      distinct: ["subject"],
      select: {
        subject: true,
      },
      orderBy: {
        subject: "asc",
      },
    });
    return subjects.map((s) => s.subject);
  } catch (error) {
    console.error("Error fetching story subjects:", error);
    return [];
  }
}

export async function getStoriesList(params: {
  query?: string;
  subject?: string;
  page?: number;
  limit?: number;
}): Promise<{
  stories?: StoryListItem[];
  totalPages?: number;
  currentPage?: number;
  error?: string;
}> {
  const { query, subject, page = 1, limit = 8 } = params;

  try {
    const whereClause: any = {
      contentType: ContentType.STORY,
    };

    if (query) {
      whereClause.title = {
        contains: query,
        mode: "insensitive", // Case-insensitive search
      };
    }
    if (subject) {
      whereClause.subject = subject;
    }

    const totalStories = await prisma.learningContent.count({
      where: whereClause,
    });

    const storyContents = await prisma.learningContent.findMany({
      where: whereClause,
      orderBy: {
        createdAt: "desc", // Show newest first
      },
      skip: (page - 1) * limit,
      take: limit,
      select: {
        id: true,
        title: true,
        description: true,
        content: true,
        course: {
          // Include course data
          select: {
            id: true,
            title: true,
          },
        },
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
        course: item.course, // Add course data to the returned object
      };
    });

    return {
      stories,
      currentPage: page,
      totalPages: Math.ceil(totalStories / limit),
    };
  } catch (error) {
    console.error("Error fetching stories list:", error);
    return { error: "Failed to fetch stories." };
  }
}

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
      select: { id: true, title: true, content: true },
    });

    if (!contentItem) {
      return { error: "Story not found or is not a story." };
    }

    let parsedPages: StoryPageData[] = [];
    let coverImageUrl: string | null = null;

    if (contentItem.content && typeof contentItem.content === "object") {
      const contentJson = contentItem.content as any;

      if (
        "coverImageUrl" in contentJson &&
        typeof contentJson.coverImageUrl === "string"
      ) {
        coverImageUrl = contentJson.coverImageUrl;
      }

      if ("pages" in contentJson && Array.isArray(contentJson.pages)) {
        parsedPages = contentJson.pages
          .filter((page: any) => page && typeof page.text === "string")
          .map((page: any) => ({
            text: page.text,
            imageUrl:
              typeof page.imageUrl === "string" && page.imageUrl.trim() !== ""
                ? page.imageUrl
                : null,
          }));
      }
    }

    if (parsedPages.length === 0) {
      parsedPages = [
        {
          text: "This story seems to be missing its content or has a formatting issue.",
        },
      ];
    }

    const story: StoryPageContent = {
      id: contentItem.id,
      title: contentItem.title,
      pages: parsedPages,
      coverImageUrl: coverImageUrl,
    };

    return { story };
  } catch (error) {
    console.error(`Error fetching story by ID (${storyId}):`, error);
    return { error: "Failed to fetch story details." };
  }
}

export async function markStoryAsCompleted(
  contentId: string
): Promise<MarkCompletionResult> {
  const session = await auth();
  if (!session?.user || session.user.role !== Role.CHILD) {
    return { error: "Unauthorized." };
  }
  const userId = session.user.id;
  if (!contentId) return { error: "Content ID required." };

  const POINTS_FOR_STORY = 10;
  console.log(
    `[markStoryAsCompleted] User: ${userId}, Content: ${contentId}, Attempting to award: ${POINTS_FOR_STORY} points`
  );

  try {
    const resultInTransaction = await prisma.$transaction(async (tx) => {
      console.log("[Transaction] Upserting progress...");
      const progress = await tx.userLearningProgress.upsert({
        where: { userId_contentId: { userId, contentId } },
        update: {
          status: "completed",
          completedAt: new Date(),
          lastAccessed: new Date(),
        },
        create: {
          userId,
          contentId,
          status: "completed",
          completedAt: new Date(),
          startedAt: new Date(),
          lastAccessed: new Date(),
        },
        select: { status: true },
      });
      console.log("[Transaction] Progress upserted. Status:", progress.status);

      let finalPoints = 0;

      if (progress.status === "completed") {
        console.log(
          "[Transaction] Progress status is 'completed'. Fetching current user points..."
        );
        const userBeforePointUpdate = await tx.user.findUnique({
          where: { id: userId },
          select: { points: true },
        });

        if (!userBeforePointUpdate) {
          console.error(
            "[Transaction] CRITICAL: User not found during point update!"
          );
          throw new Error("User not found for point update.");
        }

        const currentPoints = userBeforePointUpdate.points || 0;
        console.log(
          "[Transaction] User current points BEFORE explicit update:",
          currentPoints
        );

        finalPoints = currentPoints + POINTS_FOR_STORY;
        console.log("[Transaction] Attempting to SET points to:", finalPoints);

        const updatedUser = await tx.user.update({
          where: { id: userId },
          data: {
            points: finalPoints,
          },
          select: { points: true },
        });
        console.log(
          "[Transaction] Points SET. New total points from DB:",
          updatedUser.points
        );
        finalPoints = updatedUser.points;
      } else {
        const currentUser = await tx.user.findUnique({
          where: { id: userId },
          select: { points: true },
        });
        finalPoints = currentUser?.points || 0;
        console.log(
          "[Transaction] Points not incremented (status not 'completed' in this upsert). Current points:",
          finalPoints
        );
      }
      return { newPointsTotal: finalPoints };
    });

    const awardedBadge = await checkAndAwardStoryBadges(userId);

    revalidatePath("/kid/home");

    return {
      success: true,
      message: `Story complete! +${POINTS_FOR_STORY} points! Your new total: ${resultInTransaction.newPointsTotal}.`,
      newPointsTotal: resultInTransaction.newPointsTotal,
      awardedBadge,
    };
  } catch (error) {
    console.error(
      `Error marking story ${contentId} completed for user ${userId}:`,
      error
    );
    return { error: "Failed to mark story as completed or award points." };
  }
}

// NEW: Helper function to get all unique subjects for quizzes
export async function getQuizSubjects(): Promise<string[]> {
  try {
    const subjects = await prisma.learningContent.findMany({
      where: {
        contentType: ContentType.QUIZ,
      },
      distinct: ["subject"],
      select: {
        subject: true,
      },
      orderBy: {
        subject: "asc",
      },
    });
    return subjects.map((s) => s.subject);
  } catch (error) {
    console.error("Error fetching quiz subjects:", error);
    return [];
  }
}

// UPDATED: getQuizzesList now supports search, filter, and pagination
export async function getQuizzesList(
  params: {
    query?: string;
    subject?: string;
    page?: number;
    limit?: number;
  } = {}
): Promise<{
  quizzes?: QuizListItem[];
  totalPages?: number;
  currentPage?: number;
  error?: string;
}> {
  const { query, subject, page = 1, limit = 8 } = params;

  try {
    const whereClause: any = {
      contentType: ContentType.QUIZ,
    };

    if (query) {
      whereClause.title = {
        contains: query,
        mode: "insensitive",
      };
    }
    if (subject) {
      whereClause.subject = subject;
    }

    const totalQuizzes = await prisma.learningContent.count({
      where: whereClause,
    });

    const quizContentItems = await prisma.learningContent.findMany({
      where: whereClause,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
      select: {
        id: true,
        title: true,
        description: true,
        content: true,
        coverImageUrl: true,
        course: {
          // Include course data
          select: {
            id: true,
            title: true,
          },
        },
      },
    });

    const quizzes: QuizListItem[] = quizContentItems.map((item) => {
      let questionCount = 0;
      if (item.content && typeof item.content === "object") {
        const contentJson = item.content as any;
        if (
          "questions" in contentJson &&
          Array.isArray(contentJson.questions)
        ) {
          questionCount = contentJson.questions.length;
        }
      }

      return {
        id: item.id,
        title: item.title,
        description: item.description,
        questionCount: questionCount,
        coverImageUrl: item.coverImageUrl,
        course: item.course, // Add course data
      };
    });

    return {
      quizzes,
      currentPage: page,
      totalPages: Math.ceil(totalQuizzes / limit),
    };
  } catch (error) {
    console.error("Error fetching quizzes list:", error);
    return { error: "Failed to fetch quizzes." };
  }
}

export async function getQuizById(
  quizId: string
): Promise<{ quiz?: QuizData; error?: string }> {
  if (!quizId) {
    return { error: "Quiz ID is required." };
  }

  try {
    const contentItem = await prisma.learningContent.findUnique({
      where: {
        id: quizId,
        contentType: ContentType.QUIZ,
      },
      select: {
        id: true,
        title: true,
        description: true,
        content: true,
      },
    });

    if (!contentItem) {
      return { error: "Quiz not found or is not a quiz." };
    }

    let questions: QuizQuestion[] = [];
    let passingScorePercentage: number | null = null;

    if (contentItem.content && typeof contentItem.content === "object") {
      const contentJson = contentItem.content as any;

      if (
        "passingScorePercentage" in contentJson &&
        typeof contentJson.passingScorePercentage === "number"
      ) {
        passingScorePercentage = contentJson.passingScorePercentage;
      }

      if ("questions" in contentJson && Array.isArray(contentJson.questions)) {
        questions = contentJson.questions
          .filter(
            (q: any) =>
              q &&
              typeof q.id === "string" &&
              typeof q.text === "string" &&
              Array.isArray(q.options) &&
              typeof q.correctOptionId === "string" &&
              q.options.every(
                (opt: any) =>
                  opt &&
                  typeof opt.id === "string" &&
                  typeof opt.text === "string"
              )
          )
          .map((q: any) => ({
            id: q.id,
            text: q.text,
            options: q.options.map((opt: any) => ({
              id: opt.id,
              text: opt.text,
            })),
            correctOptionId: q.correctOptionId,
            explanation:
              typeof q.explanation === "string" ? q.explanation : null,
          }));
      }
    }

    if (questions.length === 0) {
      console.warn(
        `Quiz ${contentItem.id} has missing or malformed question content.`
      );
      return { error: "Quiz content is invalid or missing questions." };
    }

    const quiz: QuizData = {
      id: contentItem.id,
      title: contentItem.title,
      description: contentItem.description,
      questions: questions,
      passingScorePercentage: passingScorePercentage,
    };

    return { quiz };
  } catch (error) {
    console.error(`Error fetching quiz by ID (${quizId}):`, error);
    return { error: "Failed to fetch quiz details." };
  }
}

export async function getLessonById(
  lessonId: string
): Promise<{ lesson?: LessonData; error?: string }> {
  if (!lessonId) {
    return { error: "Lesson ID is required." };
  }

  try {
    const contentItem = await prisma.learningContent.findUnique({
      where: {
        id: lessonId,
        contentType: ContentType.LESSON,
      },
      select: {
        id: true,
        title: true,
        description: true,
        content: true,
        courseId: true, // <-- Add this line
      },
    });

    if (!contentItem) {
      return { error: "Lesson not found or is not a lesson." };
    }

    let sections: LessonSection[] = [];

    if (contentItem.content && typeof contentItem.content === "object") {
      const contentJson = contentItem.content as any;

      if ("sections" in contentJson && Array.isArray(contentJson.sections)) {
        sections = contentJson.sections
          .filter(
            (s: any) =>
              s &&
              typeof s.id === "string" &&
              typeof s.title === "string" &&
              Array.isArray(s.blocks)
          )
          .map((s: any) => ({
            id: s.id,
            title: s.title,
            blocks: s.blocks
              .filter(
                (b: any) =>
                  b &&
                  typeof b.id === "string" &&
                  ["text", "image", "video"].includes(b.type)
              )
              .map((b: any) => ({
                id: b.id,
                type: b.type,
                content: b.content,
                url: b.url,
                alt: b.alt,
              })),
          }));
      }
    }

    if (sections.length === 0) {
      console.warn(
        `Lesson ${contentItem.id} has missing or malformed section content.`
      );
      return { error: "Lesson content is invalid or missing sections." };
    }

    const lesson: LessonData = {
      id: contentItem.id,
      title: contentItem.title,
      description: contentItem.description,
      sections: sections,
      courseId: contentItem.courseId, // <-- Add this line
    };

    return { lesson };
  } catch (error) {
    console.error(`Error fetching lesson by ID (${lessonId}):`, error);
    return { error: "Failed to fetch lesson details." };
  }
}
