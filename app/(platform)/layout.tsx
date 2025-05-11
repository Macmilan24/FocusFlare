// app/(platform)/layout.tsx
import { auth } from "@/lib/auth";
import { Toaster } from "@/components/ui/sonner";
import { SignOutButton } from "@/components/auth/signout-button";
import Link from "next/link";

export default async function PlatformLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth(); // Get session on the server

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-gray-800 text-white p-4 shadow-md">
        <nav className="container mx-auto flex justify-between items-center">
          <Link
            href="/dashboard"
            className="text-xl font-semibold hover:text-gray-300"
          >
            FocusFlare Platform
          </Link>
          <div className="flex items-center space-x-4">
            {session?.user ? (
              <>
                <span className="text-sm">
                  {session.user.name ||
                    session.user.email ||
                    session.user.username}
                </span>
                <SignOutButton />
              </>
            ) : (
              <Link href="/auth/signin" className="hover:text-gray-300">
                Sign In
              </Link>
            )}
          </div>
        </nav>
      </header>
      <main className="flex-grow container mx-auto p-4 md:p-6">{children}</main>
      <footer className="bg-gray-100 dark:bg-gray-800 text-center p-4 text-sm text-gray-600 dark:text-gray-400">
        © {new Date().getFullYear()} FocusFlare. All rights reserved.
      </footer>
      <Toaster richColors position="top-right" />
    </div>
  );
}
