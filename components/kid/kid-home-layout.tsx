/* eslint-disable */
// FILE: components/kid/kid-home-layout.tsx

import React, { useState } from "react";
import { Search, Bell, HelpCircle, Menu } from "lucide-react";
import type {
  KidData,
  ContinueLearningItem,
  RecommendedItem,
  DailyActivity,
} from "@/types/kid";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { KidSidebar } from "./kid-sidebar";
import { CourseCard } from "./course-card";
import { UserDetailsPanel } from "./user-details-panel";
import { KidUserNav } from "./kid-user-nav";
import Loading from "@/app/loading";

// --- FIX: The props interface now correctly includes all expected props ---
interface KidHomeLayoutProps {
  kidData: KidData; // This already includes avatarUrl
  continueAdventures: ContinueLearningItem[];
  recommendedItems: RecommendedItem[];
  subjectSections: Record<string, RecommendedItem[]>;
  dailyActivityData: DailyActivity[];
  selectedDate: Date;
  onDateChange: (date: Date) => void;
  gradeLevels: { id: string; name: string }[];
  selectedGrade: string;
  onSelectGrade: (gradeId: string) => void;
  loading?: boolean;
}

export default function KidHomeLayout({
  kidData,
  continueAdventures,
  recommendedItems,
  subjectSections,
  dailyActivityData,
  selectedDate,
  onDateChange,
  gradeLevels,
  selectedGrade,
  onSelectGrade,
  loading = false,
}: KidHomeLayoutProps) {
  const [showUserDetails, setShowUserDetails] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const searchActive = searchQuery.trim().length > 0;

  // --- FIX: Explicitly type allItems to help TypeScript understand the combined array ---
  const allItems: (ContinueLearningItem | RecommendedItem)[] = [
    ...continueAdventures,
    ...recommendedItems,
    ...Object.values(subjectSections).flat(),
  ];

  // The type of searchResults is now correctly inferred
  const searchResults = searchActive
    ? allItems.filter(
        (item) =>
          item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (item.description || "")
            .toLowerCase()
            .includes(searchQuery.toLowerCase())
      )
    : [];

  return (
    <div className="min-h-screen w-full bg-slate-50 dark:bg-slate-900">
      <div className="flex h-screen">
        {/* ...existing sidebar... */}
        <div className="flex-1 flex flex-col overflow-hidden relative">
          {/* Loading overlay for grade selection/search */}
          {loading && (
            <div className="absolute inset-0 z-50 flex items-center justify-center bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
              <Loading />
            </div>
          )}
          {/* Hide header on small screens */}
          <header className="hidden md:flex sticky top-0 z-30 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border-b dark:border-slate-800 p-4">
            <div className="flex items-center w-full">
              <div className="flex items-center gap-2 min-w-0 flex-shrink-0">
                <Sheet>
                  <SheetTrigger asChild>
                    <Button variant="ghost" size="icon" className="lg:hidden">
                      <Menu className="h-5 w-5" />
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="left" className="p-0 w-64">
                    <KidSidebar />
                  </SheetContent>
                </Sheet>
                <div className="relative hidden sm:block">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search courses..."
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 w-48 md:w-64"
                  />
                </div>
                <Select value={selectedGrade} onValueChange={onSelectGrade}>
                  <SelectTrigger className="w-[150px] hidden md:flex">
                    <SelectValue placeholder="Filter by Grade" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Grades</SelectItem>
                    {gradeLevels.map((grade) => (
                      <SelectItem key={grade.id} value={grade.id}>
                        {grade.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center gap-2 ml-auto">
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-slate-500 hover:text-slate-900 dark:hover:text-white"
                >
                  <HelpCircle className="h-5 w-5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-slate-500 hover:text-slate-900 dark:hover:text-white"
                >
                  <Bell className="h-5 w-5" />
                </Button>
                {/* Pass the full kidData which includes avatarUrl */}
                <KidUserNav
                  user={{
                    ...kidData,
                    email: kidData.username || kidData.name,
                    image: kidData.avatarUrl,
                  }}
                />
                <Button
                  onClick={() => setShowUserDetails(true)}
                  variant="outline"
                  className="hidden lg:flex"
                >
                  My Profile
                </Button>
              </div>
            </div>
          </header>
          <div className="flex flex-1 overflow-hidden relative">
            <main className="flex-1 p-4 lg:p-6 overflow-y-auto">
              <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl lg:text-3xl font-bold text-slate-800 dark:text-slate-100">
                  Welcome back, {kidData.name}!
                </h1>
                <Button
                  onClick={() => setShowUserDetails(true)}
                  variant="link"
                  className="lg:hidden text-orange-500"
                >
                  View Profile
                </Button>
              </div>
              {searchActive ? (
                <section>
                  <h2 className="text-xl font-bold mb-4">
                    Search Results for "{searchQuery}"
                  </h2>
                  {searchResults.length > 0 ? (
                    <div className="grid gap-4 grid-cols-[repeat(auto-fill,minmax(280px,1fr))] justify-center">
                      {searchResults.map((item) => (
                        <CourseCard key={`${item.id}-search`} course={item} />
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground">
                      No adventures found.
                    </p>
                  )}
                </section>
              ) : (
                <>
                  {continueAdventures.length > 0 && (
                    <section className="mb-8">
                      <h2 className="text-xl font-bold mb-4">
                        Continue Learning
                      </h2>
                      <div className="grid gap-4 grid-cols-[repeat(auto-fill,minmax(280px,1fr))] justify-center">
                        {continueAdventures.map((course) => (
                          <CourseCard key={course.id} course={course} />
                        ))}
                      </div>
                    </section>
                  )}
                  {recommendedItems.length > 0 && (
                    <section className="mb-8">
                      <h2 className="text-xl font-bold mb-4">
                        Recommended For You
                      </h2>
                      <div className="grid gap-4 grid-cols-[repeat(auto-fill,minmax(280px,1fr))] justify-center">
                        {recommendedItems.map((course) => (
                          <CourseCard key={course.id} course={course} />
                        ))}
                      </div>
                    </section>
                  )}
                </>
              )}
            </main>
            <UserDetailsPanel
              kidData={kidData}
              dailyActivityData={dailyActivityData}
              isOpen={showUserDetails}
              onClose={() => setShowUserDetails(false)}
              selectedDate={selectedDate}
              onDateChange={onDateChange}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
