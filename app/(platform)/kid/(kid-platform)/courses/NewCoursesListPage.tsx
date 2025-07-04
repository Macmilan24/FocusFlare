"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { Search, Rocket, Map } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { AspectRatio } from "@/components/ui/aspect-ratio";

// Import our types and helpers
import type { CourseCardItem } from "@/actions/kid.actions";
import { getSubjectUI } from "@/lib/course-ui-helpers";

// Define the component props
interface NewCoursesListPageProps {
  courses: CourseCardItem[];
  error?: string;
}

export function NewCoursesListPage({
  courses,
  error,
}: NewCoursesListPageProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");
  const [visibleCount, setVisibleCount] = useState(6);

  // Extract all unique subjects from the available courses for the filter buttons
  const allSubjects = useMemo(
    () => ["All", ...Array.from(new Set(courses.map((c) => c.subject)))],
    [courses]
  );

  // Memoize the filtering logic for performance
  const filteredCourses = useMemo(() => {
    return courses.filter((course) => {
      const matchesSearch =
        course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (course.description || "")
          .toLowerCase()
          .includes(searchQuery.toLowerCase());
      const matchesFilter =
        activeFilter === "All" || course.subject === activeFilter;
      return matchesSearch && matchesFilter;
    });
  }, [courses, searchQuery, activeFilter]);

  const coursesToShow = filteredCourses.slice(0, visibleCount);
  const hasMoreCourses = visibleCount < filteredCourses.length;

  if (error) {
    return <div className="p-8 text-center text-red-500">Error: {error}</div>;
  }

  // --- JSX Starts Here ---

  return (
    <div
      className="min-h-screen bg-gradient-to-br from-white to-orange-50"
      style={{ fontFamily: "Nunito, sans-serif" }}
    >
      <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
        <header className="text-center">
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-lg inline-block">
            <div className="flex flex-col items-center space-y-4">
              <Map className="h-20 w-20 text-orange-400" />
              <h1 className="text-4xl md:text-6xl font-black bg-gradient-to-r from-orange-500 to-pink-500 text-transparent bg-clip-text">
                Learning Adventures
              </h1>
              <p className="text-lg text-orange-500 max-w-2xl">
                Choose your next journey and start exploring! 🚀
              </p>
            </div>
          </div>
        </header>

        <div className="flex flex-col md:flex-row gap-4 items-center justify-center">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-orange-300" />
            <Input
              placeholder="Search for adventures..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 pr-4 py-3 rounded-full border-2 border-orange-200 focus:ring-orange-400 focus:border-orange-400 text-lg"
            />
          </div>
          <div className="flex flex-wrap gap-2 justify-center">
            {allSubjects.map((subject) => (
              <Button
                key={subject}
                variant={activeFilter === subject ? "default" : "outline"}
                onClick={() => setActiveFilter(subject)}
                className={`rounded-full font-semibold transition-all duration-200 ${
                  activeFilter === subject
                    ? "bg-orange-500 text-white hover:bg-orange-600 shadow-lg"
                    : "border-orange-200 text-orange-600 hover:bg-orange-50"
                }`}
              >
                {subject}
              </Button>
            ))}
          </div>
        </div>

        {courses.length === 0 ? (
          <div className="text-center py-16">
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-lg inline-block">
              <Map className="h-16 w-16 text-orange-200 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-orange-600 mb-2">
                No Adventures Yet!
              </h3>
              <p className="text-orange-500">
                Check back soon for new and exciting courses!
              </p>
            </div>
          </div>
        ) : filteredCourses.length === 0 ? (
          <div className="text-center py-16">
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-lg inline-block">
              <Search className="h-16 w-16 text-orange-200 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-orange-600 mb-2">
                No Adventures Found
              </h3>
              <p className="text-orange-500">
                Try adjusting your search or filter to discover new learning
                adventures!
              </p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {coursesToShow.map((course) => (
              <CourseDisplayCard key={course.id} course={course} />
            ))}
          </div>
        )}

        {hasMoreCourses && (
          <div className="text-center">
            <Button
              size="lg"
              onClick={() => setVisibleCount((prev) => prev + 6)}
              className="bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 text-white font-bold rounded-2xl px-8 py-4 shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <Rocket className="h-5 w-5 mr-2" />
              Load More Adventures!
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

function CourseDisplayCard({ course }: { course: CourseCardItem }) {
  const { Icon } = getSubjectUI(course.subject);

  return (
    <Link href={`/kid/courses/${course.id}`} className="block h-full">
      <Card className="group rounded-3xl border-2 border-orange-100 bg-white hover:scale-105 hover:shadow-xl transition-all duration-300 overflow-hidden h-full flex flex-col">
        <CardHeader className="p-0">
          <AspectRatio ratio={16 / 9} className="overflow-hidden bg-orange-50">
            {course.coverImageUrl ? (
              <Image
                src={course.coverImageUrl}
                alt={course.title}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-300"
              />
            ) : (
              <div className="flex items-center justify-center w-full h-full bg-orange-50">
                <Icon className="h-12 w-12 text-orange-200" />
              </div>
            )}
          </AspectRatio>
        </CardHeader>
        <CardContent className="p-6 space-y-4 flex-grow flex flex-col">
          <div className="space-y-2">
            <Badge className="bg-orange-50 text-orange-600 border border-orange-100 font-semibold">
              {course.subject}
            </Badge>
            <CardTitle className="text-xl font-extrabold text-slate-800 group-hover:text-orange-500 transition-colors">
              {course.title}
            </CardTitle>
          </div>
          <CardDescription className="text-slate-600 text-sm leading-relaxed flex-grow">
            {course.description}
          </CardDescription>
        </CardContent>
        <CardFooter className="p-6 pt-0 mt-auto">
          <div className="w-full">
            <div className="flex items-center text-xs text-orange-400 mb-4">
              <Rocket className="h-4 w-4 mr-2" />
              {course.itemCount} activities
            </div>
            <Button
              size="lg"
              className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-2xl shadow hover:shadow-lg transition-all duration-200"
              asChild
            >
              <span>Explore</span>
            </Button>
          </div>
        </CardFooter>
      </Card>
    </Link>
  );
}
