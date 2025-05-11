"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation"; // useRouter, not redirect, for client components
import { useActionState, useEffect, useState } from "react";
import { useFormStatus } from "react-dom";
import {
  addChild,
  AddChildFormState,
  getChildrenForParent,
  ChildData,
} from "@/actions/auth.actions";
import { getStoriesList, StoryListItem } from "@/actions/content.action";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CheckCircle2, Circle, BookOpen } from "lucide-react";

const initialAddChildState: AddChildFormState = {
  message: null,
  isError: false,
  success: false,
};

function AddChildButton() {
  const { pending } = useFormStatus();
  return (
    <Button
      type="submit"
      className="w-full md:w-auto"
      aria-disabled={pending}
      disabled={pending}
    >
      {pending ? "Adding Child..." : "Add Child"}
    </Button>
  );
}

export default function ParentHomePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [addChildState, addChildFormAction] = useActionState(
    addChild,
    initialAddChildState
  );

  const [childrenData, setChildrenData] = useState<ChildData[]>([]);
  const [stories, setStories] = useState<StoryListItem[]>([]); // State for all available stories
  const [dataError, setDataError] = useState<string | null>(null);
  const [isLoadingData, setIsLoadingData] = useState(true);

  // Fetch children and all stories when component mounts or session is available
  useEffect(() => {
    if (status === "loading") return;
    if (
      status === "unauthenticated" ||
      (session && session.user.role !== "PARENT")
    ) {
      router.push("/auth/signin");
      return;
    }

    if (session?.user?.role === "PARENT") {
      setIsLoadingData(true);
      Promise.all([
        getChildrenForParent(),
        getStoriesList(), // Fetch all stories
      ])
        .then(([childrenResult, storiesResult]) => {
          if (childrenResult.childrenData)
            setChildrenData(childrenResult.childrenData);
          else if (childrenResult.error)
            setDataError(
              (prev) => (prev ? prev + "\n" : "") + childrenResult.error
            );

          if (storiesResult.stories) setStories(storiesResult.stories);
          else if (storiesResult.error)
            setDataError(
              (prev) => (prev ? prev + "\n" : "") + storiesResult.error
            );
        })
        .catch(() => {
          setDataError(
            "An unexpected error occurred while fetching dashboard data."
          );
        })
        .finally(() => {
          setIsLoadingData(false);
        });
    }
  }, [status, session, router]);

  // Refetch children after a new child is successfully added
  useEffect(() => {
    if (addChildState.success && session?.user?.role === "PARENT") {
      setIsLoadingData(true); // Indicate loading while refetching children
      getChildrenForParent()
        .then((data) => {
          if (data.childrenData) setChildrenData(data.childrenData);
          else if (data.error)
            setDataError((prev) => (prev ? prev + "\n" : "") + data.error);
        })
        .finally(() => setIsLoadingData(false)); // Only children are re-fetched here
    }
  }, [addChildState.success, session?.user?.role]);

  if (status === "loading" || isLoadingData) {
    return <p className="p-4 md:p-6">Loading Parent Dashboard...</p>;
  }
  if (!session?.user || session.user.role !== "PARENT") {
    return <p className="p-4 md:p-6">Access Denied.</p>;
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-2">Parent Dashboard</h1>
      <p className="text-lg text-muted-foreground mb-8">
        Welcome back, {session.user.name || session.user.email}! Manage your
        children and view their progress.
      </p>

      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        {" "}
        {/* Adjusted grid for 3 columns */}
        {/* Add Child Card - Column 1 */}
        <Card className="lg:col-span-1">
          {" "}
          {/* Takes 1 column on large screens */}
          {/* ... Add Child Card content (form etc.) as before ... */}
          <CardHeader>
            <CardTitle>Add a New Child</CardTitle>
            <CardDescription>Create an account for your child.</CardDescription>
          </CardHeader>
          <CardContent>
            <form action={addChildFormAction} className="space-y-4">
              <div className="space-y-1">
                <Label htmlFor="childsName">Child&apos;s Name (Optional)</Label>
                <Input
                  id="childsName"
                  name="childsName"
                  type="text"
                  placeholder="E.g., Alex"
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="username_child_form">
                  Child&apos;s Username*
                </Label>
                <Input
                  id="username_child_form"
                  name="username"
                  type="text"
                  placeholder="E.g., alex_the_explorer"
                  required
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="password_child_form">
                  Child&apos;s Password*
                </Label>
                <Input
                  id="password_child_form"
                  name="password"
                  type="password"
                  required
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="passwordConfirm_child_form">
                  Confirm Child&apos;s Password*
                </Label>
                <Input
                  id="passwordConfirm_child_form"
                  name="passwordConfirm"
                  type="password"
                  required
                />
              </div>
              {addChildState?.message && (
                <p
                  className={`text-sm ${
                    addChildState.isError ? "text-red-500" : "text-green-500"
                  }`}
                >
                  {addChildState.message}
                </p>
              )}
              <AddChildButton />
            </form>
          </CardContent>
        </Card>
        {/* Children Overview Card - Column 2 & 3 */}
        <Card className="md:col-span-2 lg:col-span-2">
          {" "}
          {/* Takes 2 columns on medium/large screens */}
          <CardHeader>
            <CardTitle>Your Children&apos;s Story Progress</CardTitle>
            <CardDescription>
              See which stories your children have completed.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {dataError && <p className="text-red-500">{dataError}</p>}
            {!isLoadingData && !dataError && childrenData.length === 0 && (
              <p className="text-muted-foreground">
                You haven&apos;t added any children yet.
              </p>
            )}
            {!isLoadingData && !dataError && childrenData.length > 0 && (
              <div className="space-y-6">
                {childrenData.map((child) => (
                  <div key={child.id}>
                    <h3 className="text-lg font-semibold mb-2">
                      {child.name || child.username}
                    </h3>
                    {stories.length === 0 && (
                      <p className="text-sm text-muted-foreground">
                        No stories available to track progress.
                      </p>
                    )}
                    <ul className="space-y-2">
                      {stories.map((story) => {
                        const progress = child.storyProgress?.find(
                          (p) =>
                            p.contentId === story.id && p.status === "completed"
                        );
                        return (
                          <li
                            key={story.id}
                            className="flex items-center justify-between p-3 border rounded-md bg-slate-50 dark:bg-slate-800 text-sm"
                          >
                            <span className="flex items-center">
                              <BookOpen className="mr-2 h-4 w-4 text-muted-foreground" />
                              {story.title}
                            </span>
                            {progress ? (
                              <CheckCircle2 className="h-5 w-5 text-green-500">
                                <title>{`Completed on ${new Date(
                                  progress.completedAt!
                                ).toLocaleDateString()}`}</title>
                              </CheckCircle2>
                            ) : (
                              <Circle className="h-5 w-5 text-slate-400">
                                <title>Not yet completed</title>
                              </Circle>
                            )}
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
