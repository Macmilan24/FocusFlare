"use client";

import React, { useState } from "react";
import { KidSidebar } from "./kid-sidebar";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import { KidUserNav } from "./kid-user-nav";
import { useSession } from "next-auth/react";

interface KidPlatformLayoutProps {
  children: React.ReactNode;
}

export function KidPlatformLayout({ children }: KidPlatformLayoutProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { data: session } = useSession();
  const user = session?.user;

  return (
    <div className="flex h-screen bg-background-kid bg-kid-pattern bg-blend-overlay text-foreground-kid kid-theme-content">
      {/* Desktop Sidebar */}
      <div className="hidden md:flex">
        <KidSidebar />
      </div>

      {/* Mobile Sidebar */}
      <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
        <SheetContent side="left" className="p-0 w-72">
          <KidSidebar />
        </SheetContent>

        <div className="flex-1 flex flex-col overflow-hidden">
          <header className="md:hidden sticky top-0 z-40 w-full border-b border-border-kid bg-background-kid/95 backdrop-blur-sm">
            <div className="flex h-14 items-center px-4 sm:px-6 justify-between">
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="-ml-2 text-foreground-kid hover:bg-primary-kid/10"
                >
                  <Menu className="h-6 w-6" />
                  <span className="sr-only">Toggle Menu</span>
                </Button>
              </SheetTrigger>
              <div className="flex items-center gap-2">
                {user && <KidUserNav user={user} />}
              </div>
            </div>
          </header>

          {/* Main Content */}
          <main className="flex-1 overflow-y-auto">{children}</main>
        </div>
      </Sheet>
    </div>
  );
}
