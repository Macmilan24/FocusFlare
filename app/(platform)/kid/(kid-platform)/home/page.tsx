"use client";
import React, { useState, useEffect, Suspense } from "react";

import {
  getKidHomePageData,
  getKidGamificationStats,
  getGradeLevels,
} from "@/actions/kid.actions";

import type { KidData } from "@/types/kid";
import KidHomeLayout from "@/components/kid/kid-home-layout";

const Loading = React.lazy(() => import("@/app/loading"));

export default function KidHomePage() {
  const [selectedGrade, setSelectedGrade] = useState<string>("all");
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [gamificationStats, setGamificationStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [gradeLevels, setGradeLevels] = useState<
    { id: string; name: string; description?: string }[]
  >([]);

  useEffect(() => {
    setLoading(true);
    setError(null);
    const gradeLevelId =
      selectedGrade && selectedGrade !== "all" ? selectedGrade : undefined;
    Promise.all([
      getKidHomePageData(gradeLevelId ? { gradeLevelId } : {}),
      getKidGamificationStats(),
    ])
      .then(([homePageDataResult, gamificationStatsResult]) => {
        if (!homePageDataResult?.kidData?.id) {
          setError("Could not load kid's data. Please try again later.");
          setLoading(false);
          return;
        }
        setDashboardData(homePageDataResult);
        setGamificationStats(gamificationStatsResult);
        setLoading(false);
      })
      .catch((err) => {
        setError("Failed to load dashboard data.");
        setLoading(false);
      });
  }, [selectedGrade]);

  useEffect(() => {
    getGradeLevels().then((grades) => {
      setGradeLevels(
        grades.map((g) => ({
          id: g.id,
          name: g.name,
          description: g.description ?? undefined,
        }))
      );
    });
  }, []);

  if (loading) {
    return (
      <Suspense
        fallback={
          <div className="p-8 text-center text-lg text-muted-kid-foreground">
            Loading...
          </div>
        }
      >
        <Loading />
      </Suspense>
    );
  }
  if (error) {
    return <div className="p-8 text-center text-red-500">{error}</div>;
  }

  const {
    kidData: baseKidData,
    continueLearning,
    recommendedItems,
    subjectSections,
  } = dashboardData;

  function safeString(val: unknown): string | undefined {
    return typeof val === "string" ? val : undefined;
  }

  let avatarUrl = [
    safeString(baseKidData.avatarUrl),
    safeString(baseKidData.image),
  ].find(Boolean) as string | undefined;
  if (avatarUrl === null) avatarUrl = undefined;

  const fullKidData = {
    id: baseKidData.id,
    name: baseKidData.name,
    username: baseKidData.username,
    avatarUrl,
    points: baseKidData.points,
    dailyStreak: gamificationStats?.dailyStreak ?? 0,
    goalsThisMonthCompleted: gamificationStats?.goalsThisMonthCompleted ?? 0,
    goalsThisMonthTotal: gamificationStats?.goalsThisMonthTotal ?? 0,
    badgesEarnedCount: gamificationStats?.badgesEarnedCount ?? 0,
    coursesCompletedCount: gamificationStats?.coursesCompletedCount ?? 0,
    coursesInProgressCount: gamificationStats?.coursesInProgressCount ?? 0,
    rank: gamificationStats?.rank ?? "Explorer",
    weeklyFocusHours: gamificationStats?.weeklyFocusHours ?? 0,
    streakCalendar: gamificationStats?.streakCalendar ?? Array(7).fill(false),
  } as KidData;

  return (
    <div>
      <KidHomeLayout
        kidData={fullKidData as KidData}
        continueAdventures={continueLearning || []}
        recommendedItems={recommendedItems || []}
        subjectSections={subjectSections || {}}
        selectedGrade={selectedGrade}
        onSelectGrade={setSelectedGrade}
      />
    </div>
  );
}
