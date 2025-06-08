import React, { useState } from "react";
import { Search, Bell, HelpCircle, ChevronRight, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { KidSidebar } from "./kid-sidebar";
import { CourseCard } from "./course-card";
import { UserDetailsPanel } from "./user-details-panel";
import { KidUserNav } from "./kid-user-nav";
import type {
  KidData,
  ContinueLearningItem,
  RecommendedItem,
} from "@/types/kid";

interface KidHomeLayoutProps {
  kidData: KidData;
  continueAdventures: ContinueLearningItem[];
  recommendedItems: RecommendedItem[];
  selectedGrade: string;
  onSelectGrade: (grade: string) => void;
}

const KidHomeLayout: React.FC<KidHomeLayoutProps> = ({
  kidData,
  continueAdventures,
  recommendedItems,
  selectedGrade,
  onSelectGrade,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [showUserDetails, setShowUserDetails] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Filter by grade for all sections (normalize grade values for comparison)
  const normalizeGrade = (grade: string | undefined) =>
    (grade || "")
      .toLowerCase()
      .replace(/\s+/g, "")
      .replace("grade", "grade ")
      .trim();

  const normalizedSelectedGrade = normalizeGrade(selectedGrade);

  const filteredContinueLearning =
    normalizedSelectedGrade === "grade all" || normalizedSelectedGrade === "all"
      ? continueAdventures
      : continueAdventures.filter(
          (course) =>
            normalizeGrade(course.gradeLevel) === normalizedSelectedGrade
        );
  const filteredRecommended =
    normalizedSelectedGrade === "grade all" || normalizedSelectedGrade === "all"
      ? recommendedItems
      : recommendedItems.filter(
          (course) =>
            normalizeGrade(course.gradeLevel) === normalizedSelectedGrade
        );
  const filteredAll = [...filteredContinueLearning, ...filteredRecommended];

  // Search filter (applies to all courses)
  const searchActive = searchQuery.trim().length > 0;
  const searchResults = searchActive
    ? filteredAll.filter(
        (course) =>
          course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (course.description || "")
            .toLowerCase()
            .includes(searchQuery.toLowerCase())
      )
    : [];

  return (
    <div className="min-h-screen flex w-full kids-pattern-bg relative">
      {/* Mobile Sidebar */}
      <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
        <SheetContent side="left" className="p-0 w-80">
          <KidSidebar />
        </SheetContent>
      </Sheet>

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-sm border-b border-orange-200 p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {/* Mobile Menu Button */}
              <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
                <SheetTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="lg:hidden text-primary-kid"
                  >
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
              </Sheet>

              <div className="relative hidden sm:block">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search here..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 w-48 md:w-64 bg-white border-orange-200 focus:border-primary-kid"
                />
              </div>

              <Select value={selectedGrade} onValueChange={onSelectGrade}>
                <SelectTrigger className="w-32 md:w-40 bg-white border-orange-200">
                  <SelectValue placeholder="All Grades" />
                </SelectTrigger>
                <SelectContent className="bg-white border-orange-200">
                  <SelectItem value="all">All Grades</SelectItem>
                  <SelectItem value="Grade 1">Grade 1</SelectItem>
                  <SelectItem value="Grade 2">Grade 2</SelectItem>
                  <SelectItem value="Grade 3">Grade 3</SelectItem>
                  <SelectItem value="Grade 4">Grade 4</SelectItem>
                  <SelectItem value="Grade 5">Grade 5</SelectItem>
                  <SelectItem value="Grade 6">Grade 6</SelectItem>
                  <SelectItem value="Grade 7">Grade 7</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                className="text-orange-600 hover:bg-orange-100"
              >
                <HelpCircle className="h-5 w-5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="text-orange-600 hover:bg-orange-100"
              >
                <Bell className="h-5 w-5" />
              </Button>

              {/* Show Details Button - moved to navbar */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowUserDetails(!showUserDetails)}
                className="text-primary-kid hover:bg-orange-100 hidden md:flex"
              >
                {showUserDetails ? "Hide Details" : "Show Details"}
              </Button>

              {/* Use KidUserNav for profile/avatar dropdown */}
              <KidUserNav
                user={{
                  name: kidData.name,
                  image: kidData.avatarUrl,
                  email: kidData.username || undefined,
                  username: kidData.username,
                  points: kidData.points,
                  id: kidData.id,
                }}
              />
            </div>
          </div>

          {/* Mobile Search */}
          <div className="relative mt-3 sm:hidden">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search here..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 w-full bg-white border-orange-200 focus:border-primary-kid"
            />
          </div>
        </header>

        {/* Main Content Container */}
        <div className="flex flex-1 overflow-hidden relative">
          {/* Main Content */}
          <main
            className={`flex-1 p-4 lg:p-6 overflow-y-auto transition-all duration-300 ${
              showUserDetails ? "lg:mr-80" : ""
            }`}
          >
            {/* Search Results Section */}
            {searchActive && (
              <section className="mb-6 lg:mb-8">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl lg:text-2xl font-bold text-gray-800">
                    Search Results
                  </h2>
                  <span className="text-sm text-gray-500">
                    {searchResults.length} found
                  </span>
                </div>
                {searchResults.length === 0 ? (
                  <div className="text-gray-500 text-center py-8">
                    No results found.
                  </div>
                ) : (
                  <div className="grid gap-4 lg:gap-6 min-w-0 overflow-x-auto grid-cols-[repeat(auto-fit,minmax(320px,1fr))]">
                    {searchResults.map((course) => (
                      <CourseCard key={course.id} course={course} />
                    ))}
                  </div>
                )}
              </section>
            )}

            {/* Continue Learning Section */}
            {!searchActive && filteredContinueLearning.length > 0 && (
              <section className="mb-6 lg:mb-8">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl lg:text-2xl font-bold text-gray-800">
                    Continue Learning
                  </h2>
                  {/* Mobile Show Details Button */}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowUserDetails(!showUserDetails)}
                    className="text-primary-kid hover:bg-orange-100 md:hidden"
                  >
                    {showUserDetails ? "Hide Details" : "Show Details"}
                  </Button>
                </div>
                <div className="grid gap-4 lg:gap-6 min-w-0 overflow-x-auto grid-cols-[repeat(auto-fit,minmax(320px,1fr))]">
                  {filteredContinueLearning.map((course) => (
                    <CourseCard key={course.id} course={course} />
                  ))}
                </div>
              </section>
            )}

            {/* Recommended Courses */}
            {!searchActive && filteredRecommended.length > 0 && (
              <section className="mb-6 lg:mb-8">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl lg:text-2xl font-bold text-gray-800">
                    Recommended Courses For You
                  </h2>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-primary-kid hover:bg-orange-100"
                  >
                    View All <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
                <div className="grid gap-4 lg:gap-6 min-w-0 overflow-x-auto grid-cols-[repeat(auto-fit,minmax(320px,1fr))]">
                  {filteredRecommended.map((course) => (
                    <CourseCard key={course.id} course={course} />
                  ))}
                </div>
              </section>
            )}

            {/* All Courses */}
            {!searchActive && (
              <section>
                <h2 className="text-xl lg:text-2xl font-bold text-gray-800 mb-4">
                  All Adventures
                </h2>
                <div className="grid gap-4 lg:gap-6 min-w-0 overflow-x-auto grid-cols-[repeat(auto-fit,minmax(320px,1fr))]">
                  {filteredAll.map((course) => (
                    <CourseCard key={course.id} course={course} />
                  ))}
                </div>
              </section>
            )}
          </main>

          {/* User Details Panel */}
          <UserDetailsPanel
            kidData={kidData}
            isOpen={showUserDetails}
            onClose={() => setShowUserDetails(false)}
          />
        </div>
      </div>
    </div>
  );
};

export default KidHomeLayout;
