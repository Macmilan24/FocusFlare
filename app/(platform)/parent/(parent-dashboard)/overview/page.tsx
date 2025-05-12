import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Users,
  BookText,
  BarChart3,
  Activity,
  ShieldCheck,
  BookOpen,
} from "lucide-react";
import Link from "next/link";
import prisma from "@/lib/db/prisma";

async function getParentDashboardStats(parentId: string) {
  const children = await prisma.parentChildLink.count({
    where: { parentId: parentId },
  });
  return {
    totalChildren: children,
    storiesCompleted: 0,
    averageQuizScore: 0,
  };
}

export default async function ParentOverviewPage() {
  const session = await auth();
  if (!session?.user || session.user.role !== "PARENT") {
    redirect("/auth/signin");
  }

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

      {/* Stats Cards - This can be a grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card className="shadow-lg hover:shadow-primary/20 transition-shadow">
          {" "}
          {/* Subtle hover shadow */}
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 border-b border-primary/20 bg-gradient-to-r from-primary/5 via-background to-background">
            {" "}
            {/* Gradient accent header */}
            <CardTitle className="text-sm font-medium text-primary">
              Total Children
            </CardTitle>
            <Users className="h-4 w-4 text-primary/70" />
          </CardHeader>
          <CardContent className="pt-4">
            <div className="text-3xl font-bold text-foreground">
              {/* {stats.totalChildren} */} N/A
            </div>
            <Link
              href="/parent/children"
              className="text-xs text-muted-foreground hover:text-primary hover:underline"
            >
              View all children →
            </Link>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Stories Completed
            </CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {/* {stats.storiesCompleted} */} N/A
            </div>
            <p className="text-xs text-muted-foreground">Across all children</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Average Quiz Score
            </CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {/* {stats.averageQuizScore}% */} N/A
            </div>
            <p className="text-xs text-muted-foreground">
              Across all quizzes taken
            </p>
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
