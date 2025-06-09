/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  getKidHomePageData,
  getKidGamificationStats,
} from "@/actions/kid.actions";
import type { KidData } from "@/types/kid";
import KidHomeLayout from "@/components/kid/kid-home-layout";

// A simple loading component
const LoadingState = () => (
  <div className="p-8 text-center text-lg text-muted-foreground">
    Loading dashboard...
  </div>
);

export default function KidHomePage() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [gamificationStats, setGamificationStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // This effect re-runs whenever the selectedDate changes
  useEffect(() => {
    setLoading(true);
    setError(null);
    const dateStr = selectedDate.toISOString();

    Promise.all([
      getKidHomePageData(), // This usually doesn't need to change with the date
      getKidGamificationStats(dateStr),
    ])
      .then(([homePageDataResult, gamificationStatsResult]) => {
        if (!homePageDataResult?.kidData?.id) {
          setError("Could not load kid's data. Please try again later.");
        } else {
          setDashboardData(homePageDataResult);
          setGamificationStats(gamificationStatsResult);
        }
      })
      .catch((err) => {
        console.error("Failed to load dashboard data:", err);
        setError("Failed to load dashboard data.");
      })
      .finally(() => {
        setLoading(false);
      });
  }, [selectedDate]); // Dependency array ensures this runs when date changes

  // useMemo helps prevent re-calculating this complex object on every render
  const fullKidData: KidData | null = useMemo(() => {
    if (!dashboardData?.kidData || !gamificationStats) return null;

    return {
      id: dashboardData.kidData.id,
      name: dashboardData.kidData.name || "Explorer",
      username: dashboardData.kidData.username,
      avatarUrl: dashboardData.kidData.avatarUrl,
      points: dashboardData.kidData.points ?? 0,
      dailyStreak: gamificationStats.dailyStreak ?? 0,
      badgesEarnedCount: gamificationStats.badgesEarnedCount ?? 0,
      coursesCompletedCount: gamificationStats.coursesCompletedCount ?? 0,
      coursesInProgressCount: gamificationStats.coursesInProgressCount ?? 0,
      rank: gamificationStats.rank ?? "Explorer",
      weeklyFocusHours: gamificationStats.weeklyFocusHours ?? 0,
      streakCalendar: gamificationStats.streakCalendar ?? Array(7).fill(false),
    };
  }, [dashboardData, gamificationStats]);

  if (loading && !fullKidData) {
    return <LoadingState />;
  }

  if (error) {
    return <div className="p-8 text-center text-red-500">{error}</div>;
  }

  if (!fullKidData) {
    return (
      <div className="p-8 text-center text-muted-foreground">
        No data available.
      </div>
    );
  }

  return (
    <KidHomeLayout
      kidData={fullKidData}
      continueAdventures={dashboardData.continueLearning || []}
      recommendedItems={dashboardData.recommendedItems || []}
      subjectSections={dashboardData.subjectSections || {}}
      dailyActivityData={gamificationStats?.dailyActivityChartData || []}
      selectedDate={selectedDate}
      onDateChange={setSelectedDate}
    />
  );
}
