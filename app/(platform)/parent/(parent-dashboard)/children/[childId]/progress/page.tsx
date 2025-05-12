import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  ArrowLeft,
  CheckCircle2,
  Circle,
  BookOpen,
  HelpCircle,
  Percent,
  Star,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { getChildProgressDetails } from "@/actions/progress.actions";
import { ContentType } from "@prisma/client";

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
  const { data: fullProgressDetails, error } = await getChildProgressDetails(
    childId
  );

  if (error || !fullProgressDetails) {
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

  const { child, progressItems } = fullProgressDetails;
  const childName = child.name || child.username || "Child";

  const storiesProgress = progressItems.filter(
    (item) => item.contentType === ContentType.STORY
  );
  const quizzesProgress = progressItems.filter(
    (item) => item.contentType === ContentType.QUIZ
  );

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

      {/* Story Completions Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl flex items-center">
            <BookOpen className="mr-3 h-6 w-6 text-blue-500" />
            Story Progress
          </CardTitle>
          <CardDescription>
            Overview of stories your child has engaged with.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {storiesProgress.length === 0 ? (
            <p className="text-muted-foreground">
              No story progress recorded yet.
            </p>
          ) : (
            <ul className="space-y-3">
              {storiesProgress.map((item) => (
                <li
                  key={item.contentId}
                  className={`flex items-center justify-between p-4 border rounded-lg shadow-sm transition-all
                                                  ${
                                                    item.status === "completed"
                                                      ? "bg-green-50 dark:bg-green-900/30 border-green-200 dark:border-green-700"
                                                      : "bg-slate-50 dark:bg-slate-800"
                                                  }`}
                >
                  <p className="font-medium">{item.contentTitle}</p>
                  <div className="flex flex-col items-end text-xs">
                    {item.status === "completed" ? (
                      <span className="flex items-center font-semibold text-green-600">
                        <CheckCircle2 className="mr-1 h-4 w-4" /> Completed
                      </span>
                    ) : (
                      <span className="flex items-center text-muted-foreground">
                        <Circle className="mr-1 h-4 w-4" />{" "}
                        {item.status || "Not Started"}
                      </span>
                    )}
                    {item.completedAt && item.status === "completed" && (
                      <span className="text-muted-foreground">
                        on {new Date(item.completedAt).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      {/* Quiz Performance Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl flex items-center">
            <HelpCircle className="mr-3 h-6 w-6 text-purple-500" />
            Quiz Performance
          </CardTitle>
          <CardDescription>Scores and attempts for quizzes.</CardDescription>
        </CardHeader>
        <CardContent>
          {quizzesProgress.length === 0 ? (
            <p className="text-muted-foreground">
              No quiz attempts recorded yet.
            </p>
          ) : (
            <ul className="space-y-3">
              {quizzesProgress.map((item) => (
                <li
                  key={item.contentId}
                  className={`flex items-center justify-between p-4 border rounded-lg shadow-sm transition-all
                                                  ${
                                                    item.status === "passed"
                                                      ? "bg-green-50 dark:bg-green-900/30 border-green-200 dark:border-green-700"
                                                      : item.status === "failed"
                                                      ? "bg-red-50 dark:bg-red-900/30 border-red-200 dark:border-red-700"
                                                      : "bg-slate-50 dark:bg-slate-800"
                                                  }`}
                >
                  <p className="font-medium">{item.contentTitle}</p>
                  <div className="flex flex-col items-end text-xs">
                    {item.score !== null && item.score !== undefined && (
                      <span
                        className={`flex items-center font-semibold ${
                          item.status === "passed"
                            ? "text-green-600"
                            : "text-red-600"
                        }`}
                      >
                        <Percent className="mr-1 h-4 w-4" /> {item.score}%
                      </span>
                    )}
                    <span
                      className={`font-medium capitalize ${
                        item.status === "passed"
                          ? "text-green-600"
                          : item.status === "failed"
                          ? "text-red-600"
                          : "text-muted-foreground"
                      }`}
                    >
                      {item.status}
                    </span>
                    {item.completedAt && (
                      <span className="text-muted-foreground">
                        on {new Date(item.completedAt).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      {/* Placeholder for Badges Earned Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl flex items-center">
            <Star className="mr-3 h-6 w-6 text-yellow-500" />
            Badges Earned
          </CardTitle>
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
