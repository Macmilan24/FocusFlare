// FILE: components/story/story-viewer.tsx

"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import Link from "next/link";
import { toast } from "sonner";
import {
  Award,
  BookOpenCheck,
  ChevronLeft,
  ChevronRight,
  ImageOff,
  Loader2,
} from "lucide-react";

import { StoryPageContent } from "@/actions/content.actions";
import { markStoryAsCompleted } from "@/actions/content.actions";
import { refreshClientSession } from "@/actions/auth.actions";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface StoryViewerProps {
  story: StoryPageContent;
  courseId?: string;
}

export default function StoryViewer({ story, courseId }: StoryViewerProps) {
  const [currentPage, setCurrentPage] = useState(0);
  const [isCompleting, startCompletionTransition] = useTransition();

  const totalPages = story.pages.length;
  const isFirstPage = currentPage === 0;
  const isLastPage = currentPage === totalPages - 1;
  const progressPercentage =
    totalPages > 0 ? ((currentPage + 1) / totalPages) * 100 : 0;

  const handlePrevious = () => {
    if (!isFirstPage) setCurrentPage(currentPage - 1);
  };

  const handleNext = () => {
    if (!isLastPage) setCurrentPage(currentPage + 1);
  };

  const handleFinishStory = () => {
    startCompletionTransition(async () => {
      const result = await markStoryAsCompleted(story.id);
      if (result.success) {
        toast.success(result.message || "Great job finishing the story!", {
          icon: <BookOpenCheck className="h-5 w-5" />,
        });
        // We only refresh the session if there's a new point total
        if (result.newPointsTotal) {
          await refreshClientSession({ points: result.newPointsTotal });
        }
      } else {
        toast.error(result.error || "Could not save your progress.");
      }
      // Show badge toast separately for more impact
      if (result.awardedBadge) {
        toast.success(`🎉 Badge Unlocked: ${result.awardedBadge.name}!`, {
          description: result.awardedBadge.description,
          icon: <Award className="h-5 w-5 text-yellow-500" />,
          duration: 5000,
        });
      }
    });
  };

  const currentPageData = story.pages[currentPage];

  const backLinkHref = courseId ? `/kid/courses/${courseId}` : "/kid/stories";
  const backLinkText = courseId ? "← Back to Course" : "← Back to All Stories";

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-4 flex flex-col items-center justify-center">
      <Card className="w-full max-w-4xl shadow-xl">
        <CardHeader className="text-center space-y-4 border-b pb-6">
          <CardTitle className="text-3xl md:text-4xl font-bold">
            {story.title}
          </CardTitle>
          <div className="space-y-2">
            <Progress
              value={progressPercentage}
              className="h-3 [&>div]:bg-[#FF4500]"
            />
            <p className="text-muted-foreground text-sm">
              Page {currentPage + 1} of {totalPages}
            </p>
          </div>
        </CardHeader>

        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
            {/* Image Column */}
            <div className="order-2 md:order-1">
              <div className="aspect-square bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden border">
                {currentPageData.imageUrl ? (
                  <Image
                    src={currentPageData.imageUrl}
                    alt={`Story illustration for page ${currentPage + 1}`}
                    width={400}
                    height={400}
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-gray-400">
                    <ImageOff className="w-16 h-16 mb-2" />
                    <p className="text-sm text-center px-4">
                      No illustration for this page
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Text Column */}
            <div className="order-1 md:order-2">
              <div className="prose prose-lg max-w-none dark:prose-invert">
                <p className="text-xl leading-relaxed whitespace-pre-line">
                  {currentPageData.text}
                </p>
              </div>
            </div>
          </div>
        </CardContent>

        <CardFooter className="flex justify-between items-center p-6 border-t">
          <Button
            variant="outline"
            size="lg"
            onClick={handlePrevious}
            disabled={isFirstPage || isCompleting}
          >
            <ChevronLeft className="mr-2 w-4 h-4" /> Previous
          </Button>

          {isLastPage ? (
            <Button
              size="lg"
              onClick={handleFinishStory}
              disabled={isCompleting}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              {isCompleting ? (
                <>
                  <Loader2 className="mr-2 w-4 h-4 animate-spin" /> Saving...
                </>
              ) : (
                <>
                  Finish Story <BookOpenCheck className="ml-2 w-4 h-4" />
                </>
              )}
            </Button>
          ) : (
            <Button
              size="lg"
              onClick={handleNext}
              disabled={isCompleting}
              className="bg-[#FF4500] hover:bg-[#FF4500]/90 text-white"
            >
              Next <ChevronRight className="ml-2 w-4 h-4" />
            </Button>
          )}
        </CardFooter>
      </Card>

      <div className="mt-6">
        <Link
          href={backLinkHref}
          className="text-muted-foreground hover:text-primary transition-colors"
        >
          {backLinkText}
        </Link>
      </div>
    </div>
  );
}
