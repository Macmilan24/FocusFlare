// components/story/story-page-view.tsx
"use client";

import { useState, useTransition } from "react"; // Added useTransition
import { StoryPageContent } from "@/actions/content.action";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChevronLeft,
  ChevronRight,
  BookOpenCheck,
  PartyPopper,
  AlertTriangle,
} from "lucide-react";
import Link from "next/link";
import { Progress } from "@/components/ui/progress";
import { markStoryAsCompleted } from "@/actions/content.action"; // Import the action
import { toast } from "sonner";

interface StoryPageViewProps {
  story: StoryPageContent;
}

export default function StoryPageView({ story }: StoryPageViewProps) {
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [isCompleting, startCompletionTransition] = useTransition();

  const totalPages = story.pages.length;
  const currentPageContent = story.pages[currentPageIndex];
  const isFirstPage = currentPageIndex === 0;
  const isLastPage = currentPageIndex === totalPages - 1;

  const goToNextPage = () => {
    if (!isLastPage) {
      setCurrentPageIndex((prev) => prev + 1);
    }
  };

  const goToPreviousPage = () => {
    if (!isFirstPage) {
      setCurrentPageIndex((prev) => prev - 1);
    }
  };

  const progressPercentage =
    totalPages > 0 ? ((currentPageIndex + 1) / totalPages) * 100 : 0;

  const handleFinishStory = () => {
    startCompletionTransition(async () => {
      const result = await markStoryAsCompleted(story.id);
      if (result.success) {
        toast.success(result.message || "Great job finishing the story!", {
          icon: <PartyPopper className="h-5 w-5" />,
          duration: 3000,
        });
      } else {
        toast.error(result.error || "Could not save your progress.", {
          icon: <AlertTriangle className="h-5 w-5" />,
          duration: 3000,
        });
      }
    });
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-150px)] p-4 md:p-8">
      <Card className="w-full max-w-2xl shadow-xl">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl md:text-3xl font-bold">
            {story.title}
          </CardTitle>
          <Progress
            value={progressPercentage}
            className="w-full mt-2 h-3"
            color="bg-green-500"
          />{" "}
          {/* Enhanced progress bar */}
          <p className="text-sm text-muted-foreground mt-1">
            Page {currentPageIndex + 1} of {totalPages}
          </p>
        </CardHeader>
        <CardContent className="min-h-[300px] md:min-h-[400px] text-lg md:text-xl leading-relaxed whitespace-pre-line p-6 bg-background rounded-b-md text-foreground/90">
          {currentPageContent}
        </CardContent>
        <CardFooter className="flex justify-between p-6 border-t">
          <Button
            onClick={goToPreviousPage}
            disabled={isFirstPage || isCompleting}
            variant="outline"
            size="lg"
          >
            <ChevronLeft className="mr-2 h-5 w-5" /> Previous
          </Button>
          {isLastPage ? (
            <Button
              onClick={handleFinishStory}
              disabled={isCompleting}
              variant="default"
              size="lg"
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              {isCompleting ? "Saving..." : "Finish Story"}
              <BookOpenCheck className="ml-2 h-5 w-5" />
            </Button>
          ) : (
            <Button
              onClick={goToNextPage}
              disabled={isLastPage || isCompleting}
              size="lg"
            >
              Next <ChevronRight className="ml-2 h-5 w-5" />
            </Button>
          )}
        </CardFooter>
      </Card>
      {isLastPage && (
        <Link
          href="/kid/stories"
          className="mt-6 inline-block text-primary hover:underline font-medium"
        >
          ← Back to All Stories
        </Link>
      )}
    </div>
  );
}
