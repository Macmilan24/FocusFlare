// app/auth/signin/page.tsx
"use client";

import { useActionState, useEffect } from "react";
import { useFormStatus } from "react-dom";
import { authenticate, LoginFormState } from "@/actions/auth.actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Link from "next/link";
import { useRouter } from "next/navigation";

const initialState: LoginFormState = {
  message: null,
  isError: false,
};

function LoginButton() {
  const { pending } = useFormStatus();
  return (
    <Button
      type="submit"
      className="w-full"
      aria-disabled={pending}
      disabled={pending}
    >
      {pending ? "Signing In..." : "Sign In"}
    </Button>
  );
}

export default function SignInPage() {
  const [state, formAction] = useActionState(authenticate, initialState);

  const router = useRouter();

  useEffect(() => {
    if (!state.isError && state.message?.includes("Login successful")) {
    }
  }, [state, router]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="text-2xl">Sign In</CardTitle>
          <CardDescription>
            Enter your email/username and password to access your account.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* The form action prop still takes the `formAction` from useActionState */}
          <form action={formAction} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="loginId">Email or Username</Label>
              <Input
                id="loginId"
                name="loginId"
                type="text"
                placeholder="yourname or name@example.com"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" name="password" type="password" required />
            </div>
            {/* Displaying form state message */}
            {state?.message && (
              <p
                className={`text-sm ${
                  state.isError ? "text-red-500" : "text-green-500"
                }`}
              >
                {state.message}
              </p>
            )}
            <LoginButton />{" "}
            {/* LoginButton still uses useFormStatus correctly */}
          </form>
        </CardContent>
        <CardFooter className="flex flex-col items-center space-y-2">
          <p className="text-xs text-muted-foreground">
            No account yet?{" "}
            <Link
              href="/auth/register"
              className="underline hover:text-primary"
            >
              Register here
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
