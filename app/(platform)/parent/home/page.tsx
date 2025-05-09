// app/(platform)/parent/home/page.tsx
"use client"; // Because of the forms and client-side data fetching/state

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
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

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

  const [children, setChildren] = useState<ChildData[]>([]);
  const [childrenError, setChildrenError] = useState<string | null>(null);
  const [isLoadingChildren, setIsLoadingChildren] = useState(true);

  useEffect(() => {
    if (status === "loading") return;

    if (
      status === "unauthenticated" ||
      (session && session.user.role !== "PARENT")
    ) {
      router.push("/auth/signin"); // Or a generic access denied if already logged in with wrong role
      return;
    }

    if (session?.user?.role === "PARENT") {
      setIsLoadingChildren(true);
      getChildrenForParent()
        .then((data) => {
          if (data.children) setChildren(data.children);
          else if (data.error) setChildrenError(data.error);
        })
        .finally(() => setIsLoadingChildren(false));
    }
  }, [status, session, router]);

  useEffect(() => {
    if (addChildState.success && session?.user?.role === "PARENT") {
      setIsLoadingChildren(true);
      getChildrenForParent()
        .then((data) => {
          if (data.children) setChildren(data.children);
          else if (data.error) setChildrenError(data.error);
        })
        .finally(() => setIsLoadingChildren(false));
    }
  }, [addChildState.success, session?.user?.role]);

  if (
    status === "loading" ||
    !session?.user ||
    session.user.role !== "PARENT"
  ) {
    return <p className="p-4 md:p-6">Loading Parent Dashboard...</p>;
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-2">Parent Dashboard</h1>
      <p className="text-lg text-muted-foreground mb-8">
        Welcome back, {session.user.name || session.user.email}! Manage your
        children and view their progress.
      </p>

      <div className="grid gap-8 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Add a New Child</CardTitle>
            <CardDescription>
              Create an account for your child on the platform.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form action={addChildFormAction} className="space-y-4">
              {/* ... Add Child form fields (name, username, password, confirm password) ... */}
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

        <Card>
          <CardHeader>
            <CardTitle>Your Children</CardTitle>
            <CardDescription>
              View and manage your children&apos;s accounts.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoadingChildren && <p>Loading children...</p>}
            {childrenError && <p className="text-red-500">{childrenError}</p>}
            {!isLoadingChildren && !childrenError && children.length === 0 && (
              <p className="text-muted-foreground">
                You haven&apos;t added any children yet.
              </p>
            )}
            {!isLoadingChildren && !childrenError && children.length > 0 && (
              <ul className="space-y-3">
                {children.map((child) => (
                  <li
                    key={child.id}
                    className="flex justify-between items-center p-3 border rounded-md shadow-sm bg-slate-50 dark:bg-slate-800"
                  >
                    <div>
                      <p className="font-medium">
                        {child.name || "Unnamed Child"}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Username: {child.username}
                      </p>
                    </div>
                    {/* Later: Button to view child's progress */}
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
