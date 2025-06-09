/* eslint-disable @typescript-eslint/no-unused-vars */
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
import { KidSidebar } from "./kid-sidebar";
import { CourseCard } from "./course-card";
import { UserDetailsPanel } from "./user-details-panel";
import { KidUserNav } from "./kid-user-nav";

// Updated props to include everything our new panel needs
interface KidHomeLayoutProps {
  kidData: KidData;
  continueAdventures: ContinueLearningItem[];
  recommendedItems: RecommendedItem[];
  subjectSections: Record<string, RecommendedItem[]>;
  dailyActivityData: DailyActivity[];
  selectedDate: Date;
  onDateChange: (date: Date) => void;
}

export default function KidHomeLayout({
  kidData,
  continueAdventures,
  recommendedItems,
  dailyActivityData,
  selectedDate,
  onDateChange,
}: KidHomeLayoutProps) {
  const [showUserDetails, setShowUserDetails] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <div className="min-h-screen w-full bg-slate-50 dark:bg-slate-900">
      <div className="flex h-screen">
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Header */}
          <header className="sticky top-0 z-30 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border-b dark:border-slate-800 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
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
              </div>
              <div className="flex items-center gap-2">
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
                <KidUserNav user={{ ...kidData, email: kidData.username }} />
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

          {/* Main Content Area */}
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

              {/* Your existing sections for learning content... */}
              {continueAdventures.length > 0 && (
                <section className="mb-8">
                  <h2 className="text-xl font-bold mb-4">Continue Learning</h2>
                  <div className="grid gap-4 grid-cols-[repeat(auto-fill,minmax(280px,1fr))]">
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
                  <div className="grid gap-4 grid-cols-[repeat(auto-fill,minmax(280px,1fr))]">
                    {recommendedItems.map((course) => (
                      <CourseCard key={course.id} course={course} />
                    ))}
                  </div>
                </section>
              )}
            </main>

            {/* The UserDetailsPanel now receives all the data it needs */}
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
