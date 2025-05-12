"use client";

import { useActionState } from "react"; // Or React.useActionState based on React version
import { useFormStatus } from "react-dom";
import { addChild, AddChildFormState } from "@/actions/auth.actions"; // Adjust path if needed
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
import { UserPlus } from "lucide-react";

const initialAddChildState: AddChildFormState = {
  message: null,
  isError: false,
  success: false,
};

function SubmitButton() {
  // Renamed from AddChildButton to be more generic for a submit
  const { pending } = useFormStatus();
  return (
    <Button
      type="submit"
      className="w-full"
      aria-disabled={pending}
      disabled={pending}
    >
      {pending ? "Adding Child..." : "Add Child Account"}
    </Button>
  );
}

export default function AddChildPage() {
  const [state, formAction] = useActionState(addChild, initialAddChildState);

  return (
    <div className="max-w-lg mx-auto">
      {" "}
      {/* Center the card */}
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-3 mb-2">
            <UserPlus className="h-6 w-6 text-primary" />
            <CardTitle className="text-xl font-semibold">
              Add New Child
            </CardTitle>
          </div>
          <CardDescription>
            Create a new account for your child so they can start learning.
            Usernames should be unique.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={formAction} className="space-y-4">
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
              <Label htmlFor="password">Child&apos;s Password*</Label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="Min. 4 characters"
                required
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="passwordConfirm">
                Confirm Child&apos;s Password*
              </Label>
              <Input
                id="passwordConfirm"
                name="passwordConfirm"
                type="password"
                required
              />
            </div>

            {state?.message && (
              <p
                className={`mt-3 text-sm ${
                  state.isError ? "text-red-500" : "text-green-500"
                }`}
              >
                {state.message}
              </p>
            )}
            {state?.success && ( // Clear message or keep success message based on UX preference
              <p className="mt-3 text-sm text-green-500">
                Child added! You can add another or go to &quot;My
                Children&quot;.
              </p>
            )}
            <SubmitButton />
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
