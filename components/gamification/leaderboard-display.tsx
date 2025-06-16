/* eslint-disable @typescript-eslint/no-unused-vars */
// focusflare (main app) / components/gamification/leaderboard-display.tsx
"use client";

import { LeaderboardUser } from "@/actions/leaderboard.actions"; // Adjust path
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Crown, Gem, Medal } from "lucide-react"; // Icons for ranks
import { cn } from "@/lib/utils";
import { useSession } from "next-auth/react";
import { Card } from "../ui/card";

// Default number of users to show in the leaderboard (adjust as needed)
const DEFAULT_LEADERBOARD_LIMIT = 10;

interface LeaderboardDisplayProps {
  title: string;
  users: LeaderboardUser[];
  currentUserData?: LeaderboardUser & { isRanked?: boolean }; // Highlight current user
  isFamily?: boolean;
}

export function LeaderboardDisplay({
  title,
  users,
  currentUserData,
  isFamily = false,
}: LeaderboardDisplayProps) {
  const { data: session } = useSession(); // For client-side check if needed, though currentUserData is better

  const getRankIcon = (rank?: number) => {
    if (rank === 1) return <Crown className="h-5 w-5 text-yellow-400" />;
    if (rank === 2) return <Medal className="h-5 w-5 text-slate-400" />; // Silver
    if (rank === 3) return <Medal className="h-5 w-5 text-orange-400" />; // Bronze
    return <span className="font-semibold text-sm">{rank}</span>;
  };

  return (
    <div className="w-full">
      <h2 className="text-2xl font-bold text-center mb-6 text-[hsl(var(--primary-kid))]">
        {title}
      </h2>
      {users.length === 0 ? (
        <p className="text-center text-muted-foreground">
          No players on the leaderboard yet. Start learning to get on the board!
        </p>
      ) : (
        <div className="rounded-lg border bg-[hsl(var(--card-kid))] shadow-md overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-[hsl(var(--muted-kid))]/50 hover:bg-[hsl(var(--muted-kid))]/70">
                <TableHead className="w-[60px] text-center font-semibold text-[hsl(var(--foreground-kid))]">
                  Rank
                </TableHead>
                <TableHead className="font-semibold text-[hsl(var(--foreground-kid))]">
                  Player
                </TableHead>
                <TableHead className="text-right font-semibold text-[hsl(var(--foreground-kid))]">
                  Points
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user, index) => {
                const isCurrentUser = user.id === session?.user?.id;
                return (
                  <TableRow
                    key={user.id}
                    className={cn(
                      "transition-colors hover:bg-[hsl(var(--accent-kid))]/10",
                      isCurrentUser &&
                        "bg-orange-100 border-l-4 border-orange-400"
                    )}
                  >
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center h-full">
                        {getRankIcon(user.rank)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <Avatar className="h-9 w-9 border-2 border-[hsl(var(--border-kid))]">
                          <AvatarImage
                            src={user.avatarUrl || undefined}
                            alt={user.displayName}
                          />
                          <AvatarFallback className="bg-[hsl(var(--secondary-kid))]/30 text-[hsl(var(--secondary-kid))] text-xs">
                            {user.displayName.substring(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <span
                          className={cn(
                            "font-medium",
                            isCurrentUser && "text-orange-500"
                          )}
                        >
                          {user.displayName}{" "}
                          {isCurrentUser && !isFamily && "(You)"}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end font-semibold text-lg text-[hsl(var(--accent-kid))]">
                        <Gem className="h-4 w-4 mr-1.5 opacity-80" />
                        {user.points}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Display current user's rank if they are not in the top list (for global leaderboard) */}
      {currentUserData &&
        !isFamily &&
        (!users.find((u) => u.id === currentUserData.id) ||
          users.length >= DEFAULT_LEADERBOARD_LIMIT) &&
        currentUserData.isRanked && (
          <Card className="mt-6 p-4 bg-[hsl(var(--primary-kid))]/10 border-[hsl(var(--primary-kid))]/30 text-center">
            <p className="text-sm font-medium text-[hsl(var(--primary-kid))]">
              Your current global rank is{" "}
              <span className="font-bold text-lg">#{currentUserData.rank}</span>{" "}
              with{" "}
              <span className="font-bold text-lg">
                {currentUserData.points}
              </span>{" "}
              points! Keep it up! 🚀
            </p>
          </Card>
        )}
    </div>
  );
}
