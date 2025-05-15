import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Users,
  BookText,
  CheckCircle,
  BookOpenText,
  BellRing,
} from "lucide-react";
import Link from "next/link";

import {
  getParentDashboardStats,
  ParentDashboardStats,
  getRecentActivityFeed,
  ActivityFeedItem,
} from "@/actions/parent.actions";
import { formatDistanceToNow } from "date-fns";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export default async function ParentOverviewPage() {
  const session = await auth();
  console.log(
    "[ParentOverviewPage] Session from auth():",
    JSON.stringify(session)
  );
  if (!session?.user || session.user.role !== "PARENT") {
    console.log(
      "[ParentOverviewPage] Redirecting to signin. Session was:",
      JSON.stringify(session)
    );
    redirect("/auth/signin");
  }

  const [statsResult, feedResult] = await Promise.all([
    getParentDashboardStats(),
    getRecentActivityFeed(5),
  ]);

  const displayStats: ParentDashboardStats = statsResult.stats || {
    totalChildren: 0,
    totalStoriesCompleted: 0,
    totalQuizzesPassed: 0,
    averageQuizScore: null,
    quizzesTakenCount: 0,
  };

  const activityFeed: ActivityFeedItem[] = feedResult.feed || [];
  const statsError = statsResult.error;
  const feedError = feedResult.error;

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-foreground">
          Dashboard Overview
        </h2>
        <p className="text-muted-foreground mt-1">
          A quick look at your family&apos;s activity and helpful resources.
        </p>
      </div>

      {statsError && (
        <Card className="bg-destructive/10 border-destructive">
          <CardContent className="p-4 text-destructive text-sm">
            {statsError}
          </CardContent>
        </Card>
      )}
      {!statsError && (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card className="border-primary/30 shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-primary">
                Total Children
              </CardTitle>
              <Users className="h-4 w-4 text-primary/70" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">
                {displayStats.totalChildren}
              </div>
              <Link
                href="/parent/children"
                className="text-xs text-muted-foreground hover:text-primary hover:underline"
              >
                Manage children →
              </Link>
            </CardContent>
          </Card>

          <Card className="border-green-500/30 shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-green-600">
                Stories Completed
              </CardTitle>
              <BookOpenText className="h-4 w-4 text-green-600/70" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">
                {displayStats.totalStoriesCompleted}
              </div>
              <p className="text-xs text-muted-foreground">
                Across all children
              </p>
            </CardContent>
          </Card>

          <Card className="border-purple-500/30 shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-purple-600">
                Quizzes Passed
              </CardTitle>
              <CheckCircle className="h-4 w-4 text-purple-600/70" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">
                {displayStats.totalQuizzesPassed}
              </div>
              {displayStats.averageQuizScore !== null && (
                <p className="text-xs text-muted-foreground">
                  Avg. Score: {displayStats.averageQuizScore}%
                </p>
              )}
              {displayStats.quizzesTakenCount > 0 &&
                displayStats.totalQuizzesPassed === 0 && (
                  <p className="text-xs text-muted-foreground">
                    No quizzes passed yet.
                  </p>
                )}
              {displayStats.quizzesTakenCount === 0 && (
                <p className="text-xs text-muted-foreground">
                  No quizzes taken yet.
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg font-semibold flex items-center">
              <BellRing className="mr-2 h-5 w-5 text-primary" /> Recent Family
              Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            {feedError && <p className="text-sm text-red-500">{feedError}</p>}
            {!feedError && activityFeed.length === 0 && (
              <p className="text-muted-foreground text-sm">
                No recent activity from your children yet. Encourage them to
                explore stories and quizzes!
              </p>
            )}
            {!feedError && activityFeed.length > 0 && (
              <ul className="space-y-4 max-h-96 overflow-y-auto custom-scrollbar pr-2">
                {activityFeed.map((item) => (
                  <li
                    key={item.id}
                    className="flex items-start space-x-3 pb-3 border-b border-border/50 last:border-b-0 last:pb-0"
                  >
                    <Avatar className="h-9 w-9 border mt-0.5">
                      <AvatarFallback className="text-xs bg-muted/50">
                        {(item.childName || item.childUsername || "C")
                          .substring(0, 1)
                          .toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="text-sm flex-1">
                      <p className="leading-snug">
                        <span className="font-semibold text-foreground">
                          {item.childName || item.childUsername}
                        </span>{" "}
                        {item.actionText}{" "}
                        <Link
                          href={item.contentLink || "#"}
                          className="text-primary hover:underline font-medium break-words"
                        >
                          &quot;{item.contentTitle}&quot;
                        </Link>
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {formatDistanceToNow(new Date(item.timestamp), {
                          addSuffix: true,
                        })}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg font-semibold flex items-center">
              <BookText className="mr-2 h-5 w-5 text-primary" /> Parent
              Resources
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="#" className="text-primary hover:underline">
                  Understanding ADHD Focus Patterns
                </Link>
              </li>
              <li>
                <Link href="#" className="text-primary hover:underline">
                  Creating Engaging Learning Routines
                </Link>
              </li>
              <li>
                <Link href="#" className="text-primary hover:underline">
                  Positive Reinforcement Strategies
                </Link>
              </li>
              <li>
                <Link href="#" className="text-primary hover:underline">
                  More Resources...
                </Link>
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
