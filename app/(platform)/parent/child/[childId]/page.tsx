import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import prisma from "@/lib/db/prisma";

interface ChildDetailPageProps {
  params: {
    childId: string;
  };
}

// This is a Server Component
export default async function ChildDetailPage({
  params,
}: ChildDetailPageProps) {
  const session = await auth();
  if (!session?.user || session.user.role !== "PARENT") {
    redirect("/auth/signin");
  }

  const { childId } = params;

  const parentChildLinkRecord = await prisma.parentChildLink.findUnique({
    where: {
      parentId_childId: {
        parentId: session.user.id,
        childId: childId,
      },
    },
    include: {
      child: {
        select: {
          id: true,
          name: true,
          username: true,
        },
      },
    },
  });

  if (!parentChildLinkRecord || !parentChildLinkRecord.child) {
    return (
      <div className="p-4 md:p-8 text-center">
        <h1 className="text-2xl font-bold text-red-500">
          Child Not Found or Access Denied
        </h1>
        <p>
          The child details could not be loaded, or you may not have permission
          to view this child.
        </p>
        <Button asChild className="mt-4">
          <Link href="/parent/home">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Parent Dashboard
          </Link>
        </Button>
      </div>
    );
  }

  const childUser = parentChildLinkRecord.child;
  const childName = childUser.name || childUser.username || "Child";

  return (
    <div className="space-y-6">
      <div>
        <Button asChild variant="outline" size="sm" className="mb-4">
          <Link href="/parent/home">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Parent Dashboard
          </Link>
        </Button>
        <h1 className="text-3xl font-bold">Progress Report for {childName}</h1>
        <p className="text-muted-foreground">
          Viewing details for @{childUser.username}
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Story Completions</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Detailed story progress will be shown here.
          </p>
          {/* Map over completed stories for this child */}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Quiz Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Quiz scores and attempts will be shown here.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Badges Earned</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Collected badges and achievements will appear here.
          </p>
        </CardContent>
      </Card>

      {/* Placeholder for graphs */}
    </div>
  );
}
