"use client";

import { auth } from "@/lib/auth";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { useActionState, useEffect } from "react";
import { useFormStatus } from "react-dom";
import { addChild, AddChildFormState } from "@/actions/auth.actions";
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

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const [addChildState, addChildFormAction] = useActionState(
    addChild,
    initialAddChildState
  );

  useEffect(() => {
    if (status === "unauthenticated") {
      redirect("/auth/signin");
    }
  }, [status]);

  useEffect(() => {
    if (addChildState.success) {
    }
  }, [addChildState.success]);

  if (status === "loading") {
    return <p>Loading dashboard...</p>;
  }

  if (!session?.user) {
    return <p>Access Denied. Please sign in.</p>;
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-6">
        Welcome,{" "}
        {session.user.name || session.user.email || session.user.username}!
      </h1>
      <p className="mb-2">Your User ID: {session.user.id}</p>
      <p className="mb-4">Your Role: {session.user.role}</p>

      {session.user.role === "PARENT" && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Add a Child</CardTitle>
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
                <Label htmlFor="username">Child&apos;s Username*</Label>
                <Input
                  id="username"
                  name="username"
                  type="text"
                  placeholder="E.g., alex_the_explorer"
                  required
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="password_child">Child&apos;s Password*</Label>
                <Input
                  id="password_child"
                  name="password"
                  type="password"
                  required
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="passwordConfirm_child">
                  Confirm Child&apos;s Password*
                </Label>
                <Input
                  id="passwordConfirm_child"
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
      )}

      {/* Placeholder for displaying list of children - we'll do this next */}
      {session.user.role === "PARENT" && (
        <div className="mt-8">
          <h2 className="text-xl font-semibold">Your Children</h2>
          {/* List of children will go here */}
          <p className="text-muted-foreground">
            You haven&apos;t added any children yet.
          </p>
        </div>
      )}

      <p className="mt-8">
        This is a generic dashboard. Role-specific content will be here soon.
      </p>
    </div>
  );
}
