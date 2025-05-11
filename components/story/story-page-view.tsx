// components/story/story-page-view.tsx
"use client";

import { useState } from "react";
import { StoryPageContent } from "@/actions/content.action"; // Adjust path
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ChevronLeft, ChevronRight, BookOpenCheck } from "lucide-react";
import Link from "next/link";
import { Progress } from "@/components/ui/progress";

interface StoryPageViewProps {
  story: StoryPageContent;
}

export default function StoryPageView({ story }: StoryPageViewProps) {
  const [currentPageIndex, setCurrentPageIndex] = useState(0);

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

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-150px)] p-4 md:p-8">
      {" "}
      {/* Adjust min-h as needed */}
      <Card className="w-full max-w-2xl shadow-xl">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl md:text-3xl font-bold">
            {story.title}
          </CardTitle>
          <Progress value={progressPercentage} className="w-full mt-2 h-2" />
          <p className="text-sm text-muted-foreground mt-1">
            Page {currentPageIndex + 1} of {totalPages}
          </p>
        </CardHeader>
        <CardContent className="min-h-[300px] md:min-h-[400px] text-lg md:text-xl leading-relaxed whitespace-pre-line p-6 bg-slate-50 dark:bg-slate-800 rounded-b-md">
          {/* whitespace-pre-line will respect newlines in your story text */}
          {currentPageContent}
        </CardContent>
        <CardFooter className="flex justify-between p-4 border-t">
          <Button
            onClick={goToPreviousPage}
            disabled={isFirstPage}
            variant="outline"
          >
            <ChevronLeft className="mr-2 h-5 w-5" /> Previous
          </Button>
          {isLastPage ? (
            <Link href="/kid/stories" passHref>
              <Button
                variant="default"
                className="bg-green-500 hover:bg-green-600 text-white"
              >
                Finish Story <BookOpenCheck className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          ) : (
            <Button onClick={goToNextPage} disabled={isLastPage}>
              Next <ChevronRight className="ml-2 h-5 w-5" />
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}
