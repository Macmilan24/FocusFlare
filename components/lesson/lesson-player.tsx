"use client";

import { useState, useMemo, useEffect, useTransition } from "react";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  CircleDot,
  FileText,
  FileImage,
  Video,
  Menu,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

// Import the real data types from your actions file
import type { LessonData, LessonBlock } from "@/actions/content.actions";
import Link from "next/link";
import Image from "next/image";
import {
  updateLessonBlockProgress,
  completeLesson,
} from "@/actions/progress.actions";

// Define the component's props
interface LessonPlayerProps {
  lesson: LessonData;
  initialCompletedBlocks: string[]; // This will be used if you track block progress in the DB
}

export function LessonPlayer({
  lesson,
  initialCompletedBlocks,
}: LessonPlayerProps) {
  const router = useRouter();
  // State for tracking the currently active block
  const [activeBlockId, setActiveBlockId] = useState<string | null>(null);

  // State for managing the mobile navigation sheet
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

  // State to track completed blocks. A Set is more efficient for checking `has()`
  const [completedBlocks, setCompletedBlocks] = useState<Set<string>>(
    new Set(initialCompletedBlocks)
  );

  const [isPending, startTransition] = useTransition();

  // Memoize derived data to prevent re-calculating on every render
  const allBlocks = useMemo(
    () => lesson.sections.flatMap((section) => section.blocks),
    [lesson]
  );

  // Effect to set the initial active block once the data is loaded
  useEffect(() => {
    if (allBlocks.length > 0) {
      setActiveBlockId(allBlocks[0].id);
    }
  }, [allBlocks]);

  // Find the full object and index for the active block
  const activeBlockIndex = useMemo(
    () => allBlocks.findIndex((b) => b.id === activeBlockId),
    [allBlocks, activeBlockId]
  );
  const activeBlock = useMemo(
    () => allBlocks[activeBlockIndex],
    [allBlocks, activeBlockIndex]
  );

  // Handlers for navigation
  const handleNext = () => {
    if (!activeBlock) return;
    const currentBlockId = activeBlock.id;
    const isFinalBlock = activeBlockIndex === allBlocks.length - 1;

    // Optimistically update the UI state immediately
    setCompletedBlocks((prev) => new Set(prev).add(currentBlockId));

    // Move to the next block in the UI
    if (!isFinalBlock) {
      setActiveBlockId(allBlocks[activeBlockIndex + 1].id);
    }

    // Call server actions in a transition to avoid blocking the UI
    startTransition(async () => {
      // Action 1: Save the completion of the current block
      await updateLessonBlockProgress(lesson.id, currentBlockId);

      // Action 2: If this was the last block, complete the lesson and award points
      if (isFinalBlock) {
        const result = await completeLesson(lesson.id);
        if (result.success) {
          toast.success(result.message);
          // Redirect to course detail if courseId is present
          if (lesson.courseId) {
            setTimeout(() => {
              router.push(`/kid/courses/${lesson.courseId}`);
            }, 1200); // Give user a moment to see the toast
          }
        } else {
          toast.error(result.error);
        }
      }
    });
  };

  const handlePrev = () => {
    if (activeBlockIndex > 0) {
      setActiveBlockId(allBlocks[activeBlockIndex - 1].id);
    }
  };

  // Calculate overall progress
  const overallProgress =
    allBlocks.length > 0 ? (completedBlocks.size / allBlocks.length) * 100 : 0;

  // You can place this helper function at the top of your file or in a separate helpers file.
  function getEmbedUrl(url: string): {
    type: "youtube" | "direct";
    src: string;
  } {
    if (!url) {
      return { type: "direct", src: "" };
    }

    let videoId: string | null = null;

    // Regular youtube.com/watch?v=...
    const urlParams = new URLSearchParams(new URL(url).search);
    if (url.includes("youtube.com/watch")) {
      videoId = urlParams.get("v");
    }
    // Shortened youtu.be/...
    else if (url.includes("youtu.be")) {
      videoId = new URL(url).pathname.slice(1);
    }
    // Embed links youtube.com/embed/...
    else if (url.includes("youtube.com/embed")) {
      videoId = new URL(url).pathname.split("/")[2];
    }

    if (videoId) {
      return {
        type: "youtube",
        // Add privacy-enhanced mode and other useful params
        src: `https://www.youtube-nocookie.com/embed/${videoId}?rel=0&showinfo=0`,
      };
    }

    // If it's not a recognized YouTube URL, assume it's a direct video link (Cloudinary, etc.)
    return { type: "direct", src: url };
  }

  // --- RENDER FUNCTIONS AND JSX ---

  const renderBlockContent = (block: LessonBlock) => {
    if (!block) {
      return (
        <Card className="border-0 shadow-md">
          <CardContent className="flex items-center justify-center h-96">
            <p>Loading lesson content...</p>
          </CardContent>
        </Card>
      );
    }

    // A block title would be a great addition to your LessonBlock schema!
    // For now, we'll use a generic title based on type.
    const blockTitle = `${
      block.type.charAt(0).toUpperCase() + block.type.slice(1)
    } Block`;

    switch (block.type) {
      case "text":
        return (
          <Card className="border-0 shadow-md">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-slate-700 flex items-center gap-2">
                <FileText className="h-6 w-6 text-blue-500" />
                {blockTitle}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-lg leading-relaxed text-slate-600">
                {block.content}
              </p>
            </CardContent>
          </Card>
        );

      case "image":
        return (
          <Card className="border-0 shadow-md">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-slate-700 flex items-center gap-2">
                <FileImage className="h-6 w-6 text-green-500" />
                {blockTitle}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <AspectRatio
                ratio={16 / 9}
                className="bg-slate-100 rounded-lg overflow-hidden"
              >
                <Image
                  src={block.url || "/placeholder.svg"}
                  alt={block.alt || blockTitle}
                  fill
                  className="object-cover"
                />
              </AspectRatio>
            </CardContent>
            {block.alt && (
              <CardFooter>
                <p className="text-sm text-slate-500 text-center w-full">
                  {block.alt}
                </p>
              </CardFooter>
            )}
          </Card>
        );

      case "video":
        const video = getEmbedUrl(block.url || "");
        return (
          <Card className="border-0 shadow-md">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-slate-700 flex items-center gap-2">
                <Video className="h-6 w-6 text-purple-500" />
                {blockTitle}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <AspectRatio
                ratio={16 / 9}
                className="bg-slate-900 rounded-lg overflow-hidden flex items-center justify-center"
              >
                {/* ✨ Conditional rendering based on video type */}
                {video.type === "youtube" ? (
                  <iframe
                    src={video.src}
                    title={block.alt || lesson.title}
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="w-full h-full"
                  ></iframe>
                ) : (
                  <video src={video.src} controls className="w-full h-full">
                    Your browser does not support the video tag.
                  </video>
                )}
              </AspectRatio>
            </CardContent>
          </Card>
        );

      default:
        return null;
    }
  };

  const SidebarContent = () => (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b">
        <h3 className="font-bold text-lg text-slate-700">Lesson Content</h3>
      </div>
      <div className="flex-1 overflow-auto p-4">
        <Accordion
          type="multiple"
          defaultValue={[lesson.sections[0]?.id]}
          className="space-y-2"
        >
          {lesson.sections.map((section) => {
            const completedInSection = section.blocks.filter((b) =>
              completedBlocks.has(b.id)
            ).length;
            return (
              <AccordionItem
                key={section.id}
                value={section.id}
                className="border rounded-lg"
              >
                <AccordionTrigger className="px-4 py-3 hover:no-underline">
                  <div className="flex items-center justify-between w-full">
                    <span className="font-semibold text-slate-700 text-left">
                      {section.title}
                    </span>
                    <span className="text-sm text-slate-500 mr-2 shrink-0">
                      {completedInSection} / {section.blocks.length}
                    </span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-2 pb-2">
                  <div className="space-y-1">
                    {section.blocks.map((block) => (
                      <Button
                        key={block.id}
                        variant="ghost"
                        className={`w-full justify-start h-auto py-3 px-3 text-left ${
                          activeBlockId === block.id
                            ? "bg-blue-50 border border-blue-200"
                            : ""
                        }`}
                        onClick={() => {
                          setActiveBlockId(block.id);
                          setIsMobileNavOpen(false);
                        }}
                      >
                        <div className="flex items-center gap-3 w-full">
                          <div className="flex items-center gap-2">
                            {completedBlocks.has(block.id) ? (
                              <CheckCircle2 className="h-4 w-4 text-green-500" />
                            ) : activeBlockId === block.id ? (
                              <CircleDot className="h-4 w-4 text-blue-500" />
                            ) : (
                              <div className="h-4 w-4 rounded-full border-2 border-slate-300" />
                            )}
                            {block.type === "text" && (
                              <FileText className="h-4 w-4 text-slate-400" />
                            )}
                            {block.type === "image" && (
                              <FileImage className="h-4 w-4 text-slate-400" />
                            )}
                            {block.type === "video" && (
                              <Video className="h-4 w-4 text-slate-400" />
                            )}
                          </div>
                          <span className="text-sm font-medium text-slate-600 truncate">{`Block: ${block.id.slice(
                            -6
                          )}`}</span>
                          {activeBlockId === block.id && (
                            <Sparkles className="h-4 w-4 text-blue-500 ml-auto" />
                          )}
                        </div>
                      </Button>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
            );
          })}
        </Accordion>
      </div>
    </div>
  );

  return (
    <div
      className="min-h-screen bg-gradient-to-br from-orange-50 to-orange-100"
      style={{ fontFamily: "Poppins, sans-serif" }}
    >
      <header className="bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4 mb-4">
            <Button
              asChild
              variant="ghost"
              size="sm"
              className="text-slate-600"
            >
              <Link href="/kid/courses">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Courses
              </Link>
            </Button>
            <Sheet open={isMobileNavOpen} onOpenChange={setIsMobileNavOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm" className="md:hidden ml-auto">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Open Menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-80 p-0">
                <SidebarContent />
              </SheetContent>
            </Sheet>
          </div>
          <div className="space-y-3">
            <h1 className="text-3xl font-bold text-slate-800">
              {lesson.title}
            </h1>
            <p className="text-slate-600">{lesson.description}</p>
            <div className="space-y-2">
              <div className="flex justify-between text-sm text-slate-500">
                <span>Overall Progress</span>
                <span>{Math.round(overallProgress)}%</span>
              </div>
              <Progress
                value={overallProgress}
                className="h-2 bg-orange-100 [&>div]:bg-orange-400"
              />
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto flex">
        <aside className="hidden md:block w-80 h-[calc(100vh-210px)] sticky top-40 bg-white rounded-xl shadow-md m-4">
          <SidebarContent />
        </aside>

        <main className="flex-1 p-4 md:p-6 space-y-6">
          {renderBlockContent(activeBlock!)}

          <div className="flex justify-between items-center pt-6">
            <Button
              variant="outline"
              disabled={activeBlockIndex <= 0}
              onClick={handlePrev}
              className="rounded-xl"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Previous
            </Button>
            <Button
              onClick={handleNext}
              disabled={isPending}
              className="rounded-xl bg-orange-500 hover:bg-orange-600"
            >
              {isPending
                ? "Saving..."
                : activeBlockIndex === allBlocks.length - 1
                ? "Finish Lesson"
                : "Next Block"}
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </main>
      </div>
    </div>
  );
}
