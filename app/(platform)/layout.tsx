// app/(platform)/layout.tsx
import Link from "next/link";
import { Toaster } from "sonner";
import { UserNav } from "@/components/layout/user-nav"; // Import UserNav
import { Sparkles } from "lucide-react";

export default function PlatformLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <nav className="container h-16 flex items-center justify-between">
          {" "}
          {/* Fixed height for navbar */}
          <Link
            href="/"
            className="flex items-center space-x-2 text-lg font-semibold text-primary hover:opacity-80 transition-opacity"
          >
            <Sparkles className="h-6 w-6" /> {/* Example Logo */}
            <span>FocusFlare</span>
          </Link>
          <div className="flex items-center space-x-4">
            {/* Add other nav links here if needed later */}
            <UserNav /> {/* Replace old user display/signout with UserNav */}
          </div>
        </nav>
      </header>
      <main className="flex-grow">
        {" "}
        {/* Removed container and padding, let child layouts/pages handle it */}
        {children}
      </main>
      {/* Footer can be optional for dashboard views or simpler */}
      <footer className="border-t text-center p-4 text-xs text-muted-foreground">
        © {new Date().getFullYear()} FocusFlare. Your Learning Journey,
        Enhanced.
      </footer>
      <Toaster richColors position="top-right" />
    </div>
  );
}
