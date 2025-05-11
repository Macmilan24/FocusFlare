import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, Circle, BookOpen } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { getChildProgressDetails } from "@/actions/progress.actions";

interface ChildDetailPageProps {
  params: {
    childId: string;
  };
}

export default async function ChildDetailPage({
  params,
}: ChildDetailPageProps) {
  const session = await auth();
  if (!session?.user || session.user.role !== "PARENT") {
    redirect("/auth/signin");
  }

  const { childId } = params;
  const { data: progressDetails, error } = await getChildProgressDetails(
    childId
  );

  if (error || !progressDetails) {
    return (
      <div className="p-4 md:p-8 text-center">
        <Button
          asChild
          variant="outline"
          size="sm"
          className="mb-4 mr-auto block w-fit"
        >
          <Link href="/parent/home">
            <ArrowLeft className="mr-2 h-4 w-4" /> Parent Dashboard
          </Link>
        </Button>
        <h1 className="text-2xl font-bold text-red-500 mt-4">
          Error Loading Progress
        </h1>
        <p>{error || "Could not load details for this child."}</p>
      </div>
    );
  }

  const { child, stories, storyProgress } = progressDetails;
  const childName = child.name || child.username || "Child";

  return (
    <div className="space-y-8 p-4 md:p-6">
      <div>
        <Button asChild variant="outline" size="sm" className="mb-6">
          <Link href="/parent/home">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Parent Dashboard
          </Link>
        </Button>
        <h1 className="text-3xl font-bold">Progress Report for {childName}</h1>
        <p className="text-muted-foreground">@{child.username}</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Story Completions</CardTitle>
          <CardDescription>
            Overview of stories your child has engaged with.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {stories.length === 0 ? (
            <p className="text-muted-foreground">
              No stories currently available in the library.
            </p>
          ) : (
            <ul className="space-y-3">
              {stories.map((story) => {
                const progress = storyProgress.find(
                  (p) => p.contentId === story.id
                );
                const isCompleted = progress?.status === "completed";
                return (
                  <li
                    key={story.id}
                    className={`flex items-center justify-between p-4 border rounded-lg shadow-sm transition-all
                                                ${
                                                  isCompleted
                                                    ? "bg-green-50 dark:bg-green-900/30 border-green-200 dark:border-green-700"
                                                    : "bg-slate-50 dark:bg-slate-800"
                                                }`}
                  >
                    <div className="flex items-center">
                      <BookOpen
                        className={`mr-3 h-5 w-5 ${
                          isCompleted
                            ? "text-green-600"
                            : "text-muted-foreground"
                        }`}
                      />
                      <div>
                        <p className="font-medium">{story.title}</p>
                        {story.description && (
                          <p className="text-xs text-muted-foreground">
                            {story.description}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-col items-end text-xs">
                      {progress ? (
                        <>
                          {isCompleted ? (
                            <span className="flex items-center font-semibold text-green-600">
                              <CheckCircle2 className="mr-1 h-4 w-4" />{" "}
                              Completed
                            </span>
                          ) : (
                            <span className="flex items-center text-blue-600">
                              {/* Icon for 'in progress' if we track that later */}
                              In Progress
                            </span>
                          )}
                          {progress.completedAt && isCompleted && (
                            <span className="text-muted-foreground">
                              on{" "}
                              {new Date(
                                progress.completedAt
                              ).toLocaleDateString()}
                            </span>
                          )}
                        </>
                      ) : (
                        <span className="flex items-center text-muted-foreground">
                          <Circle className="mr-1 h-4 w-4" /> Not Started
                        </span>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </CardContent>
      </Card>

      {/* Placeholder for Quiz Performance Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Quiz Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Quiz scores and attempts will be shown here soon.
          </p>
        </CardContent>
      </Card>

      {/* Placeholder for Badges Earned Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Badges Earned</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Collected badges will appear here soon.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
