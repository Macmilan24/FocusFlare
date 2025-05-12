// app/(platform)/parent/(parent-dashboard)/settings/page.tsx
"use client";

import { useSession } from "next-auth/react";
import { useActionState, useEffect, useRef, useState } from "react";
import { useFormStatus } from "react-dom";
import { refreshClientSession } from "@/actions/auth.actions"; // For updating session after name change
import {
  updateParentProfile,
  UpdateProfileFormState,
  changeParentPassword,
  ChangePasswordFormState, // Import new action and state type
} from "@/actions/parent.actions"; // Assuming changeParentPassword is in parent.actions.ts
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
import { toast } from "sonner";
import { UserCog, KeyRound } from "lucide-react"; // Added KeyRound

// Initial states for the forms
const initialProfileState: UpdateProfileFormState = {
  success: false,
  message: undefined,
  error: undefined,
  updatedName: undefined,
};
const initialPasswordState: ChangePasswordFormState = {
  success: false,
  message: undefined,
  error: undefined,
};

// Reusable Submit Button component
function SubmitButton({
  pendingText = "Saving...",
  defaultText = "Save Changes",
}: {
  pendingText?: string;
  defaultText?: string;
}) {
  const { pending } = useFormStatus();
  return (
    <Button
      type="submit"
      aria-disabled={pending}
      disabled={pending}
      className="w-full sm:w-auto"
    >
      {pending ? pendingText : defaultText}
    </Button>
  );
}

export default function ParentSettingsPage() {
  const { data: session, status } = useSession();

  // State for profile update form
  const [profileUpdatedUISignal, setProfileUpdatedUISignal] = useState(0); // Trigger for UI updates
  const [profileState, profileFormAction] = useActionState(
    async (
      prevState: UpdateProfileFormState | undefined,
      formData: FormData
    ) => {
      const result = await updateParentProfile(prevState, formData);
      if (result.success) setProfileUpdatedUISignal((prev) => prev + 1); // Trigger effect on success
      return result;
    },
    initialProfileState
  );
  const profileFormRef = useRef<HTMLFormElement>(null);

  // State for password change form
  const [passwordChangedUISignal, setPasswordChangedUISignal] = useState(0); // Trigger for UI updates
  const [passwordState, passwordFormAction] = useActionState(
    async (
      prevState: ChangePasswordFormState | undefined,
      formData: FormData
    ) => {
      const result = await changeParentPassword(prevState, formData);
      if (result.success) setPasswordChangedUISignal((prev) => prev + 1); // Trigger effect on success
      return result;
    },
    initialPasswordState
  );
  const passwordFormRef = useRef<HTMLFormElement>(null);

  // Effect for handling profile update results
  useEffect(() => {
    if (profileState?.success && profileUpdatedUISignal > 0) {
      // Check signal
      toast.success(profileState.message || "Profile updated successfully!");
      if (profileState.updatedName !== undefined) {
        refreshClientSession({ name: profileState.updatedName }).then((res) => {
          if (res.success)
            console.log(
              "Client triggered server session refresh successfully for name."
            );
        });
      }
      // No need to reset formRef here as defaultValue with key handles it
    } else if (profileState?.error) {
      toast.error(profileState.error);
    }
  }, [profileState, profileUpdatedUISignal]); // Depend on the signal

  // Effect for handling password change results
  useEffect(() => {
    if (passwordState?.success && passwordChangedUISignal > 0) {
      // Check signal
      toast.success(passwordState.message || "Password changed successfully!");
      passwordFormRef.current?.reset(); // Reset password fields
    } else if (passwordState?.error) {
      toast.error(passwordState.error);
    }
  }, [passwordState, passwordChangedUISignal]); // Depend on the signal

  if (status === "loading") {
    return <p className="p-6">Loading settings...</p>; // Add Skeleton later
  }
  if (!session || !session.user) {
    // Added check for session.user
    // This should ideally be caught by middleware or redirect callback from Auth.js
    // If a redirect isn't happening, this is a fallback.
    // Consider calling router.push('/auth/signin') if useRouter is imported.
    return <p className="p-6">Access Denied. Please sign in.</p>;
  }
  if (session.user.role !== "PARENT") {
    return <p className="p-6">Access Denied: This page is for parents only.</p>;
  }

  return (
    <div className="space-y-8 max-w-2xl">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Account Settings</h2>
        <p className="text-muted-foreground">
          Manage your profile information and password.
        </p>
      </div>

      {/* Profile Information Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-3">
            <UserCog className="h-5 w-5 text-primary" />
            <CardTitle>Profile Information</CardTitle>
          </div>
          <CardDescription>Update your display name.</CardDescription>
        </CardHeader>
        <CardContent>
          <form
            ref={profileFormRef}
            action={profileFormAction}
            className="space-y-4"
          >
            <div className="space-y-1">
              <Label htmlFor="email_display">Email (cannot be changed)</Label>
              <Input
                id="email_display"
                type="email"
                value={session.user.email || ""}
                disabled
                className="bg-muted/30 dark:bg-muted/50"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="name">Display Name</Label>
              <Input
                id="name"
                name="name"
                type="text"
                key={session.user.name || "defaultKeyProfileName"} // Key to help re-render with new defaultValue
                defaultValue={session.user.name || ""}
                placeholder="Your full name"
              />
            </div>
            <SubmitButton
              defaultText="Save Profile Changes"
              pendingText="Saving Profile..."
            />
          </form>
        </CardContent>
      </Card>

      {/* Change Password Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-3">
            <KeyRound className="h-5 w-5 text-primary" />
            <CardTitle>Change Password</CardTitle>
          </div>
          <CardDescription>Choose a strong new password.</CardDescription>
        </CardHeader>
        <CardContent>
          <form
            ref={passwordFormRef}
            action={passwordFormAction}
            className="space-y-4"
          >
            <div className="space-y-1">
              <Label htmlFor="currentPassword">Current Password</Label>
              <Input
                id="currentPassword"
                name="currentPassword"
                type="password"
                required
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="newPassword">New Password</Label>
              <Input
                id="newPassword"
                name="newPassword"
                type="password"
                placeholder="Min. 6 characters"
                required
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="confirmNewPassword">Confirm New Password</Label>
              <Input
                id="confirmNewPassword"
                name="confirmNewPassword"
                type="password"
                required
              />
            </div>

            {/* Display general message or error from passwordState */}
            {passwordState?.message && !passwordState.success && (
              <p className="mt-1 text-sm text-red-500">
                {passwordState.message}
              </p>
            )}
            {passwordState?.error && ( // More specific error display
              <p className="mt-1 text-sm text-red-500">{passwordState.error}</p>
            )}

            <SubmitButton
              defaultText="Update Password"
              pendingText="Updating Password..."
            />
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
