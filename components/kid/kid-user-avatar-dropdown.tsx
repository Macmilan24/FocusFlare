"use client";

import Link from "next/link";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { UserCircle, Settings, LogOut } from "lucide-react";
// import { signOut } from "next-auth/react"; // If using next-auth

interface KidDataForAvatar {
  name?: string;
  avatarUrl?: string;
  // email?: string; // Optional, if you want to display it
}

interface KidUserAvatarDropdownProps {
  kidData?: KidDataForAvatar;
}

export function KidUserAvatarDropdown({ kidData }: KidUserAvatarDropdownProps) {
  const userName = kidData?.name || "User";
  const userInitials = userName?.split(" ").map(n => n[0]).join("").toUpperCase() || <UserCircle className="w-5 h-5" />;

  const handleLogout = () => {
    // signOut(); // Example for next-auth
    console.log("Logout clicked"); // Placeholder
    // Typically, you would redirect after logout, e.g., router.push("/");
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-9 w-9 rounded-full p-0">
          <Avatar className="h-9 w-9 border border-border-kid">
            <AvatarImage src={kidData?.avatarUrl} alt={userName} />
            <AvatarFallback className="bg-muted-kid text-primary-kid font-semibold">{userInitials}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56 bg-card-kid border-border-kid text-foreground-kid" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{userName}</p>
            {/* {kidData?.email && <p className="text-xs leading-none text-muted-kid-foreground">{kidData.email}</p>} */}
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-border-kid" />
        <DropdownMenuItem asChild className="cursor-pointer hover:bg-primary-kid/10 focus:bg-primary-kid/10">
          <Link href="/kid/profile" className="flex items-center">
            <UserCircle className="mr-2 h-4 w-4 text-muted-kid-foreground group-hover:text-primary-kid" />
            <span>Profile</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild className="cursor-pointer hover:bg-primary-kid/10 focus:bg-primary-kid/10">
          <Link href="/kid/settings" className="flex items-center"> {/* Assuming a /kid/settings route */}
            <Settings className="mr-2 h-4 w-4 text-muted-kid-foreground group-hover:text-primary-kid" />
            <span>Settings</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator className="bg-border-kid"/>
        <DropdownMenuItem onClick={handleLogout} className="cursor-pointer hover:bg-destructive/10 focus:bg-destructive/10 text-destructive hover:text-destructive focus:text-destructive">
          <LogOut className="mr-2 h-4 w-4" /> 
          <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
} 