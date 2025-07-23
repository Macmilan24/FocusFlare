"use client";

import { useActionState, useEffect } from "react";
import { useFormStatus } from "react-dom";
import Link from "next/link";
import { registerParent, RegisterFormState } from "@/actions/auth.actions";
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
import { OAuthButtons } from "@/components/auth/oauth-buttons";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import Image from "next/image";

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
      disabled={pending}
      className="w-full h-12 text-base font-medium bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 disabled:opacity-50"
    >
      {pending ? "Creating Account..." : "Join Focus Flare! 🎉"}
    </Button>
  );
}

export default function RegisterPage() {
  const [state, formAction] = useActionState(registerParent, initialState);
  const router = useRouter();

  useEffect(() => {
    if (state?.message) {
      if (state.isError) {
        toast.error(state.message);
      } else if (state.success) {
        toast.success(state.message);
        router.push("/auth/signin");
      }
    }
  }, [state, router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-yellow-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-block">
            <Image
              src="/Logo/logo.png"
              alt="FocusFlare Logo"
              width={350}
              height={350}
              priority
            />
          </Link>
          <p className="text-muted-foreground mt-2">
            Join the learning adventure! 🌟
          </p>
        </div>

        <Card className="shadow-lg border-2 border-orange-100">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-foreground">
              Create Your Account!
            </CardTitle>
            <CardDescription className="text-base">
              Let's start your amazing learning journey together! 🚀
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <OAuthButtons isSignUp={true} />

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">
                  Or create account with email
                </span>
              </div>
            </div>

            <form action={formAction} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-base font-medium">
                  Full Name
                </Label>
                <Input
                  id="name"
                  name="name"
                  type="text"
                  placeholder="Your awesome name"
                  className="h-12 text-base border-2 focus:border-orange-400"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-base font-medium">
                  Email
                </Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
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
                  placeholder="Create a strong password"
                  className="h-12 text-base border-2 focus:border-orange-400"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="passwordConfirm"
                  className="text-base font-medium"
                >
                  Confirm Password
                </Label>
                <Input
                  id="passwordConfirm"
                  name="passwordConfirm"
                  type="password"
                  placeholder="Type your password again"
                  className="h-12 text-base border-2 focus:border-orange-400"
                  required
                />
              </div>

              {/* The user didn't provide a checkbox, so I am omitting it. The original form did not have it either. */}

              <RegisterButton />
            </form>

            <div className="text-center">
              <p className="text-sm text-muted-foreground">
                Already have an account?{" "}
                <Link
                  href="/auth/signin"
                  className="text-orange-600 hover:text-orange-700 font-medium"
                >
                  Login here! 🔐
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
