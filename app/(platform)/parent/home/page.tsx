"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useActionState, useEffect, useState } from "react";
import { useFormStatus } from "react-dom";
import {
  addChild,
  AddChildFormState,
  getChildrenForParent,
  ChildData,
} from "@/actions/auth.actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UserPlus, Users, ChevronRight } from "lucide-react";

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

  const [childrenData, setChildrenData] = useState<ChildData[]>([]); // ChildData now just needs id, name, username for this page
  const [dataError, setDataError] = useState<string | null>(null);
  const [isLoadingData, setIsLoadingData] = useState(true);

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
      // Only fetch children list for this page, detailed progress will be on child's page
      getChildrenForParent()
        .then((result) => {
          if (result.childrenData) setChildrenData(result.childrenData);
          else if (result.error) setDataError(result.error);
        })
        .catch(() =>
          setDataError("An unexpected error occurred while fetching data.")
        )
        .finally(() => setIsLoadingData(false));
    }
  }, [status, session, router]);

  useEffect(() => {
    if (addChildState.success && session?.user?.role === "PARENT") {
      setIsLoadingData(true);
      getChildrenForParent()
        .then((result) => {
          if (result.childrenData) setChildrenData(result.childrenData);
          else if (result.error) setDataError(result.error);
        })
        .finally(() => setIsLoadingData(false));
    }
  }, [addChildState.success, session?.user?.role]);

  if (status === "loading" || isLoadingData) {
    return <p className="p-4 md:p-6">Loading Parent Dashboard...</p>;
  }
  if (!session?.user || session.user.role !== "PARENT") {
    return <p className="p-4 md:p-6">Access Denied.</p>;
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Parent Dashboard</h1>
        <p className="text-lg text-muted-foreground">
          Welcome, {session.user.name || session.user.email}!
        </p>
      </div>

      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-lg font-medium">Add New Child</CardTitle>
            <UserPlus className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <form action={addChildFormAction} className="space-y-4">
              {/* ... Add Child form fields ... */}
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

        <Card className="md:col-span-1 lg:col-span-2">
          {" "}
          {/* Spans 2 columns on large, 1 on medium for a 3-col layout */}
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-lg font-medium">Your Children</CardTitle>
            <Users className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {dataError && <p className="text-red-500">{dataError}</p>}
            {!isLoadingData && !dataError && childrenData.length === 0 && (
              <p className="text-muted-foreground">
                You haven&apos;t added any children yet. Use the form on the
                left to add your first child.
              </p>
            )}
            {!isLoadingData && !dataError && childrenData.length > 0 && (
              <div className="space-y-4">
                {childrenData.map((child) => (
                  <Link
                    href={`/parent/child/${child.id}`}
                    key={child.id}
                    className="block hover:bg-muted/50 transition-colors rounded-lg border p-4"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-md font-semibold">
                          {child.name || "Unnamed Child"}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          @{child.username}
                        </p>
                      </div>
                      <ChevronRight className="h-5 w-5 text-muted-foreground" />
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
