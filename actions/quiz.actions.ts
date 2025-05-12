/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";
import prisma from "@/lib/db/prisma";
import { auth } from "@/lib/auth";
import { Role, ContentType, Prisma } from "@prisma/client";
import type { QuizQuestion, QuizOption } from "./content.actions";

export interface QuizSubmissionResult {
  scorePercentage: number;
  correctAnswers: number;
  totalQuestions: number;
  results: Array<{
    questionId: string;
    selectedOptionId: string | null;
    correctOptionId: string;
    isCorrect: boolean;
    explanation?: string | null;
    questionText: string; // For displaying on results
    options: QuizOption[]; // For displaying on results
  }>;
  passed?: boolean;
  message?: string;
  quizTitle?: string;
}

export async function submitQuizAnswers(
  quizId: string,
  submittedAnswers: { [questionId: string]: string } // questionId -> selectedOptionId
): Promise<{ data?: QuizSubmissionResult; error?: string }> {
  const session = await auth();
  if (!session?.user || session.user.role !== Role.CHILD) {
    return { error: "Unauthorized. Only children can submit quiz answers." };
  }
  const userId = session.user.id;

  if (!quizId || !submittedAnswers) {
    return { error: "Quiz ID and answers are required." };
  }

  try {
    // 1. Fetch the quiz from the database to get correct answers and structure
    const quizContentItem = await prisma.learningContent.findUnique({
      where: { id: quizId, contentType: ContentType.QUIZ },
      select: { title: true, content: true },
    });

    if (
      !quizContentItem ||
      !quizContentItem.content ||
      typeof quizContentItem.content !== "object"
    ) {
      return { error: "Quiz not found or content is invalid." };
    }

    const quizDbData = quizContentItem.content as any;
    const dbQuestions: QuizQuestion[] = (quizDbData.questions || []).filter(
      Boolean
    ) as QuizQuestion[];
    const passingScorePercentageDb =
      typeof quizDbData.passingScorePercentage === "number"
        ? quizDbData.passingScorePercentage
        : null;

    if (dbQuestions.length === 0) {
      return { error: "Quiz has no questions defined in the database." };
    }

    // 2. Score the quiz
    let correctAnswersCount = 0;
    const detailedResults = dbQuestions.map((dbQuestion) => {
      const selectedOptionId = submittedAnswers[dbQuestion.id] || null;
      const isCorrect = selectedOptionId === dbQuestion.correctOptionId;
      if (isCorrect) {
        correctAnswersCount++;
      }
      return {
        questionId: dbQuestion.id,
        selectedOptionId: selectedOptionId,
        correctOptionId: dbQuestion.correctOptionId,
        isCorrect: isCorrect,
        explanation: dbQuestion.explanation,
        questionText: dbQuestion.text,
        options: dbQuestion.options,
      };
    });

    const totalQuestions = dbQuestions.length;
    const scorePercentage =
      totalQuestions > 0
        ? Math.round((correctAnswersCount / totalQuestions) * 100)
        : 0;
    const passed =
      passingScorePercentageDb !== null
        ? scorePercentage >= passingScorePercentageDb
        : true;

    const submissionResultData: QuizSubmissionResult = {
      quizTitle: quizContentItem.title,
      scorePercentage,
      correctAnswers: correctAnswersCount,
      totalQuestions,
      results: detailedResults,
      passed,
      message: passed
        ? "Congratulations, you passed!"
        : "Good effort! Keep practicing.",
    };

    // 3. Save to UserLearningProgress
    const progressStatus = passed ? "passed" : "failed";

    await prisma.userLearningProgress.upsert({
      where: {
        userId_contentId: {
          userId: userId,
          contentId: quizId,
        },
      },
      update: {
        status: progressStatus,
        score: scorePercentage,
        answers: submittedAnswers as unknown as Prisma.JsonValue,
        details: detailedResults as unknown as Prisma.JsonValue,
        completedAt: new Date(),
        lastAccessed: new Date(),
      },
      create: {
        userId: userId,
        contentId: quizId,
        status: progressStatus,
        score: scorePercentage,
        answers: submittedAnswers as unknown as Prisma.JsonValue,
        details: detailedResults as unknown as Prisma.JsonValue,
        completedAt: new Date(),
        startedAt: new Date(),
        lastAccessed: new Date(),
      },
    });

    return { data: submissionResultData };
  } catch (error) {
    console.error(`Error submitting quiz ${quizId} for user ${userId}:`, error);
    return { error: "Failed to submit quiz answers." };
  }
}
