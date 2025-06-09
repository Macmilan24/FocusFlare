// FILE: app/kid/quizzes/page.tsx

import { Suspense } from "react";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getQuizzesList, getQuizSubjects } from "@/actions/content.actions";
import QuizzesListView from "@/components/quiz/quizzes-list-view";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Puzzle } from "lucide-react";

// This is the loading UI that will be shown while the server fetches data.
function QuizzesListSkeleton() {
  return (
    <div className="container py-8">
      <div className="text-center mb-8">
        <h1 className="font-extrabold tracking-tight text-4xl md:text-5xl mb-2">
          Quiz Zone
        </h1>
        <p className="text-muted-foreground text-lg">
          Challenge yourself and learn something new!
        </p>
      </div>
      <div className="flex flex-col md:flex-row gap-4 md:justify-between md:items-center mb-8">
        <Skeleton className="h-10 w-full md:flex-1" />
        <Skeleton className="h-10 w-full md:w-[200px]" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {Array.from({ length: 8 }).map((_, index) => (
          <Card key={index} className="overflow-hidden">
            <div className="aspect-[4/3] bg-purple-100 dark:bg-purple-900/20 flex items-center justify-center">
              <Puzzle className="h-16 w-16 text-purple-400 dark:text-purple-600" />
            </div>
            <CardHeader>
              <Skeleton className="h-6 w-3/4 mb-2" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-4/5" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

// This is the main page component. It's a Server Component.
export default async function QuizzesListPage({
  searchParams,
}: {
  searchParams?: {
    query?: string;
    subject?: string;
    page?: string;
  };
}) {
  const session = await auth();
  if (!session?.user) {
    redirect("/auth/signin");
  }

  // Read parameters from the URL
  const query = searchParams?.query || "";
  const subject = searchParams?.subject || "";
  const currentPage = Number(searchParams?.page) || 1;

  // Fetch data from server actions in parallel for efficiency
  const [quizzesData, availableSubjects] = await Promise.all([
    getQuizzesList({ query, subject, page: currentPage }),
    getQuizSubjects(),
  ]);

  const { quizzes, totalPages, error } = quizzesData;

  // Handle potential errors from the server action
  if (error) {
    return <div className="p-8 text-center text-red-500">Error: {error}</div>;
  }

  if (!quizzes) {
    return (
      <div className="p-8 text-center text-muted-foreground">
        Could not load quizzes.
      </div>
    );
  }

  // Render the Suspense boundary and the client component with the fetched data
  return (
    <Suspense
      key={query + subject + currentPage}
      fallback={<QuizzesListSkeleton />}
    >
      <QuizzesListView
        quizzes={quizzes}
        availableSubjects={availableSubjects}
        totalPages={totalPages || 1}
        currentPage={currentPage}
      />
    </Suspense>
  );
}
