"use client";
import { Button } from "@/components/ui/button";
import { signOut } from "next-auth/react";

function Signout() {
  return (
    <Button type="button" onClick={async () => signOut()}>
      Sign Out
    </Button>
  );
}

export default Signout;
