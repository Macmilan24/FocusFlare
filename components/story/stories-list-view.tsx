// FILE: components/story/stories-list-view.tsx

"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Search, ImageOff } from "lucide-react";
import { useDebouncedCallback } from "use-debounce";

import { type StoryListItem } from "@/actions/content.actions";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Button } from "@/components/ui/button";

interface StoriesListViewProps {
  stories: StoryListItem[];
  availableSubjects: string[];
  totalPages: number;
  currentPage: number;
}

export default function StoriesListView({
  stories,
  availableSubjects,
  totalPages,
  currentPage,
}: StoriesListViewProps) {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { replace } = useRouter();

  const handleSearch = useDebouncedCallback((term: string) => {
    const params = new URLSearchParams(searchParams);
    params.set("page", "1");
    if (term) {
      params.set("query", term);
    } else {
      params.delete("query");
    }
    replace(`${pathname}?${params.toString()}`);
  }, 300);

  const handleSubjectChange = (subject: string) => {
    const params = new URLSearchParams(searchParams);
    params.set("page", "1");
    if (subject && subject !== "All Subjects") {
      params.set("subject", subject);
    } else {
      params.delete("subject");
    }
    replace(`${pathname}?${params.toString()}`);
  };

  const handlePageChange = (pageNumber: number) => {
    const params = new URLSearchParams(searchParams);
    if (pageNumber) {
      params.set("page", String(pageNumber));
    } else {
      params.delete("page");
    }
    replace(`${pathname}?${params.toString()}`);
  };

  const clearFilters = () => {
    replace(pathname);
  };

  return (
    <div className="container py-8">
      {/* Header Section */}
      <div className="text-center mb-8">
        <h1 className="font-extrabold tracking-tight text-4xl md:text-5xl mb-2">
          Story Time Adventures
        </h1>
        <p className="text-muted-foreground text-lg">
          Pick a new story and let your imagination soar!
        </p>
      </div>

      {/* Controls Bar */}
      <div className="flex flex-col md:flex-row gap-4 md:justify-between md:items-center mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search for a story..."
            className="pl-8"
            onChange={(e) => handleSearch(e.target.value)}
            defaultValue={searchParams.get("query")?.toString()}
          />
        </div>
        <Select
          onValueChange={handleSubjectChange}
          defaultValue={
            searchParams.get("subject")?.toString() || "All Subjects"
          }
        >
          <SelectTrigger className="w-full md:w-[200px]">
            <SelectValue placeholder="Filter by Subject" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="All Subjects">All Subjects</SelectItem>
            {availableSubjects.map((subject) => (
              <SelectItem key={subject} value={subject}>
                {subject}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {stories.length > 0 ? (
        <>
          {/* Story Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {stories.map((story) => (
              <Link
                href={`/kid/stories/${story.id}`}
                key={story.id}
                className="block"
              >
                <Card className="h-full overflow-hidden transition-all hover:shadow-lg hover:scale-[1.02]">
                  <div className="relative">
                    {story.coverImageUrl ? (
                      <div className="aspect-[4/3] relative">
                        <Image
                          src={story.coverImageUrl}
                          alt={story.title}
                          fill
                          className="object-cover"
                        />
                      </div>
                    ) : (
                      <div className="aspect-[4/3] bg-muted flex items-center justify-center">
                        <ImageOff className="h-12 w-12 text-muted-foreground" />
                      </div>
                    )}
                    {story.course && (
                      <Badge className="absolute top-2 right-2 bg-blue-100 text-blue-800 hover:bg-blue-200">
                        Part of: {story.course.title}
                      </Badge>
                    )}
                  </div>
                  <CardHeader>
                    <CardTitle>{story.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription>
                      {story.description || "A wonderful story awaits..."}
                    </CardDescription>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <Pagination className="mt-8">
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    onClick={() => handlePageChange(currentPage - 1)}
                    className={
                      currentPage === 1
                        ? "pointer-events-none opacity-50"
                        : "cursor-pointer"
                    }
                  />
                </PaginationItem>

                {/* Simplified Pagination Logic */}
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                  (page) => (
                    <PaginationItem key={page}>
                      <PaginationLink
                        onClick={() => handlePageChange(page)}
                        isActive={page === currentPage}
                        className={
                          page === currentPage
                            ? "bg-[#FF4500] text-white hover:bg-[#FF4500]/90 hover:text-white cursor-pointer"
                            : "cursor-pointer"
                        }
                      >
                        {page}
                      </PaginationLink>
                    </PaginationItem>
                  )
                )}

                <PaginationItem>
                  <PaginationNext
                    onClick={() => handlePageChange(currentPage + 1)}
                    className={
                      currentPage === totalPages
                        ? "pointer-events-none opacity-50"
                        : "cursor-pointer"
                    }
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          )}
        </>
      ) : (
        /* No Results State */
        <div className="flex flex-col items-center justify-center py-16">
          <Card className="max-w-md text-center p-6">
            <CardHeader>
              <CardTitle className="text-2xl">
                Oops! No stories found.
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-base mb-4">
                We couldn&apos;t find any stories matching your search. Try
                different keywords or clear your filters.
              </CardDescription>
              <Button
                onClick={clearFilters}
                className="bg-[#FF4500] hover:bg-[#FF4500]/90 text-white"
              >
                Clear Filters
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
