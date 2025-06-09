// FILE: app/kid/stories/page.tsx

import { Suspense } from "react";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getStoriesList, getStorySubjects } from "@/actions/content.actions";
import StoriesListView from "@/components/story/stories-list-view";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

// Loading Skeleton Component
function StoriesListSkeleton() {
  return (
    <div className="container py-8">
      <div className="text-center mb-8">
        <h1 className="font-extrabold tracking-tight text-4xl md:text-5xl mb-2">
          Story Time Adventures
        </h1>
        <p className="text-muted-foreground text-lg">
          Pick a new story and let your imagination soar!
        </p>
      </div>
      <div className="flex flex-col md:flex-row gap-4 md:justify-between md:items-center mb-8">
        <Skeleton className="h-10 w-full md:flex-1" />
        <Skeleton className="h-10 w-full md:w-[200px]" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {Array.from({ length: 8 }).map((_, index) => (
          <Card key={index} className="overflow-hidden">
            <Skeleton className="h-48 w-full" />
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

export default async function StoriesListPage({
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

  const query = searchParams?.query || "";
  const subject = searchParams?.subject || "";
  const currentPage = Number(searchParams?.page) || 1;

  // Fetch data in parallel
  const [storiesData, availableSubjects] = await Promise.all([
    getStoriesList({ query, subject, page: currentPage }),
    getStorySubjects(),
  ]);

  const { stories, totalPages, error } = storiesData;

  if (error) {
    return <div className="p-8 text-center text-red-500">Error: {error}</div>;
  }

  if (!stories) {
    return (
      <div className="p-8 text-center text-muted-foreground">
        Could not load stories.
      </div>
    );
  }

  return (
    <Suspense
      key={query + subject + currentPage}
      fallback={<StoriesListSkeleton />}
    >
      <StoriesListView
        stories={stories}
        availableSubjects={availableSubjects}
        totalPages={totalPages || 1}
        currentPage={currentPage}
      />
    </Suspense>
  );
}
