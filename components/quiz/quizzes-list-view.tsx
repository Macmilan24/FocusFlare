// FILE: components/quiz/quizzes-list-view.tsx

"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Search, Puzzle } from "lucide-react";
import { useDebouncedCallback } from "use-debounce";

import { type QuizListItem } from "@/actions/content.actions";
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

// This is the "contract" for the props this component receives from its parent Server Component.
interface QuizzesListViewProps {
  quizzes: QuizListItem[];
  availableSubjects: string[];
  totalPages: number;
  currentPage: number;
}

// This component is now a "smart" client component that controls the UI based on URL state.
// It has no internal state for quizzes or loading; that's handled by the server.
export default function QuizzesListView({
  quizzes,
  availableSubjects,
  totalPages,
  currentPage,
}: QuizzesListViewProps) {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { replace } = useRouter();

  // Updates the URL with the search query, debounced for performance.
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

  // Updates the URL with the selected subject.
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

  // Updates the URL with the selected page number.
  const handlePageChange = (pageNumber: number) => {
    const params = new URLSearchParams(searchParams);
    params.set("page", String(pageNumber));
    replace(`${pathname}?${params.toString()}`);
  };

  // Clears all filters by navigating to the base path.
  const clearFilters = () => {
    replace(pathname);
  };

  return (
    <div className="container py-8">
      {/* Header Section */}
      <div className="text-center mb-8">
        <h1 className="font-extrabold tracking-tight text-4xl md:text-5xl mb-2">
          Quiz Zone
        </h1>
        <p className="text-muted-foreground text-lg">
          Challenge yourself and learn something new!
        </p>
      </div>

      {/* Controls Bar - now connected to URL state */}
      <div className="flex flex-col md:flex-row gap-4 md:justify-between md:items-center mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search for a quiz..."
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
            {/* Using real subjects from the backend */}
            {availableSubjects.map((subject) => (
              <SelectItem key={subject} value={subject}>
                {subject}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Renders quizzes if they exist, otherwise shows the "No results" card */}
      {quizzes.length > 0 ? (
        <>
          {/* Quiz Grid - uses data passed via props */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {quizzes.map((quiz) => (
              <Link
                href={`/kid/quizzes/${quiz.id}`}
                key={quiz.id}
                className="block"
              >
                <Card className="h-full overflow-hidden transition-all hover:shadow-lg hover:scale-[1.02]">
                  <div className="relative">
                    {quiz.coverImageUrl ? (
                      <div className="aspect-[4/3] relative">
                        <Image
                          src={quiz.coverImageUrl}
                          alt={quiz.title}
                          fill
                          className="object-cover"
                        />
                      </div>
                    ) : (
                      // --- THIS IS THE V0 DESIGN FOR THE PLACEHOLDER ---
                      <div className="aspect-[4/3] bg-purple-600 flex items-center justify-center">
                        <Puzzle className="h-16 w-16 text-white" />
                      </div>
                    )}

                    {/* --- THIS IS THE CORRECTED LOGIC FOR THE COURSE BADGE --- */}
                    {quiz.course && (
                      <Badge className="absolute top-2 right-2 bg-blue-100 text-blue-800 hover:bg-blue-200">
                        Part of: {quiz.course.title}
                      </Badge>
                    )}
                  </div>
                  <CardHeader>
                    <CardTitle>{quiz.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="mb-2">
                      {quiz.description || "An exciting challenge awaits!"}
                    </CardDescription>
                    {quiz.questionCount && quiz.questionCount > 0 && (
                      <p className="text-sm text-muted-foreground">
                        {quiz.questionCount} questions
                      </p>
                    )}
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
              <CardTitle className="text-2xl">No quizzes found</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-base mb-4">
                We couldn&apos;t find any quizzes matching your search. Try
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
