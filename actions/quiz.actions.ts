/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";
import prisma from "@/lib/db/prisma";
import { auth } from "@/lib/auth";
import { Role, ContentType, Prisma, Badge } from "@prisma/client";
import type { QuizQuestion, QuizOption } from "./content.actions";
import { checkAndAwardQuizBadges } from "./gamification.actions";
import { revalidatePath } from "next/cache";

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
  pointsEarned?: number;
  newTotalPoints?: number;
  awardedBadge?: Badge | null;
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

  const POINTS_FOR_COMPLETING_QUIZ = 10;
  const BONUS_POINTS_FOR_PASSING_QUIZ = 15;

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
      /* ... scoring logic ... */
      const selectedOptionId = submittedAnswers[dbQuestion.id] || null;
      const isCorrect = selectedOptionId === dbQuestion.correctOptionId;
      if (isCorrect) correctAnswersCount++;
      return {
        questionId: dbQuestion.id,
        selectedOptionId,
        correctOptionId: dbQuestion.correctOptionId,
        isCorrect,
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
        : false; // Default to false if no threshold

    // 3. Calculate points earned for this attempt
    let pointsEarnedThisAttempt = POINTS_FOR_COMPLETING_QUIZ;
    if (passed) {
      pointsEarnedThisAttempt += BONUS_POINTS_FOR_PASSING_QUIZ;
    }

    // 4. Save to UserLearningProgress AND Update User Points (in a transaction)
    const progressStatus = passed ? "passed" : "failed";
    let finalUserPoints = session.user.points || 0; // Start with current session points as a baseline

    await prisma.$transaction(async (tx) => {
      // Fetch current points directly from DB inside transaction for accuracy
      const userForPoints = await tx.user.findUnique({
        where: { id: userId },
        select: { points: true },
      });
      const currentDbPoints = userForPoints?.points || 0;
      finalUserPoints = currentDbPoints + pointsEarnedThisAttempt;

      await tx.user.update({
        where: { id: userId },
        data: { points: finalUserPoints },
      });
      console.log(
        `[submitQuizAnswers] User ${userId} points updated to ${finalUserPoints}`
      );

      await tx.userLearningProgress.upsert({
        where: { userId_contentId: { userId, contentId: quizId } },
        update: {
          status: progressStatus,
          score: scorePercentage,
          answers: submittedAnswers as Prisma.JsonValue,
          details: JSON.parse(
            JSON.stringify(detailedResults)
          ) as Prisma.JsonValue,
          completedAt: new Date(),
          lastAccessed: new Date(),
        },
        create: {
          userId,
          contentId: quizId,
          status: progressStatus,
          score: scorePercentage,
          answers: submittedAnswers as Prisma.JsonValue,
          details: JSON.parse(
            JSON.stringify(detailedResults)
          ) as Prisma.JsonValue,
          completedAt: new Date(),
          startedAt: new Date(),
          lastAccessed: new Date(),
        },
      });
      console.log(
        `[submitQuizAnswers] User ${userId} progress for quiz ${quizId} saved. Status: ${progressStatus}, Score: ${scorePercentage}`
      );
    });

    const awardedBadge = await checkAndAwardQuizBadges(userId, passed);

    const submissionResultData: QuizSubmissionResult = {
      quizTitle: quizContentItem.title,
      scorePercentage,
      correctAnswers: correctAnswersCount,
      totalQuestions,
      results: detailedResults,
      passed,
      message: passed
        ? `Quiz Passed! +${pointsEarnedThisAttempt} Points!`
        : `Quiz Completed. +${pointsEarnedThisAttempt} Points! Keep it up!`,
      pointsEarned: pointsEarnedThisAttempt,
      newTotalPoints: finalUserPoints,
      awardedBadge,
    };

    revalidatePath("/kid/home"); // Revalidate kid's home to update points display
    revalidatePath(`/parent/children/${userId}/progress`); // Revalidate parent's view of this child's progress

    return { data: submissionResultData };
  } catch (error) {
    console.error(`Error submitting quiz ${quizId} for user ${userId}:`, error);
    return { error: "Failed to submit quiz answers." };
  }
}
