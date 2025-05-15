// components/kid/kid-user-nav.tsx
"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { handleSignOut } from "@/actions/auth.actions"; // Assuming central signout action
import Link from "next/link";
import { LogOut, UserCircle, Gem, Award, Zap } from "lucide-react";
import type { User } from "next-auth";

interface KidUserNavProps {
  user: Pick<User, "name" | "image" | "email"> & {
    username?: string | null;
    points?: number | null;
    id?: string;
  }; // User from session
}

export function KidUserNav({ user }: KidUserNavProps) {
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
        <Button
          variant="ghost"
          className="relative h-10 w-10 sm:h-11 sm:w-11 rounded-full focus-visible:ring-2 focus-visible:ring-[hsl(var(--ring-kid))]"
        >
          <Avatar className="h-full w-full border-2 border-[hsl(var(--primary-kid))] shadow-md">
            <AvatarImage
              src={user.image || undefined}
              alt={user.username || user.name || "User"}
            />
            <AvatarFallback className="bg-[hsl(var(--primary-kid))]/20 text-[hsl(var(--primary-kid))] font-bold text-lg">
              {initials}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="w-60 bg-[hsl(var(--popover-kid))] text-[hsl(var(--popover-foreground-kid))] border-[hsl(var(--border-kid))]"
        align="end"
        forceMount
      >
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1 p-1">
            <p className="text-md font-bold leading-none text-[hsl(var(--foreground-kid))]">
              {user.username || user.name}
            </p>
            {user.points !== undefined && (
              <p className="text-xs leading-none text-[hsl(var(--muted-kid-foreground))] flex items-center">
                <Gem className="h-3 w-3 mr-1.5 text-[hsl(var(--accent-kid))]" />{" "}
                {user.points} Points
              </p>
            )}
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-[hsl(var(--border-kid))]" />
        <DropdownMenuGroup>
          <Link href="/kid/home" passHref>
            <DropdownMenuItem className="cursor-pointer hover:bg-[hsl(var(--accent-kid))]/10 focus:bg-[hsl(var(--accent-kid))]/20">
              <Zap className="mr-2 h-4 w-4 text-[hsl(var(--primary-kid))]" />
              <span>My Hub</span>
            </DropdownMenuItem>
          </Link>
          <Link href="/kid/profile/edit" passHref>
            {" "}
            {/* Placeholder for kid's profile */}
            <DropdownMenuItem className="cursor-pointer hover:bg-[hsl(var(--accent-kid))]/10 focus:bg-[hsl(var(--accent-kid))]/20">
              <UserCircle className="mr-2 h-4 w-4 text-[hsl(var(--primary-kid))]" />
              <span>My Profile</span>
            </DropdownMenuItem>
          </Link>
          <Link href="/kid/badges" passHref>
            {" "}
            {/* Placeholder */}
            <DropdownMenuItem className="cursor-pointer hover:bg-[hsl(var(--accent-kid))]/10 focus:bg-[hsl(var(--accent-kid))]/20">
              <Award className="mr-2 h-4 w-4 text-[hsl(var(--primary-kid))]" />
              <span>My Badges</span>
            </DropdownMenuItem>
          </Link>
        </DropdownMenuGroup>
        <DropdownMenuSeparator className="bg-[hsl(var(--border-kid))]" />
        <DropdownMenuItem
          onClick={onSignOut}
          className="cursor-pointer text-red-500 dark:text-red-400 focus:bg-red-500/10 focus:text-red-500 dark:focus:text-red-300"
        >
          <LogOut className="mr-2 h-4 w-4" />
          <span>Switch User / Sign Out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
