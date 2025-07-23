// app/auth/signin/page.tsx
"use client";

import { useActionState, useEffect } from "react";
import { useFormStatus } from "react-dom";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { authenticate, LoginFormState } from "@/actions/auth.actions";
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
import { Separator } from "@/components/ui/separator";
import { OAuthButtons } from "@/components/auth/oauth-buttons";
import { toast } from "sonner";

const initialState: LoginFormState = {
  message: null,
  isError: false,
};

function LoginButton() {
  const { pending } = useFormStatus();
  return (
    <Button
      type="submit"
      disabled={pending}
      className="w-full h-12 text-base font-medium bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700"
    >
      {pending ? "Signing In..." : "Start Learning! 🎯"}
    </Button>
  );
}

export default function SignInPage() {
  const router = useRouter();
  const [state, formAction] = useActionState(authenticate, initialState);

  useEffect(() => {
    if (state?.message) {
      if (state.isError) {
        toast.error(state.message);
      } else {
        toast.success(state.message);
        router.push("/"); // Or to the dashboard
        router.refresh(); // Force a refresh to get new session state
      }
    }
  }, [state, router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-yellow-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link
            href="/"
            className="text-3xl font-bold bg-gradient-to-r from-orange-500 to-red-600 bg-clip-text text-transparent"
          >
            🔥 Focus Flare
          </Link>
          <p className="text-muted-foreground mt-2">
            Welcome back, super learner! 🌟
          </p>
        </div>

        <Card className="shadow-lg border-2 border-orange-100">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-foreground">
              Login to Learn!
            </CardTitle>
            <CardDescription className="text-base">
              Ready to continue your amazing learning journey? 🚀
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <OAuthButtons />

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">
                  Or continue with
                </span>
              </div>
            </div>

            <form action={formAction} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="loginId" className="text-base font-medium">
                  Email or Username
                </Label>
                <Input
                  id="loginId"
                  name="loginId"
                  type="text"
                  placeholder="your.email@example.com"
                  className="h-12 text-base border-2 focus:border-orange-400"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-base font-medium">
                  Password
                </Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="Your super secret password"
                  className="h-12 text-base border-2 focus:border-orange-400"
                  required
                />
              </div>

              <LoginButton />
            </form>

            <div className="text-center space-y-2">
              <Link
                href="#"
                className="text-sm text-orange-600 hover:text-orange-700 font-medium"
              >
                Forgot your password? 🤔
              </Link>
              <p className="text-sm text-muted-foreground">
                New to Focus Flare?{" "}
                <Link
                  href="/auth/register"
                  className="text-orange-600 hover:text-orange-700 font-medium"
                >
                  Sign up here! ✨
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
