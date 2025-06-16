// focusflare (main kid/parent app) / actions/leaderboard.actions.ts
"use server";

import prisma from "@/lib/db/prisma"; // Main app's prisma client
import { auth } from "@/lib/auth"; // Main app's auth
import { Role } from "@prisma/client";

export interface LeaderboardUser {
  id: string;
  rank?: number; // Will be assigned based on position
  displayName: string; // Child's username or name
  avatarUrl: string | null;
  points: number;
  // Potentially add: isCurrentUser: boolean (to highlight logged-in child)
}

const DEFAULT_LEADERBOARD_LIMIT = 10; // Show top 10 by default

// --- ACTION 1: Get Family Leaderboard ---
export async function getFamilyLeaderboard(): Promise<{
  leaderboard?: LeaderboardUser[];
  currentUserRank?: number;
  error?: string;
}> {
  const session = await auth();
  if (!session?.user) return { error: "User not authenticated." };

  let parentIdForFamily: string | null = null;

  // Determine the family:
  // If logged-in user is a CHILD, find their parent.
  // If logged-in user is a PARENT, use their ID.
  if (session.user.role === Role.CHILD) {
    const childLink = await prisma.parentChildLink.findFirst({
      where: { childId: session.user.id },
      select: { parentId: true },
    });
    if (childLink) {
      parentIdForFamily = childLink.parentId;
    } else {
      return { error: "Could not determine family." }; // Child not linked to parent
    }
  } else if (session.user.role === Role.PARENT) {
    parentIdForFamily = session.user.id;
  } else {
    return { error: "Leaderboard not applicable for this user role." };
  }

  if (!parentIdForFamily) return { error: "Family context not found." };

  try {
    // Find all children linked to this parent
    const childLinks = await prisma.parentChildLink.findMany({
      where: { parentId: parentIdForFamily },
      select: {
        child: {
          select: {
            id: true,
            username: true,
            name: true,
            avatarUrl: true,
            points: true,
          },
        },
      },
    });

    const familyMembers = childLinks.map((link) => link.child);

    // Sort by points descending
    const sortedFamily = familyMembers.sort((a, b) => b.points - a.points);

    let currentUserRank: number | undefined = undefined;
    const leaderboard: LeaderboardUser[] = sortedFamily.map((child, index) => {
      const rank = index + 1;
      if (child.id === session.user?.id) {
        currentUserRank = rank;
      }
      return {
        id: child.id,
        rank: rank,
        displayName: child.username || child.name || "Explorer",
        avatarUrl: child.avatarUrl,
        points: child.points,
      };
    });

    return { leaderboard, currentUserRank };
  } catch (error) {
    console.error("Error fetching family leaderboard:", error);
    return { error: "Failed to load family leaderboard." };
  }
}

// --- ACTION 2: Get Global Leaderboard ---
export async function getGlobalLeaderboard(
  limit: number = DEFAULT_LEADERBOARD_LIMIT
): Promise<{
  leaderboard?: LeaderboardUser[];
  currentUserData?: LeaderboardUser & { isRanked: boolean }; // Info about current user's rank
  error?: string;
}> {
  const session = await auth(); // To identify current user if logged in
  const currentUserId = session?.user?.id;

  try {
    // Fetch top N children by points
    const topChildrenDb = await prisma.user.findMany({
      where: {
        role: Role.CHILD,
        // Potentially add other filters, e.g., active in last X days
      },
      orderBy: { points: "desc" },
      take: limit,
      select: {
        id: true,
        username: true,
        name: true,
        avatarUrl: true,
        points: true,
      },
    });

    const leaderboard: LeaderboardUser[] = topChildrenDb.map(
      (child, index) => ({
        id: child.id,
        rank: index + 1,
        displayName: child.username || child.name || `Explorer #${index + 1}`, // Anonymize if needed
        avatarUrl: child.avatarUrl,
        points: child.points,
      })
    );

    let currentUserData: (LeaderboardUser & { isRanked: boolean }) | undefined =
      undefined;
    if (currentUserId) {
      const currentUserIsRanked = leaderboard.find(
        (u) => u.id === currentUserId
      );
      if (currentUserIsRanked) {
        currentUserData = { ...currentUserIsRanked, isRanked: true };
      } else {
        // Fetch current user's actual rank if not in top N
        const allChildrenSorted = await prisma.user.findMany({
          where: { role: Role.CHILD },
          orderBy: { points: "desc" },
          select: {
            id: true,
            username: true,
            name: true,
            avatarUrl: true,
            points: true,
          }, // Select all necessary fields
        });
        const currentUserIndex = allChildrenSorted.findIndex(
          (u) => u.id === currentUserId
        );
        if (currentUserIndex !== -1) {
          const userRecord = allChildrenSorted[currentUserIndex];
          currentUserData = {
            id: userRecord.id,
            rank: currentUserIndex + 1,
            displayName: userRecord.username || userRecord.name || "You",
            avatarUrl: userRecord.avatarUrl,
            points: userRecord.points,
            isRanked: true, // Ranked, just not in top N
          };
        } else {
          // User is a child but somehow not in the sorted list (should not happen)
          currentUserData = {
            id: currentUserId,
            displayName: "You",
            points: session?.user?.points || 0,
            avatarUrl: session?.user?.image || null,
            isRanked: false,
          };
        }
      }
    }

    return { leaderboard, currentUserData };
  } catch (error) {
    console.error("Error fetching global leaderboard:", error);
    return { error: "Failed to load global leaderboard." };
  }
}
