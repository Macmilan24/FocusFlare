"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { getChildrenForParent, ChildData } from "@/actions/auth.actions"; // Adjust path
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import Link from "next/link";
import { Users, ChevronRight, UserPlus } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";

export default function MyChildrenPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [childrenData, setChildrenData] = useState<ChildData[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (status === "loading") return;
    if (!session || session.user.role !== "PARENT") {
      router.push("/auth/signin");
      return;
    }

    setIsLoading(true);
    getChildrenForParent()
      .then((result) => {
        if (result.childrenData) {
          setChildrenData(result.childrenData);
        } else if (result.error) {
          setError(result.error);
        }
      })
      .catch(() => setError("Failed to fetch children data."))
      .finally(() => setIsLoading(false));
  }, [session, status, router]);

  if (isLoading || status === "loading") {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-48" /> {/* Title Placeholder */}
          <Skeleton className="h-10 w-32" />{" "}
          {/* Add Child Button Placeholder */}
        </div>
        <Skeleton className="h-20 w-full rounded-lg" />
        <Skeleton className="h-20 w-full rounded-lg" />
        <Skeleton className="h-20 w-full rounded-lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">My Children</h2>
          <p className="text-sm text-muted-foreground">
            View and manage your children&apos;s profiles and progress.
          </p>
        </div>
        <Button asChild>
          <Link href="/parent/add-child">
            <UserPlus className="mr-2 h-4 w-4" /> Add New Child
          </Link>
        </Button>
      </div>

      {error && <p className="text-red-500">{error}</p>}
      {!error && childrenData.length === 0 && (
        <Card className="text-center py-12">
          <CardHeader>
            <Users className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <CardTitle>No Children Added Yet</CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription>
              You haven&apos;t added any children to your account. Click the
              button above to add your first child.
            </CardDescription>
          </CardContent>
        </Card>
      )}
      {!error && childrenData.length > 0 && (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {" "}
          {/* Responsive grid */}
          {childrenData.map((child) => (
            <Link
              href={`/parent/children/${child.id}/progress`}
              key={child.id}
              className="group block"
            >
              <Card className="hover:shadow-lg transition-all duration-200 ease-in-out hover:border-primary h-full flex flex-col">
                <CardHeader className="flex flex-row items-center space-x-4 pb-3">
                  <Avatar className="h-14 w-14">
                    <AvatarFallback>
                      {(child.name || child.username || "C")
                        .substring(0, 2)
                        .toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="text-lg group-hover:text-primary">
                      {child.name || "Unnamed Child"}
                    </CardTitle>
                    <CardDescription>@{child.username}</CardDescription>
                  </div>
                </CardHeader>
                <CardContent className="flex-grow">
                  <p className="text-xs text-muted-foreground">
                    Last active: N/A
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Stories completed: N/A
                  </p>
                </CardContent>
                <CardFooter className="border-t pt-3">
                  <Button
                    variant="link"
                    className="p-0 h-auto text-primary group-hover:underline"
                  >
                    View Progress <ChevronRight className="ml-1 h-4 w-4" />
                  </Button>
                </CardFooter>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
