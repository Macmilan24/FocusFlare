"use client";

import { handleSignOut } from "@/actions/auth.actions";
import { Button } from "@/components/ui/button";
import { useTransition } from "react";

export function SignOutButton() {
  const [isPending, startTransition] = useTransition();

  const onSubmit = () => {
    startTransition(async () => {
      await handleSignOut();
    });
  };

  return (
    <form action={onSubmit}>
      <Button type="submit" variant="outline" size="sm" disabled={isPending}>
        {isPending ? "Signing Out..." : "Sign Out"}
      </Button>
    </form>
  );
}
