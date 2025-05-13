"use server";
/* eslint-disable @typescript-eslint/no-explicit-any */
import prisma from "@/lib/db/prisma";
import { auth } from "@/lib/auth";
import { ContentType, Role } from "@prisma/client";
import { revalidatePath } from "next/cache";

export interface StoryListItem {
  id: string;
  title: string;
  description: string | null;
  coverImageUrl?: string | null;
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
  newPointsTotal?: number; // Added to match the returned object
}
export interface StoryPageData {
  text: string;
  imageUrl?: string | null;
}

export interface QuizListItem {
  id: string;
  title: string;
  description: string | null;
  questionCount?: number;
  coverImageUrl?: string | null; // If quizzes can have cover images
}

// --- NEW QUIZ DETAIL INTERFACES ---
export interface QuizOption {
  id: string;
  text: string;
}

export interface QuizQuestion {
  id: string;
  text: string;
  options: QuizOption[];
  correctOptionId: string;
  explanation?: string | null; // Optional explanation for after submission
}

export interface QuizData {
  // Data structure for a single quiz
  id: string;
  title: string;
  description?: string | null;
  questions: QuizQuestion[];
  passingScorePercentage?: number | null;
  // coverImageUrl?: string | null; // If quizzes have cover images
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
      select: { id: true, title: true, content: true },
    });

    if (!contentItem) {
      return { error: "Story not found or is not a story." };
    }

    let parsedPages: StoryPageData[] = [];
    let coverImageUrl: string | null = null;

    if (contentItem.content && typeof contentItem.content === "object") {
      const contentJson = contentItem.content as any; // Cast for easier access

      if (
        "coverImageUrl" in contentJson &&
        typeof contentJson.coverImageUrl === "string"
      ) {
        coverImageUrl = contentJson.coverImageUrl;
      }

      if ("pages" in contentJson && Array.isArray(contentJson.pages)) {
        parsedPages = contentJson.pages
          .filter((page: any) => page && typeof page.text === "string") // Ensure page and text exist
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
      // Fallback if no valid pages found after parsing
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

// --- MARK STORY AS COMPLETED ACTION ---
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
        select: { status: true }, // Only need status for the condition
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
          throw new Error("User not found for point update."); // This will rollback the transaction
        }

        const currentPoints = userBeforePointUpdate.points || 0; // Default to 0 if points is null
        console.log(
          "[Transaction] User current points BEFORE explicit update:",
          currentPoints
        );

        finalPoints = currentPoints + POINTS_FOR_STORY;
        console.log("[Transaction] Attempting to SET points to:", finalPoints);

        const updatedUser = await tx.user.update({
          where: { id: userId },
          data: {
            points: finalPoints, // Explicitly SET the new total
          },
          select: { points: true },
        });
        console.log(
          "[Transaction] Points SET. New total points from DB:",
          updatedUser.points
        );
        finalPoints = updatedUser.points; // Update finalPoints with actual value from DB
      } else {
        // If progress status wasn't 'completed' (e.g., already completed before)
        // Fetch current points to return accurately
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

    revalidatePath("/kid/home");

    return {
      success: true,
      message: `Story complete! +${POINTS_FOR_STORY} points! Your new total: ${resultInTransaction.newPointsTotal}.`,
      newPointsTotal: resultInTransaction.newPointsTotal,
    };
  } catch (error) {
    console.error(
      `Error marking story ${contentId} completed for user ${userId}:`,
      error
    );
    return { error: "Failed to mark story as completed or award points." };
  }
}
// -- Quizzess List

export async function getQuizzesList(): Promise<{
  quizzes?: QuizListItem[];
  error?: string;
}> {
  try {
    const quizContentItems = await prisma.learningContent.findMany({
      where: {
        contentType: ContentType.QUIZ,
        subject: "QuizZone", // Or make subject dynamic
      },
      orderBy: {
        createdAt: "asc", // Or by title
      },
      select: {
        id: true,
        title: true,
        description: true,
        content: true, // To extract question count or cover image
      },
    });

    const quizzes: QuizListItem[] = quizContentItems.map((item) => {
      let questionCount = 0;
      let coverImageUrl: string | null = null;

      if (item.content && typeof item.content === "object") {
        const contentJson = item.content as any;
        if (
          "questions" in contentJson &&
          Array.isArray(contentJson.questions)
        ) {
          questionCount = contentJson.questions.length;
        }
        if (
          "coverImageUrl" in contentJson &&
          typeof contentJson.coverImageUrl === "string"
        ) {
          coverImageUrl = contentJson.coverImageUrl;
        }
      }

      return {
        id: item.id,
        title: item.title,
        description: item.description,
        questionCount: questionCount,
        coverImageUrl: coverImageUrl,
      };
    });

    return { quizzes };
  } catch (error) {
    console.error("Error fetching quizzes list:", error);
    return { error: "Failed to fetch quizzes." };
  }
}

// --- NEW SERVER ACTION: getQuizById ---
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
        contentType: ContentType.QUIZ, // Ensure it's a quiz
      },
      select: {
        id: true,
        title: true,
        description: true,
        content: true, // The JSON field containing quiz structure
      },
    });

    if (!contentItem) {
      return { error: "Quiz not found or is not a quiz." };
    }

    // --- Parse the JSON content into our QuizData structure ---
    let questions: QuizQuestion[] = [];
    let passingScorePercentage: number | null = null;
    // let coverImageUrl: string | null = null; // If you add this

    if (contentItem.content && typeof contentItem.content === "object") {
      const contentJson = contentItem.content as any; // Cast for easier access

      // if ('coverImageUrl' in contentJson && typeof contentJson.coverImageUrl === 'string') {
      //   coverImageUrl = contentJson.coverImageUrl;
      // }

      if (
        "passingScorePercentage" in contentJson &&
        typeof contentJson.passingScorePercentage === "number"
      ) {
        passingScorePercentage = contentJson.passingScorePercentage;
      }

      if ("questions" in contentJson && Array.isArray(contentJson.questions)) {
        questions = contentJson.questions
          .filter(
            (
              q: any // Basic validation for each question object
            ) =>
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
      // Fallback or error if no valid questions found
      console.warn(
        `Quiz ${contentItem.id} has missing or malformed question content.`
      );
      // Depending on requirements, you might return an error or an empty questions array
      return { error: "Quiz content is invalid or missing questions." };
    }

    const quiz: QuizData = {
      id: contentItem.id,
      title: contentItem.title,
      description: contentItem.description,
      questions: questions,
      passingScorePercentage: passingScorePercentage,
      // coverImageUrl: coverImageUrl,
    };

    return { quiz };
  } catch (error) {
    console.error(`Error fetching quiz by ID (${quizId}):`, error);
    return { error: "Failed to fetch quiz details." };
  }
}
