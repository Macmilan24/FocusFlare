import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getCourseDetails } from "@/actions/kid.actions"; // Adjust path
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  CheckCircle,
  PlayCircle,
  Lock,
  BarChartHorizontalBig,
} from "lucide-react"; // More icons
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ContentType } from "@prisma/client";
import * as LucideIcons from "lucide-react";

interface CourseDetailPageProps {
  params: { courseId: string };
}

// Helper to get content type icon
const getContentTypeIcon = (contentType: ContentType) => {
  switch (contentType) {
    case ContentType.STORY:
      return LucideIcons.BookHeart;
    case ContentType.QUIZ:
      return LucideIcons.Puzzle;
    case ContentType.LESSON:
      return LucideIcons.ClipboardList;
    case ContentType.GAME:
      return LucideIcons.Gamepad2;
    default:
      return LucideIcons.FileText;
  }
};

export default async function CourseDetailPage({
  params,
}: CourseDetailPageProps) {
  const session = await auth();
  if (!session?.user) redirect("/auth/signin");

  const { courseId } = params;
  const { courseDetails, error } = await getCourseDetails(courseId);

  if (error || !courseDetails) {
    return (
      <div className="p-6 md:p-8 text-center space-y-4">
        <Button
          asChild
          variant="outline"
          size="sm"
          className="mb-4 mr-auto block w-fit"
        >
          <Link href="/kid/courses">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Adventures
          </Link>
        </Button>
        <h1 className="text-2xl font-bold text-red-500 mt-4">
          Error Loading Adventure
        </h1>
        <p className="text-[hsl(var(--muted-kid-foreground))]">
          {error || "Could not load details for this learning adventure."}
        </p>
      </div>
    );
  }

  const { title, description, subject, coverImageUrl, items } = courseDetails;
  const totalItems = items.length;
  const completedItems = items.filter(
    (item) => item.status === "completed" || item.status === "passed"
  ).length;
  const courseProgressPercentage =
    totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;

  return (
    <div className="p-3 sm:p-4 md:p-6 space-y-8">
      <div className="mb-2">
        <Button
          asChild
          variant="ghost"
          size="sm"
          className="text-[hsl(var(--muted-kid-foreground))] hover:text-[hsl(var(--primary-kid))] -ml-2"
        >
          <Link href="/kid/courses">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to All Adventures
          </Link>
        </Button>
      </div>

      {/* Course Header Section */}
      <Card className="overflow-hidden shadow-xl border-2 border-[hsl(var(--primary-kid))]/30 bg-gradient-to-b from-[hsl(var(--card-kid))] to-[hsl(var(--muted-kid))]/30">
        <div className="grid md:grid-cols-3">
          {coverImageUrl && (
            <div className="md:col-span-1 relative min-h-[200px] md:min-h-full">
              <Image
                src={coverImageUrl}
                alt={title}
                layout="fill"
                objectFit="cover"
              />
            </div>
          )}
          <div
            className={`p-6 md:p-8 ${
              coverImageUrl ? "md:col-span-2" : "md:col-span-3"
            }`}
          >
            <Badge
              variant="secondary"
              className="mb-2 bg-[hsl(var(--accent-kid))]/80 text-[hsl(var(--accent-kid-foreground))]"
            >
              {subject}
            </Badge>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[hsl(var(--foreground-kid))] mb-3">
              {title}
            </h1>
            {description && (
              <p className="text-md text-[hsl(var(--muted-kid-foreground))] mb-6">
                {description}
              </p>
            )}

            <div className="space-y-2 mb-6">
              <div className="flex justify-between text-sm text-[hsl(var(--muted-kid-foreground))]">
                <span>Progress</span>
                <span>
                  {completedItems} / {totalItems} Activities
                </span>
              </div>
              <Progress
                value={courseProgressPercentage}
                className="h-3 bg-[hsl(var(--primary-kid))]/20 [&>div]:bg-[hsl(var(--primary-kid))]"
              />
            </div>
            {/* Find first non-completed item to link "Start/Continue Course" button */}
            {items.length > 0 && (
              <Button
                size="lg"
                asChild
                className="bg-[hsl(var(--primary-kid))] hover:bg-[hsl(var(--primary-kid))]/90 text-[hsl(var(--primary-kid-foreground))] text-lg px-8 py-3 shadow-lg hover:shadow-xl transition-shadow"
              >
                <Link
                  href={
                    items.find(
                      (item) =>
                        item.status !== "completed" && item.status !== "passed"
                    )?.link || items[0].link
                  }
                >
                  <PlayCircle className="mr-2 h-6 w-6" />
                  {completedItems === 0
                    ? "Start Adventure"
                    : completedItems === totalItems
                    ? "Review Adventure"
                    : "Continue Adventure"}
                </Link>
              </Button>
            )}
          </div>
        </div>
      </Card>

      {/* Course Content Items */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-[hsl(var(--foreground-kid))] flex items-center">
          <BarChartHorizontalBig className="mr-3 h-7 w-7 text-[hsl(var(--secondary-kid))]" />{" "}
          Adventure Steps
        </h2>
        {items.length === 0 && (
          <p className="text-[hsl(var(--muted-kid-foreground))]">
            No activities in this adventure yet.
          </p>
        )}
        <ul className="space-y-3">
          {items.map((item, index) => {
            const ItemIcon = getContentTypeIcon(item.contentType);
            const isLocked = false; // TODO: Implement prerequisite logic later
            const isCompleted =
              item.status === "completed" || item.status === "passed";
            // Determine if this is the next item to do
            const isCurrentNext =
              !isCompleted &&
              (index === 0 ||
                items[index - 1]?.status === "completed" ||
                items[index - 1]?.status === "passed");

            const itemContent = (
              <div
                className={`flex items-center justify-between p-4 rounded-xl border-2 transition-all duration-200
                                ${
                                  isLocked
                                    ? "bg-slate-100 dark:bg-slate-800 opacity-60 cursor-not-allowed border-slate-300 dark:border-slate-700"
                                    : "hover:shadow-md hover:border-[hsl(var(--primary-kid))]/70 dark:hover:bg-[hsl(var(--muted-kid))]/30"
                                }
                                ${
                                  isCompleted
                                    ? "bg-green-500/10 dark:bg-green-800/20 border-green-500/50"
                                    : "bg-[hsl(var(--card-kid))] border-[hsl(var(--border-kid))]"
                                }
                                ${
                                  isCurrentNext && !isCompleted
                                    ? "ring-2 ring-[hsl(var(--primary-kid))] ring-offset-2 ring-offset-[hsl(var(--background-kid))] shadow-lg"
                                    : ""
                                }
                              `}
              >
                <div className="flex items-center gap-3 sm:gap-4">
                  <div
                    className={`flex items-center justify-center h-10 w-10 rounded-full text-white ${
                      isCompleted
                        ? "bg-green-500"
                        : isCurrentNext
                        ? "bg-[hsl(var(--primary-kid))]"
                        : "bg-[hsl(var(--secondary-kid))]/70"
                    }`}
                  >
                    <ItemIcon className="h-5 w-5" />
                  </div>
                  <div>
                    <h3
                      className={`font-semibold text-md ${
                        isCompleted
                          ? "text-green-700 dark:text-green-300"
                          : isCurrentNext
                          ? "text-[hsl(var(--primary-kid))]"
                          : "text-[hsl(var(--card-foreground-kid))]"
                      }`}
                    >
                      {item.title}
                    </h3>
                    <p className="text-xs text-[hsl(var(--muted-kid-foreground))] capitalize">
                      {item.contentType.toLowerCase()}
                      {item.score !== null ? ` - Score: ${item.score}%` : ""}
                    </p>
                  </div>
                </div>
                {isCompleted && (
                  <CheckCircle className="h-6 w-6 text-green-500 flex-shrink-0" />
                )}
                {isCurrentNext && !isCompleted && (
                  <PlayCircle className="h-6 w-6 text-[hsl(var(--primary-kid))] flex-shrink-0 animate-pulse" />
                )}
                {isLocked && (
                  <Lock className="h-5 w-5 text-slate-500 flex-shrink-0" />
                )}
              </div>
            );

            return (
              <li key={item.id}>
                {isLocked ? (
                  <div
                    className="opacity-70 cursor-not-allowed"
                    title="Complete previous steps to unlock"
                  >
                    {itemContent}
                  </div>
                ) : (
                  <Link href={item.link || "#"} className="block">
                    {" "}
                    {/* item.link should be populated by getCourseDetails */}
                    {itemContent}
                  </Link>
                )}
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
