import Link from "next/link";
import { auth } from "@/lib/auth"; // Server-side auth
import {
  Home,
  BookOpen,
  HelpCircle,
  Puzzle,
  Sparkles,
  Gem,
} from "lucide-react";
import { KidUserNav } from "@/components/kid/kid-user-nav"; // We'll create this

// Navigation items for kids
const kidNavItems = [
  { href: "/kid/home", label: "Home", icon: Home },
  { href: "/kid/stories", label: "Stories", icon: BookOpen },
  { href: "/kid/quizzes", label: "Quizzes", icon: HelpCircle },
  { href: "/kid/courses", label: "Adventures", icon: Puzzle }, // Placeholder for "Courses" or "Subjects"
  // Add more links like "My Progress", "Badges" later
];

export default async function KidPlatformLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth(); // Fetch session for UserNav data if needed server-side

  return (
    <div className="kid-theme flex flex-col min-h-screen bg-sky-50 dark:bg-slate-900">
      {" "}
      {/* Kid-friendly background */}
      <header className="sticky top-0 z-40 w-full border-b border-[hsl(var(--border-kid))] bg-[hsl(var(--background-kid))] shadow-sm">
        <div className="container mx-auto h-16 flex items-center justify-between px-4">
          <Link href="/kid/home" className="flex items-center space-x-2">
            <Sparkles className="h-7 w-7 text-[hsl(var(--primary-kid))]" />
            <span className="font-bold text-xl text-[hsl(var(--primary-kid))]">
              FocusFlare Kids
            </span>
          </Link>
          <nav className="hidden md:flex items-center space-x-2 lg:space-x-4">
            {kidNavItems.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                // Use kid theme colors for nav links
                className="px-3 py-2 rounded-md text-sm font-medium text-[hsl(var(--muted-kid-foreground))] hover:bg-[hsl(var(--muted-kid))] hover:text-[hsl(var(--primary-kid))] transition-colors"
              >
                <item.icon className="inline h-4 w-4 mr-1.5 mb-0.5" />{" "}
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center space-x-3">
            {/* Points and Badges quick display can go here if desired, or just in UserNav */}
            {session?.user && (
              <div className="hidden sm:flex items-center space-x-3 border-r pr-3 mr-1 dark:border-slate-700">
                <div className="flex items-center text-sm text-amber-600 dark:text-amber-400">
                  <Gem className="h-4 w-4 mr-1" /> {session.user.points || 0}
                </div>
                {/* Add a quick badge count or icon here later */}
              </div>
            )}
            {session?.user && <KidUserNav user={session.user} />}{" "}
            {/* Pass user to avoid client fetching */}
          </div>
        </div>
        {/* Mobile Navigation (Placeholder - could be a Drawer/Sheet) */}
        <nav className="md:hidden flex items-center justify-around p-2 border-t bg-background dark:bg-slate-800">
          {kidNavItems.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="flex flex-col items-center p-1 rounded-md text-xs font-medium text-muted-foreground hover:bg-muted/50 hover:text-primary transition-colors"
            >
              <item.icon className="h-5 w-5 mb-0.5" /> {item.label}
            </Link>
          ))}
        </nav>
      </header>
      <main className="flex-grow container mx-auto px-2 py-6 sm:px-4 sm:py-8">
        {children}
      </main>
      {/* Minimal or no footer for kids usually, or a very simple one */}
    </div>
  );
}
