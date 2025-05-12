import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Users,
  BookText,
  Activity,
  CheckCircle,
  BookOpenText,
} from "lucide-react";
import Link from "next/link";
import prisma from "@/lib/db/prisma";
import {
  getParentDashboardStats,
  ParentDashboardStats,
} from "@/actions/parent.actions";

export default async function ParentOverviewPage() {
  const session = await auth();
  if (!session?.user || session.user.role !== "PARENT") {
    redirect("/auth/signin");
  }
  const { stats, error } = await getParentDashboardStats();

  // Basic error handling for stats
  if (error) {
    // You might want a more prominent error display for stats failing to load
    console.error("Error loading dashboard stats:", error);
  }

  const displayStats: ParentDashboardStats = stats || {
    // Fallback if stats are undefined
    totalChildren: 0,
    totalStoriesCompleted: 0,
    totalQuizzesPassed: 0,
    averageQuizScore: null,
    quizzesTakenCount: 0,
  };
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-foreground">
          Dashboard Overview
        </h2>
        <p className="text-muted-foreground">
          A quick look at your family&apos;s activity.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="border-primary/30 shadow-sm">
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

        <Card className="border-green-500/30 shadow-sm">
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
            <p className="text-xs text-muted-foreground">Across all children</p>
          </CardContent>
        </Card>

        <Card className="border-purple-500/30 shadow-sm">
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
            {displayStats.averageQuizScore === null &&
              displayStats.quizzesTakenCount > 0 && ( // Assuming quizzesTakenCount is part of stats if you want this detail
                <p className="text-xs text-muted-foreground">
                  No quizzes passed yet.
                </p>
              )}
            {displayStats.quizzesTakenCount === 0 && ( // Assuming quizzesTakenCount is part of stats
              <p className="text-xs text-muted-foreground">
                No quizzes taken yet.
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Other Widgets like Recent Activity or Parent Resources */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg font-semibold flex items-center">
              <Activity className="mr-2 h-5 w-5 text-primary" /> Recent Activity
              (Coming Soon)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              A feed of your children&apos;s recent achievements and activities
              will appear here.
            </p>
          </CardContent>
        </Card>
        <Card>
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
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
