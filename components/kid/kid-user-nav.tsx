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
import Link from "next/link";
import { LogOut, UserCircle, Gem, Award, Zap } from "lucide-react";
import type { User } from "next-auth";
import { handleSignOut } from "@/actions/auth.actions"; // <-- IMPORT YOUR SERVER ACTION

interface KidUserNavProps {
  user: Pick<User, "name" | "image" | "email"> & {
    username?: string | null;
    points?: number | null;
    id?: string;
  };
}

export function KidUserNav({ user }: KidUserNavProps) {
  const initials = (
    user.username?.substring(0, 1) ||
    user.name?.substring(0, 1) ||
    "K"
  ).toUpperCase();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="relative h-10 w-10 sm:h-11 sm:w-11 rounded-full p-0"
        >
          <Avatar className="h-full w-full border-2 border-[hsl(var(--primary-kid))]">
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
      <DropdownMenuContent className="w-60" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1 p-1">
            <p className="text-md font-bold leading-none">
              {user.username || user.name}
            </p>
            {user.points !== undefined && (
              <p className="text-xs leading-none text-muted-foreground flex items-center">
                <Gem className="h-3 w-3 mr-1.5 text-orange-400" /> {user.points}{" "}
                Points
              </p>
            )}
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <Link href="/kid/home" passHref>
            <DropdownMenuItem className="cursor-pointer">
              <Zap className="mr-2 h-4 w-4" />
              <span>My Hub</span>
            </DropdownMenuItem>
          </Link>
          <Link href="/kid/profile/edit" passHref>
            <DropdownMenuItem className="cursor-pointer">
              <UserCircle className="mr-2 h-4 w-4" />
              <span>My Profile</span>
            </DropdownMenuItem>
          </Link>
          <Link href="/kid/badges" passHref>
            <DropdownMenuItem className="cursor-pointer">
              <Award className="mr-2 h-4 w-4" />
              <span>My Badges</span>
            </DropdownMenuItem>
          </Link>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <form action={handleSignOut} className="w-full">
          <DropdownMenuItem asChild>
            <button
              type="submit"
              className="w-full cursor-pointer text-red-500 focus:bg-red-500/10 focus:text-red-600"
            >
              <LogOut className="mr-2 h-4 w-4" />
              <span>Switch User / Sign Out</span>
            </button>
          </DropdownMenuItem>
        </form>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
