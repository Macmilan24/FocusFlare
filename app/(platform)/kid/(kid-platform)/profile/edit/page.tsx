/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useSession } from "next-auth/react";
import { refreshClientSession } from "@/actions/auth.actions";
import { useActionState, useEffect, useState } from "react";
import { useFormStatus } from "react-dom";
import {
  updateUserAvatarAndPreferences,
  UpdateProfileResult,
} from "@/actions/user.actions";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Palette, Save, Sparkles, UserCircle } from "lucide-react";
import Image from "next/image";

const NO_SUBJECT_VALUE = "_NO_SUBJECT_";

const PREDEFINED_AVATARS = [
  "/avatars/avatar1.png",
  "/avatars/avatar2.png",
  "/avatars/avatar3.png",
  "/avatars/avatar4.png",
  "/avatars/avatar5.png",
  "/avatars/avatar6.png",
  "/avatars/avatar7.png",
];

const SUBJECT_OPTIONS = [
  "Mathematics",
  "Reading",
  "StoryTime",
  "QuizZone",
  "Science",
  "Art & Creativity",
  "Focus Games",
];

const initialFormState: UpdateProfileResult = {
  success: false,
  message: undefined,
  error: undefined,
  updatedUser: undefined,
};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button
      type="submit"
      className="w-full sm:w-auto bg-[hsl(var(--primary-kid))] hover:bg-[hsl(var(--primary-kid))]/90 text-[hsl(var(--primary-kid-foreground))]"
      disabled={pending}
    >
      <Save className="mr-2 h-4 w-4" />{" "}
      {pending ? "Saving..." : "Save My Profile"}
    </Button>
  );
}

export default function KidProfileEditPage() {
  const { data: session, status } = useSession();
  const [selectedAvatar, setSelectedAvatar] = useState<string>("");
  const [selectedSubject, setSelectedSubject] = useState<string>("");

  const [formState, formAction] = useActionState(
    updateUserAvatarAndPreferences,
    initialFormState
  );
  const [uiSignal, setUiSignal] = useState(0);

  useEffect(() => {
    if (session?.user) {
      setSelectedAvatar(session.user.image || PREDEFINED_AVATARS[0] || "");
      setSelectedSubject(
        (session.user as any)?.favoriteSubject || NO_SUBJECT_VALUE
      );
    }
  }, [session?.user]);

  useEffect(() => {
    if (formState?.success && uiSignal > 0) {
      toast.success(formState.message || "Profile saved!", {
        icon: <Sparkles className="h-5 w-5 text-yellow-400" />,
      });
      if (formState.updatedUser) {
        refreshClientSession({
          name: formState.updatedUser.name ?? undefined,
          image: formState.updatedUser.image,
          favoriteSubject: formState.updatedUser.favoriteSubject,
        }).then((res) => {
          if (res.success)
            console.log(
              "Client triggered server session refresh for profile update."
            );
        });
      }
    } else if (formState?.error && uiSignal > 0) {
      toast.error(formState.error);
    }
  }, [formState, uiSignal]);

  if (status === "loading")
    return <p className="p-6 text-center">Loading your profile...</p>;
  if (!session?.user)
    return (
      <p className="p-6 text-center">Please sign in to view your profile.</p>
    );

  return (
    <div className="space-y-10 max-w-3xl mx-auto p-4 md:p-0">
      <div className="text-center">
        <UserCircle className="h-16 w-16 mx-auto text-[hsl(var(--primary-kid))] mb-3" />
        <h1 className="text-3xl font-bold text-[hsl(var(--foreground-kid))]">
          My Awesome Profile
        </h1>
        <p className="text-[hsl(var(--muted-kid-foreground))]">
          Personalize your learning adventure!
        </p>
      </div>

      <form
        action={(formDataArg: FormData) => {
          formDataArg.set("avatarUrl", selectedAvatar || "");
          formDataArg.set(
            "favoriteSubject",
            selectedSubject === NO_SUBJECT_VALUE ? "" : selectedSubject
          );

          setUiSignal((s) => s + 1);
          formAction(formDataArg);
        }}
        className="space-y-8"
      >
        {selectedAvatar && (
          <input type="hidden" name="avatarUrl" value={selectedAvatar} />
        )}
        <input type="hidden" name="favoriteSubject" value={selectedSubject} />{" "}
        <Card className="bg-[hsl(var(--card-kid))] border-[hsl(var(--border-kid))] shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl flex items-center text-[hsl(var(--card-foreground-kid))]">
              <Palette className="mr-2 h-5 w-5 text-[hsl(var(--accent-kid))]" />{" "}
              Choose Your Look!
            </CardTitle>
            <CardDescription className="text-[hsl(var(--muted-kid-foreground))]">
              Pick an avatar that represents you.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3 sm:gap-4">
            {PREDEFINED_AVATARS.map((avatarSrc) => (
              <Button
                type="button"
                key={avatarSrc}
                onClick={() => setSelectedAvatar(avatarSrc)}
                className={`aspect-square rounded-full border-4 p-1 transition-all duration-200 focus:outline-none focus-visible:ring-4 focus-visible:ring-[hsl(var(--ring-kid))] focus-visible:ring-offset-2 focus-visible:ring-offset-[hsl(var(--background-kid))]
                            ${
                              selectedAvatar === avatarSrc
                                ? "border-[hsl(var(--primary-kid))] shadow-2xl scale-110"
                                : "border-transparent hover:border-[hsl(var(--primary-kid))]/50 hover:scale-105"
                            }`}
              >
                <Image
                  src={avatarSrc}
                  alt={`Avatar option`}
                  width={100}
                  height={100}
                  className="rounded-full object-cover"
                />
              </Button>
            ))}
          </CardContent>
        </Card>
        <Card className="bg-[hsl(var(--card-kid))] border-[hsl(var(--border-kid))] shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl flex items-center text-[hsl(var(--card-foreground-kid))]">
              <Sparkles className="mr-2 h-5 w-5 text-[hsl(var(--accent-kid))]" />{" "}
              What&apos;s Your Favorite?
            </CardTitle>
            <CardDescription className="text-[hsl(var(--muted-kid-foreground))]">
              Let us know what subjects you love the most!
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Label
              htmlFor="favoriteSubjectSelect"
              className="text-sm font-medium text-[hsl(var(--foreground-kid))]"
            >
              My Favorite Subject Is...
            </Label>
            <Select value={selectedSubject} onValueChange={setSelectedSubject}>
              <SelectTrigger
                id="favoriteSubjectSelect"
                className="w-full sm:w-[280px] mt-1 h-11 text-md bg-background"
              >
                <SelectValue placeholder="Select a subject" />
              </SelectTrigger>
              <SelectContent className="bg-[hsl(var(--popover-kid))] text-[hsl(var(--popover-foreground-kid))] border-[hsl(var(--border-kid))]">
                <SelectItem
                  value={NO_SUBJECT_VALUE}
                  className="hover:bg-[hsl(var(--accent-kid))]/10"
                >
                  None / Not Sure Yet!
                </SelectItem>
                {SUBJECT_OPTIONS.map((subject) => (
                  <SelectItem
                    key={subject}
                    value={subject}
                    className="hover:bg-[hsl(var(--accent-kid))]/10"
                  >
                    {subject}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>
        <div className="flex justify-center pt-4">
          <SubmitButton />
        </div>
      </form>
    </div>
  );
}
