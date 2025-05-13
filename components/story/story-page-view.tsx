// components/story/story-page-view.tsx
"use client";

import { useState, useTransition } from "react";
// Ensure StoryPageContent and StoryPageData are imported or defined correctly
// from your actions/content.actions.ts
import { StoryPageContent, StoryPageData } from "@/actions/content.actions";
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
  ImageOff,
  Award, // Keep this if you want a placeholder for missing images
} from "lucide-react";
import Link from "next/link";
import { Progress } from "@/components/ui/progress";
import { markStoryAsCompleted } from "@/actions/content.actions";
import { refreshClientSession } from "@/actions/auth.actions";
import { toast } from "sonner";
import Image from "next/image"; // Import Next.js Image component

interface StoryPageViewProps {
  story: StoryPageContent; // This should now expect pages: StoryPageData[]
}

export default function StoryPageView({ story }: StoryPageViewProps) {
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [isCompleting, startCompletionTransition] = useTransition();

  const totalPages = story.pages.length;
  // currentPageData is now an object: { text: string, imageUrl?: string | null }
  const currentPageData: StoryPageData = story.pages[currentPageIndex];

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
        await refreshClientSession({ points: result.newPointsTotal });
      } else {
        toast.error(result.error || "Could not save your progress.", {
          icon: <AlertTriangle className="h-5 w-5" />,
          duration: 3000,
        });
      }
      if (result.awardedBadge) {
        toast.success(`🎉 Badge Unlocked: ${result.awardedBadge.name}!`, {
          description: result.awardedBadge.description,
          icon: <Award className="h-5 w-5 text-yellow-500" />, // Example icon
          duration: 5000,
        });
      }
    });
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-150px)] p-4 sm:p-6 md:p-8">
      {" "}
      {/* Added responsive padding */}
      <Card className="w-full max-w-3xl shadow-xl bg-card">
        {" "}
        {/* Increased max-width */}
        <CardHeader className="text-center border-b pb-4">
          {" "}
          {/* Added border-b */}
          <CardTitle className="text-2xl md:text-3xl font-bold">
            {story.title}
          </CardTitle>
          {/* Optional: Display Cover Image from story object if it exists */}
          {story.coverImageUrl && (
            <div className="mt-4 relative w-full h-40 md:h-56 rounded-md overflow-hidden">
              <Image
                src={story.coverImageUrl}
                alt={`${story.title} cover`}
                layout="fill"
                objectFit="cover"
              />
            </div>
          )}
          <div className="mt-4">
            {" "}
            {/* Wrapper for progress and page count */}
            <Progress
              value={progressPercentage}
              className="w-full mt-2 h-3" // Slightly thicker progress bar
              // color="bg-green-500" // shadcn Progress doesn't take color prop directly, style via CSS vars or className
            />
            <p className="text-sm text-muted-foreground mt-1">
              Page {currentPageIndex + 1} of {totalPages}
            </p>
          </div>
        </CardHeader>
        <CardContent className="p-4 sm:p-6 md:p-8">
          {" "}
          {/* Added responsive padding */}
          {/* Layout for image and text - image above text */}
          {currentPageData.imageUrl ? (
            <div className="mb-4 sm:mb-6 relative w-full h-48 sm:h-64 md:h-80 rounded-lg overflow-hidden shadow-md">
              <Image
                src={currentPageData.imageUrl}
                alt={`Illustration for page ${currentPageIndex + 1}`}
                layout="fill"
                objectFit="contain" // Or "cover"
                className="bg-slate-100 dark:bg-slate-800"
              />
            </div>
          ) : (
            // Optional: Show a placeholder if no image, or nothing
            <div className="mb-4 flex items-center justify-center h-48 sm:h-64 md:h-80 bg-slate-100 dark:bg-slate-800 rounded-lg">
              <ImageOff className="h-12 w-12 text-muted-foreground" />
            </div>
          )}
          {/* Apply prose classes for better text formatting if @tailwindcss/typography is installed */}
          <div className="prose dark:prose-invert max-w-none text-lg md:text-xl leading-relaxed whitespace-pre-line text-card-foreground/90">
            {currentPageData.text}
          </div>
        </CardContent>
        <CardFooter className="flex justify-between p-4 sm:p-6 border-t">
          {" "}
          {/* Added responsive padding */}
          <Button
            onClick={goToPreviousPage}
            disabled={isFirstPage || isCompleting}
            variant="outline"
            size="lg" // Made buttons larger
            className="px-6 py-3"
          >
            <ChevronLeft className="mr-2 h-5 w-5" /> Previous
          </Button>
          {isLastPage ? (
            <Button
              onClick={handleFinishStory}
              disabled={isCompleting}
              variant="default"
              size="lg"
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-3"
            >
              {isCompleting ? "Saving..." : "Finish Story"}
              <BookOpenCheck className="ml-2 h-5 w-5" />
            </Button>
          ) : (
            <Button
              onClick={goToNextPage}
              disabled={isLastPage || isCompleting}
              size="lg"
              className="px-6 py-3"
            >
              Next <ChevronRight className="ml-2 h-5 w-5" />
            </Button>
          )}
        </CardFooter>
      </Card>
      {isLastPage && (
        <Link
          href="/kid/stories"
          className="mt-8 inline-block text-primary hover:underline font-medium text-lg" // Made link text larger
        >
          ← Back to All Stories
        </Link>
      )}
    </div>
  );
}
