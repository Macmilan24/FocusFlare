"use client";

import Link from "next/link";
import Image from "next/image";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import * as LucideIcons from "lucide-react";
import { ContentType } from "@prisma/client";
import type { ContentCardItem } from "@/actions/kid.actions";

interface ContentDisplayCardProps {
  item: ContentCardItem;
}

// Use a named export
export function ContentDisplayCard({ item }: ContentDisplayCardProps) {
  let linkHref = "#";
  let IconType: LucideIcons.LucideIcon | undefined = undefined;
  if (item.contentType === ContentType.STORY) {
    linkHref = `/kid/stories/${item.id}`;
    IconType = LucideIcons.BookHeart;
  } else if (item.contentType === ContentType.QUIZ) {
    linkHref = `/kid/quizzes/${item.id}`;
    IconType = LucideIcons.Brain;
  } else if (item.contentType === ContentType.LESSON) {
    linkHref = `/kid/lessons/${item.id}`;
    IconType = LucideIcons.ClipboardList;
  } else if (item.contentType === ContentType.COURSE) {
    linkHref = `/kid/courses/${item.id}`;
    IconType = LucideIcons.LibraryBig;
  }
  // Add more content types as needed

  return (
    <Link href={linkHref} passHref className="block group h-full">
      <Card className="h-full flex flex-col overflow-hidden shadow-lg hover:shadow-xl dark:hover:shadow-[hsl(var(--primary-kid))]/30 transition-all duration-300 ease-in-out transform hover:-translate-y-1 focus-visible:ring-2 focus-visible:ring-[hsl(var(--ring-kid))] focus-visible:ring-offset-2 border-2 border-transparent hover:border-[hsl(var(--primary-kid))]/50 rounded-2xl bg-[hsl(var(--card-kid))] text-[hsl(var(--card-foreground-kid))] ">
        <div className="relative w-full h-36 sm:h-40">
          {item.coverImageUrl ? (
            <Image
              src={item.coverImageUrl}
              alt={item.title}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              style={{ objectFit: "cover" }}
              className="group-hover:scale-105 transition-transform duration-300 rounded-t-xl"
            />
          ) : (
            <div className="w-full h-full bg-[hsl(var(--muted-kid))]/60 flex items-center justify-center rounded-t-xl">
              {IconType ? (
                <IconType className="h-12 w-12 text-[hsl(var(--muted-kid-foreground))]/70" />
              ) : (
                <LucideIcons.Sparkles className="h-12 w-12 text-[hsl(var(--muted-kid-foreground))]/70" />
              )}
            </div>
          )}
          {item.contentType && (
            <Badge
              variant="secondary"
              className="absolute top-2 right-2 shadow capitalize bg-[hsl(var(--accent-kid))]/80 text-[hsl(var(--accent-kid-foreground))] text-xs px-2 py-0.5 backdrop-blur-sm rounded-full"
            >
              {item.contentType.toLowerCase().replace("_", " ")}
            </Badge>
          )}
        </div>
        <CardHeader className="pb-2 pt-3 px-3 sm:px-4">
          {item.courseTitle && (
            <p className="text-xs text-[hsl(var(--primary-kid))] font-semibold mb-0.5 line-clamp-1">
              {item.courseTitle}
            </p>
          )}
          <CardTitle className="text-sm sm:text-md font-bold leading-tight group-hover:text-[hsl(var(--primary-kid))] transition-colors line-clamp-2">
            {item.title}
          </CardTitle>
        </CardHeader>
        <CardContent className="px-3 sm:px-4 pb-3 flex-grow">
          {item.description && (
            <p className="text-xs sm:text-sm text-[hsl(var(--muted-kid-foreground))] line-clamp-2 sm:line-clamp-3">
              {item.description}
            </p>
          )}
          {item.progressPercentage !== undefined &&
            item.progressPercentage > 0 && ( // Only show if progress > 0
              <div className="mt-2">
                <Progress
                  value={item.progressPercentage}
                  className="h-1.5 bg-[hsl(var(--primary-kid))]/20 [&>div]:bg-[hsl(var(--primary-kid))]"
                />
              </div>
            )}
        </CardContent>
      </Card>
    </Link>
  );
}
