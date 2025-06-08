import React from "react";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, Users, Star, BookOpen, Play } from "lucide-react";
import Link from "next/link";
import type { RecommendedItem } from "@/types/kid";

const borderColors = [
  "border-t-orange-400",
  "border-t-cyan-400",
  "border-t-blue-400",
  "border-t-green-400",
  "border-t-pink-400",
  "border-t-yellow-400",
  "border-t-purple-400",
];

const subjectEmojis = [
  "📚",
  "🧠",
  "📝",
  "🔬",
  "🎨",
  "🎵",
  "🔢",
  "🌟",
  "🚀",
  "💡",
  "🧩",
  "🏆",
  "🎯",
  "🧑‍🎓",
];

function getRandomFromArray<T>(arr: T[], seed: string) {
  // Simple seeded pseudo-random for consistent color/emoji per card
  let hash = 0;
  for (let i = 0; i < seed.length; i++)
    hash = (hash << 5) - hash + seed.charCodeAt(i);
  const idx = Math.abs(hash) % arr.length;
  return arr[idx];
}

function getTimeSince(date?: Date | string) {
  if (!date) return "2w";
  const now = new Date();
  const created = new Date(date);
  const diff = Math.max(0, now.getTime() - created.getTime());
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  if (days < 1) return "Today";
  if (days < 7) return `${days}d`;
  if (days < 30) return `${Math.floor(days / 7)}w`;
  return `${Math.floor(days / 30)}mo`;
}

// Map border-t-* to hover:bg-* for a bolder color on hover
const hoverBgMap: Record<string, string> = {
  "border-t-orange-400": "hover:bg-orange-500",
  "border-t-cyan-400": "hover:bg-cyan-500",
  "border-t-blue-400": "hover:bg-blue-500",
  "border-t-green-400": "hover:bg-green-500",
  "border-t-pink-400": "hover:bg-pink-500",
  "border-t-yellow-400": "hover:bg-yellow-500",
  "border-t-purple-400": "hover:bg-purple-500",
};

export const CourseCard = ({ course }: { course: RecommendedItem }) => {
  // Pick a border color and emoji based on course id for consistency
  const borderColor = getRandomFromArray(
    borderColors,
    course.id || course.title
  );
  const emoji = getRandomFromArray(subjectEmojis, course.id || course.title);
  const timeSince = getTimeSince(course.createdAt);
  const activities = course.lessonsCount || course.totalLessons || 1;
  const viewCount = Math.floor(
    200 +
      (Math.abs(Number(course.id.replace(/\D/g, ""))) % 800) +
      Math.random() * 100
  );
  const rating = (Math.random() * 1.5 + 3.5).toFixed(1);
  const progress = typeof course.progress === "number" ? course.progress : 0;
  const courseLink = course.slug
    ? `/kid/courses/${course.slug.replace("courses/", "")}`
    : `/kid/courses/${course.id}`;
  const isStarted = progress > 0;
  const buttonBg = borderColor.replace("border-t-", "bg-");
  const buttonHover = hoverBgMap[borderColor] || "hover:brightness-110";

  return (
    <Card
      className={`group border border-border rounded-xl bg-card shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-2 overflow-hidden w-full min-w-[260px] max-w-[360px] h-full flex flex-col border-t-4 ${borderColor}`}
    >
      {/* Top colored border, always visible, sits above card content */}
      <div className="pt-2">
        {" "}
        {/* Push content below the top border */}
        <CardHeader className="p-3 sm:p-4 pb-2 flex-shrink-0">
          <div className="flex items-start justify-between mb-3">
            {/* Subject Emoji */}
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-orange-50 flex items-center justify-center text-lg sm:text-2xl flex-shrink-0">
              {emoji}
            </div>
            {/* Grade Badge */}
            {course.gradeLevel && (
              <Badge
                variant="secondary"
                className="bg-orange-100 text-orange-700 border-orange-200 font-medium text-xs"
              >
                {course.gradeLevel}
              </Badge>
            )}
          </div>
          {/* Title and Description */}
          <div className="space-y-2 flex-grow">
            <h3 className="font-bold text-base sm:text-lg text-gray-800 line-clamp-2 group-hover:text-orange-400 transition-colors leading-tight">
              {course.title}
            </h3>
            {/* Always show description, even if empty string */}
            <p className="text-xs sm:text-sm text-gray-600 line-clamp-2 leading-relaxed">
              {course.description || "No description provided."}
            </p>
          </div>
        </CardHeader>
        <CardContent className="p-3 sm:p-4 pt-0 flex-grow flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-gray-500 mb-2 gap-2">
            <div className="flex items-center gap-1 min-w-0">
              <Clock className="h-3 w-3 flex-shrink-0" />
              <span className="truncate">{timeSince}</span>
            </div>
            <div className="flex items-center gap-1 min-w-0">
              <BookOpen className="h-3 w-3 flex-shrink-0" />
              <span className="truncate">{activities}</span>
            </div>
            <div className="flex items-center gap-1 min-w-0">
              <Users className="h-3 w-3 flex-shrink-0" />
              <span className="truncate">{viewCount}</span>
            </div>
            <div className="flex items-center gap-1 min-w-0">
              <Star className="h-3 w-3 fill-yellow-400 text-yellow-400 flex-shrink-0" />
              <span>{rating}</span>
            </div>
          </div>
          {/* Always show progress bar if progress is defined and > 0 */}
          {typeof progress === "number" && progress > 0 && (
            <div className="mb-2">
              <div className="flex justify-between text-xs text-gray-500 mb-1">
                <span>Progress</span>
                <span>{progress}%</span>
              </div>
              <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className={`h-2 rounded-full transition-all duration-300 ${borderColor.replace(
                    "border-t-",
                    "bg-"
                  )}`}
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
            </div>
          )}
          {/* Action Button - always visible, always clickable, colored */}
          <Link href={courseLink} passHref legacyBehavior>
            <Button
              className={`w-full rounded-lg font-semibold text-base mt-2 ${buttonBg} text-white transition-all pointer-events-auto ${buttonHover}`}
              size="lg"
              tabIndex={0}
              type="button"
            >
              <span className="flex items-center justify-center">
                <Play className="h-4 w-4 mr-2 flex-shrink-0" />
                <span className="truncate">
                  {isStarted ? "Continue Learning" : "Start Learning"}
                </span>
              </span>
            </Button>
          </Link>
        </CardContent>
      </div>
    </Card>
  );
};
