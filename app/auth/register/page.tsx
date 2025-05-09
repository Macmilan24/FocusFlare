"use client";

import { useActionState, useEffect } from "react";
import { useFormStatus } from "react-dom";
import { registerParent, RegisterFormState } from "@/actions/auth.actions"; // Adjust path
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

const initialState: RegisterFormState = {
  message: null,
  isError: false,
  success: false,
};

function RegisterButton() {
  const { pending } = useFormStatus();
  return (
    <Button
      type="submit"
      className="w-full"
      aria-disabled={pending}
      disabled={pending}
    >
      {pending ? "Registering..." : "Create Account"}
    </Button>
  );
}

export default function RegisterPage() {
  const [state, formAction] = useActionState(registerParent, initialState);
  const router = useRouter();

  useEffect(() => {
    if (state.success) {
      // Optionally, redirect to sign-in after a short delay or display message longer
      // For now, we'll rely on the message.
      // setTimeout(() => {
      //   router.push('/auth/signin');
      // }, 2000); // Example delay
    }
  }, [state.success, router]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="text-2xl">Create Parent Account</CardTitle>
          <CardDescription>
            Enter your email and password to get started.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={formAction} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="parent@example.com"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" name="password" type="password" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="passwordConfirm">Confirm Password</Label>
              <Input
                id="passwordConfirm"
                name="passwordConfirm"
                type="password"
                required
              />
            </div>

            {state?.message && (
              <p
                className={`text-sm ${
                  state.isError ? "text-red-500" : "text-green-500"
                }`}
              >
                {state.message}
              </p>
            )}
            <RegisterButton />
          </form>
        </CardContent>
        <CardFooter className="flex flex-col items-center space-y-2">
          <p className="text-xs text-muted-foreground">
            Already have an account?{" "}
            <Link href="/auth/signin" className="underline hover:text-primary">
              Sign In
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
