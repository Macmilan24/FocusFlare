"use server";

import { auth } from "@/lib/auth";
import prisma from "@/lib/db/prisma";
import { Badge, ContentType } from "@prisma/client";

export interface EarnedBadge extends Omit<Badge, "userBadges" | "criteria"> {
  earnedAt: Date;
}

async function awardBadgeToUser(
  userId: string,
  badgeName: string
): Promise<Badge | null> {
  try {
    const badge = await prisma.badge.findUnique({ where: { name: badgeName } });
    if (!badge) {
      console.warn(`Badge "${badgeName}" not found in database.`);
      return null;
    }

    const existingUserBadge = await prisma.userBadge.findUnique({
      where: { userId_badgeId: { userId, badgeId: badge.id } },
    });

    if (!existingUserBadge) {
      await prisma.userBadge.create({
        data: { userId, badgeId: badge.id },
      });
      console.log(`Awarded badge "${badgeName}" to user ${userId}`);
      return badge;
    }
    return null;
  } catch (error) {
    console.error(
      `Error awarding badge "${badgeName}" to user ${userId}:`,
      error
    );
    return null;
  }
}

export async function checkAndAwardStoryBadges(
  userId: string
): Promise<Badge | null> {
  const completedStoriesCount = await prisma.userLearningProgress.count({
    where: {
      userId,
      status: "completed",
      content: { contentType: ContentType.STORY },
    },
  });

  if (completedStoriesCount >= 1) {
    const newlyAwardedBadge = await awardBadgeToUser(userId, "Story Novice");
    if (newlyAwardedBadge) return newlyAwardedBadge;
  }

  if (completedStoriesCount >= 3) {
    const newlyAwardedBadge = await awardBadgeToUser(
      userId,
      "Bookworm Beginner"
    );
    if (newlyAwardedBadge) return newlyAwardedBadge;
  }

  return null;
}

export async function checkAndAwardQuizBadges(
  userId: string,
  quizPassed: boolean
): Promise<Badge | null> {
  const completedQuizzesCount = await prisma.userLearningProgress.count({
    where: {
      userId,
      content: { contentType: ContentType.QUIZ },
    },
  });

  if (completedQuizzesCount >= 1) {
    const newlyAwardedBadge = await awardBadgeToUser(userId, "Quiz Challenger");
    if (newlyAwardedBadge) return newlyAwardedBadge;
  }

  if (quizPassed) {
    const passedQuizzesCount = await prisma.userLearningProgress.count({
      where: {
        userId,
        content: { contentType: ContentType.QUIZ },
        status: "passed",
      },
    });
    if (passedQuizzesCount >= 3) {
      const newlyAwardedBadge = await awardBadgeToUser(userId, "Puzzle Pro");
      if (newlyAwardedBadge) return newlyAwardedBadge;
    }
  }
  return null;
}

export async function getEarnedBadgesForUser(
  userId?: string
): Promise<{ badges?: EarnedBadge[]; error?: string }> {
  let targetUserId = userId;
  if (!targetUserId) {
    const session = await auth();
    if (!session?.user) return { error: "User not authenticated." };
    targetUserId = session.user.id;
  }

  if (!targetUserId) return { error: "User ID not provided." };

  try {
    const userBadges = await prisma.userBadge.findMany({
      where: { userId: targetUserId },
      orderBy: { earnedAt: "desc" },
      include: {
        badge: true,
      },
    });

    const badges: EarnedBadge[] = userBadges.map((ub) => ({
      ...ub.badge,
      earnedAt: ub.earnedAt,
    }));

    return { badges };
  } catch (error) {
    console.error(`Error fetching badges for user ${targetUserId}:`, error);
    return { error: "Failed to fetch earned badges." };
  }
}
