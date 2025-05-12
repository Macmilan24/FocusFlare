"use client"; // For form handling

import { useSession } from "next-auth/react";
import { useActionState, useEffect, useRef, useState } from "react"; // Added useState
import { useFormStatus } from "react-dom";
import { refreshClientSession } from "@/actions/auth.actions";
import {
  updateParentProfile,
  UpdateProfileFormState,
} from "@/actions/parent.actions";
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
import { UserCog } from "lucide-react";

const initialProfileState: UpdateProfileFormState = {
  success: false,
  message: undefined,
  error: undefined,
};

function ProfileSubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" aria-disabled={pending} disabled={pending}>
      {pending ? "Saving..." : "Save Changes"}
    </Button>
  );
}

export default function ParentSettingsPage() {
  const { data: session, status } = useSession(); // Get session update function
  const [profileUpdated, setProfileUpdated] = useState(false);

  const [profileState, profileFormAction] = useActionState(
    // Wrapper to reset local state when action is called
    async (
      prevState: UpdateProfileFormState | undefined,
      formData: FormData
    ) => {
      setProfileUpdated(false); // Reset before new action
      const result = await updateParentProfile(prevState, formData);
      return result;
    },
    initialProfileState
  );

  const formRef = useRef<HTMLFormElement>(null);
  useEffect(() => {
    if (profileState?.success && !profileUpdated) {
      toast.success(profileState.message || "Profile updated successfully!");

      if (profileState.updatedName !== undefined) {
        // Call the server action to tell NextAuth to update the session cookie/JWT
        // with the new name. The client's useSession will eventually pick this up.
        refreshClientSession({ name: profileState.updatedName }).then((res) => {
          if (res.success)
            console.log(
              "Client triggered server session refresh successfully."
            );
          // useSession should auto-update after this server-side change propagates.
          // A manual window.location.reload() is a heavier approach if immediate UI update in UserNav is critical and not happening.
        });
      }
      setProfileUpdated(true);
    }
    // ... (error handling) ...
  }, [profileState, profileUpdated]);
  if (status === "loading") {
    return <p>Loading settings...</p>; // Add Skeleton later
  }
  if (!session || session.user.role !== "PARENT") {
    // Redirect or show error if not a parent (should be handled by middleware too)
    return <p>Access Denied.</p>;
  }

  return (
    <div className="space-y-8 max-w-2xl">
      {" "}
      {/* Constrain width for settings forms */}
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Account Settings</h2>
        <p className="text-muted-foreground">
          Manage your profile information and password.
        </p>
      </div>
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-3">
            <UserCog className="h-5 w-5 text-primary" />
            <CardTitle>Profile Information</CardTitle>
          </div>
          <CardDescription>Update your display name.</CardDescription>
        </CardHeader>
        <CardContent>
          <form ref={formRef} action={profileFormAction} className="space-y-4">
            <div className="space-y-1">
              <Label htmlFor="email_display">Email (cannot be changed)</Label>
              <Input
                id="email_display"
                type="email"
                value={session.user.email || ""}
                disabled
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="name">Display Name</Label>
              <Input
                id="name"
                name="name"
                type="text"
                key={session.user.name || "no-name"}
                defaultValue={session.user.name || ""} // Pre-fill with current name
                placeholder="Your full name"
              />
            </div>
            <ProfileSubmitButton />
          </form>
        </CardContent>
      </Card>
      {/* Placeholder for Change Password Form - We'll do this next */}
      <Card>
        <CardHeader>
          <CardTitle>Change Password</CardTitle>
          <CardDescription>Update your account password.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground italic">
            Change password functionality coming soon.
          </p>
          {/* Form with currentPassword, newPassword, confirmNewPassword will go here */}
        </CardContent>
      </Card>
    </div>
  );
}
