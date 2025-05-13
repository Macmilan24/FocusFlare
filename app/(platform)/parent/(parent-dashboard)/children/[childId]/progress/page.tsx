import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  ArrowLeft,
  BookOpen,
  HelpCircle,
  Star,
  BarChart2,
  CalendarDays,
  TrendingUp,
  CheckCircle,
  Percent,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress"; // shadcn/ui progress
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  getChildProgressDetailsForReport,
  DetailedChildReport,
} from "@/actions/progress.actions"; // Updated import
import { formatDistanceToNow } from "date-fns";
import { ContentType } from "@prisma/client";
import { ActivityBarChart } from "@/components/charts/activity-bar-chart";
import { ChildActivityTable } from "@/components/parent/child-activity-table";

interface ChildProgressReportPageProps {
  params: {
    childId: string;
  };
}

export default async function ChildProgressReportPage({
  params,
}: ChildProgressReportPageProps) {
  const session = await auth();
  if (!session?.user || session.user.role !== "PARENT") {
    redirect("/auth/signin");
  }

  const { childId } = params;
  const { data: report, error } = await getChildProgressDetailsForReport(
    childId
  );

  if (error || !report) {
    return (
      <div className="p-6 md:p-8 text-center">
        <Button
          asChild
          variant="outline"
          size="sm"
          className="mb-4 mr-auto block w-fit"
        >
          <Link href="/parent/children">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to My Children
          </Link>
        </Button>
        <h1 className="text-2xl font-bold text-red-500 mt-4">
          Error Loading Report
        </h1>
        <p>{error || "Could not load progress report for this child."}</p>
      </div>
    );
  }

  const {
    child,
    overallStats,
    progressBySubject,
    activityFeed,
    activityCalendar,
  } = report;
  const childDisplayName = child.name || child.username || "Child";

  return (
    <div className="space-y-8 p-1 md:p-2 lg:p-4">
      {" "}
      {/* Reduced overall padding slightly */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <Button
            asChild
            variant="ghost"
            size="sm"
            className="mb-2 text-muted-foreground hover:text-primary -ml-2"
          >
            <Link href="/parent/children">
              <ArrowLeft className="mr-2 h-4 w-4" /> My Children
            </Link>
          </Button>
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16 border-2 border-primary">
              <AvatarFallback className="text-2xl bg-primary/10 text-primary">
                {(child.name || child.username || "C")
                  .substring(0, 1)
                  .toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">
                {childDisplayName}&apos;s Progress
              </h1>
              <p className="text-muted-foreground">@{child.username}</p>
            </div>
          </div>
        </div>
        {/* Future: Buttons for "Edit Child", "Set Goals" */}
      </div>
      {/* Overall Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Activities Completed
            </CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {overallStats.totalActivitiesCompleted}
            </div>
            <p className="text-xs text-muted-foreground">
              Total across platform
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Stories Finished
            </CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {overallStats.totalStoriesCompleted}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Quizzes Passed
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {overallStats.totalQuizzesPassed}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Avg. Quiz Score
            </CardTitle>
            <Percent className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {overallStats.averageQuizScoreAllTime !== null
                ? `${overallStats.averageQuizScoreAllTime}%`
                : "N/A"}
            </div>
          </CardContent>
        </Card>
      </div>
      {/* Main Content Grid (Progress by Subject, Activity Calendar) */}
      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-xl">Progress by Subject</CardTitle>
            <CardDescription>
              Completion and performance in different learning areas.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {progressBySubject.length === 0 && (
              <p className="text-muted-foreground">No subject progress yet.</p>
            )}
            {progressBySubject.map(
              (
                subjectItem // Renamed 'subject' to 'subjectItem' to avoid conflict with subjectName
              ) => (
                <div key={subjectItem.subject}>
                  <div className="flex justify-between items-baseline mb-1">
                    <h4 className="text-md font-semibold">
                      {subjectItem.subject}
                    </h4>
                    <span className="text-sm text-muted-foreground">
                      {subjectItem.totalCompleted} /{" "}
                      {subjectItem.totalAvailable} done
                    </span>
                  </div>
                  <Progress
                    value={
                      (subjectItem.totalCompleted /
                        Math.max(subjectItem.totalAvailable, 1)) *
                      100
                    }
                    className="h-3"
                  />
                  {/* Check if averageScore exists and is not null to display it */}
                  {subjectItem.averageScore !== null && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Avg. Quiz Score: {subjectItem.averageScore}%
                    </p>
                  )}
                </div>
              )
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-xl flex items-center">
              <CalendarDays className="mr-2 h-5 w-5 text-primary" /> Activity
              Calendar
            </CardTitle>
            <CardDescription>
              Daily activity count (last 30 days).
            </CardDescription>
          </CardHeader>
          <CardContent className="pl-0 pr-2 sm:pr-4">
            {" "}
            {/* Adjust padding for chart */}
            {activityCalendar && activityCalendar.length > 0 ? (
              <ActivityBarChart data={activityCalendar} />
            ) : (
              <div className="h-[250px] w-full flex items-center justify-center text-muted-foreground">
                No recent activity to display.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      {/* Detailed Activity Log (Table) */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Detailed Activity Log</CardTitle>
          <CardDescription>
            A chronological feed of all activities. Click headers to sort.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {activityFeed.length === 0 ? (
            <p className="text-muted-foreground">No activities logged yet.</p>
          ) : (
            <ChildActivityTable data={activityFeed} />
          )}
        </CardContent>
      </Card>
      {/* Placeholder for Badges */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Badges Earned</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Badges will appear here as your child earns them!
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
