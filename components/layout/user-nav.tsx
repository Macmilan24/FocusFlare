// components/layout/user-nav.tsx
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
import { handleSignOut } from "@/actions/auth.actions"; // Your sign out action
import { useSession } from "next-auth/react";
import Link from "next/link";
import { LogOut, Settings, LayoutDashboard } from "lucide-react";
import { Role } from "@prisma/client"; // Import your Role enum

export function UserNav() {
  const { data: session } = useSession();

  if (!session?.user) {
    return (
      <Link href="/auth/signin">
        <Button variant="outline">Sign In</Button>
      </Link>
    );
  }
  const user = session.user;

  const fbInitial =
    user.role === Role.CHILD
      ? user.username?.substring(0, 1) || "K"
      : user.name?.substring(0, 1) || user.email?.substring(0, 1) || "U";
  const initials = `${fbInitial}${
    user.name?.split(" ")?.[1]?.substring(0, 1) ||
    user.username?.substring(1, 2) ||
    ""
  }`.toUpperCase();

  const dashboardHref =
    user.role === Role.PARENT
      ? "/parent/overview"
      : user.role === Role.CHILD
      ? "/kid/home"
      : "/";

  const onSignOut = async () => {
    await handleSignOut();
    // No need to manually redirect, handleSignOut action should do it.
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        {/* ... Avatar button ... */}
        <Button variant="ghost" className="relative h-10 w-10 rounded-full">
          <Avatar className="h-10 w-10 border-2 border-primary/50">
            <AvatarImage
              src={user.image || undefined}
              alt={user.name || user.username || "User"}
            />
            <AvatarFallback className="bg-primary/10 text-primary font-semibold">
              {initials}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-60" align="end" forceMount>
        {" "}
        {/* Increased width slightly */}
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">
              {user.role === Role.CHILD
                ? user.username
                : user.name || user.email}{" "}
              {/* Show username if CHILD */}
            </p>
            {user.role === Role.PARENT &&
              user.email && ( // Show email only for PARENT if it exists
                <p className="text-xs leading-none text-muted-foreground">
                  {user.email}
                </p>
              )}
            {user.role === Role.CHILD &&
              user.name && ( // Show child's name if it exists
                <p className="text-xs leading-none text-muted-foreground">
                  Name: {user.name}
                </p>
              )}
            <p className="text-xs leading-none text-muted-foreground capitalize pt-1">
              Role: {user.role?.toLowerCase()}
            </p>
          </div>
        </DropdownMenuLabel>
        {/* ... rest of dropdown items ... */}
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <Link href={dashboardHref} passHref>
            <DropdownMenuItem className="cursor-pointer">
              <LayoutDashboard className="mr-2 h-4 w-4" />
              <span>Dashboard</span>
            </DropdownMenuItem>
          </Link>
          <Link
            href={
              user.role === Role.PARENT ? "/parent/settings" : "/kid/settings"
            }
            passHref
          >
            <DropdownMenuItem className="cursor-pointer">
              <Settings className="mr-2 h-4 w-4" />
              <span>Settings</span>
            </DropdownMenuItem>
          </Link>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={onSignOut}
          className="cursor-pointer text-destructive focus:bg-destructive/10 focus:text-destructive"
        >
          <LogOut className="mr-2 h-4 w-4" />
          <span>Sign out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
