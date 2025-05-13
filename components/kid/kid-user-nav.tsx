// components/kid/kid-user-nav.tsx
"use client"; // Needs to be client for DropdownMenu interaction

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { handleSignOut } from "@/actions/auth.actions";
import Link from "next/link";
import { LogOut, UserCircle2, SettingsIcon } from "lucide-react"; // Use UserCircle2 or similar
import type { Session } from "next-auth"; // Import Session type

interface KidUserNavProps {
  user: Session["user"]; // Expect the user object from the session
}

export function KidUserNav({ user }: KidUserNavProps) {
  if (!user) return null;

  const initials = (
    user.username?.substring(0, 1) ||
    user.name?.substring(0, 1) ||
    "K"
  ).toUpperCase();

  const onSignOut = async () => {
    await handleSignOut();
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-10 w-10 rounded-full p-0">
          <Avatar className="h-10 w-10 border-2 border-purple-400 dark:border-purple-600">
            <AvatarImage
              src={user.image || undefined}
              alt={user.username || user.name || "User"}
            />
            <AvatarFallback className="bg-purple-100 dark:bg-purple-700 text-purple-600 dark:text-purple-200 font-semibold text-lg">
              {initials}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-semibold leading-none">
              {user.username || user.name}
            </p>
            <p className="text-xs leading-none text-muted-foreground">
              Awesome Learner!
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <Link href="/kid/profile" passHref>
          {" "}
          {/* Future profile page */}
          <DropdownMenuItem className="cursor-pointer">
            <UserCircle2 className="mr-2 h-4 w-4" />
            <span>My Profile</span>
          </DropdownMenuItem>
        </Link>
        <Link href="/kid/settings" passHref>
          {" "}
          {/* Future settings page */}
          <DropdownMenuItem className="cursor-pointer">
            <SettingsIcon className="mr-2 h-4 w-4" />
            <span>Settings</span>
          </DropdownMenuItem>
        </Link>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={onSignOut}
          className="cursor-pointer text-red-600 dark:text-red-400 focus:bg-red-100 dark:focus:bg-red-700/50 focus:text-red-700 dark:focus:text-red-300"
        >
          <LogOut className="mr-2 h-4 w-4" />
          <span>Sign Out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
