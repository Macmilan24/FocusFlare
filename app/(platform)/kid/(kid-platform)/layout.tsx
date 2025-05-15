// app/(platform)/kid/(kid-platform)/layout.tsx
import Link from "next/link";
import { auth } from "@/lib/auth";
import {
  Home,
  BookHeart, // Changed from BookOpen for more "story" feel
  Puzzle, // For Quizzes or general "Adventures"
  LibraryBig, // For Courses/Subjects
  Sparkles, // For Logo
  Gem, // For Points
  Award, // For Badges
  Menu, // For Mobile Menu Toggle
} from "lucide-react";
import { KidUserNav } from "@/components/kid/kid-user-nav";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle, // Import SheetTitle
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet"; // For mobile drawer navigation
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

// You'll need to add Sheet: npx shadcn@latest add sheet

// Navigation items for kids
const kidNavItems = [
  { href: "/kid/home", label: "My Hub", icon: Home },
  { href: "/kid/stories", label: "Stories", icon: BookHeart },
  { href: "/kid/quizzes", label: "Quizzes", icon: Puzzle },
  { href: "/kid/courses", label: "Adventures", icon: LibraryBig }, // Placeholder for Courses/Subjects main page
  { href: "/kid/badges", label: "My Badges", icon: Award },
];

export default async function KidPlatformLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  const user = session?.user; // User might be undefined if not logged in

  return (
    <div className="kid-theme flex flex-col min-h-screen bg-[hsl(var(--background-kid))] text-[hsl(var(--foreground-kid))]">
      <header className="sticky top-0 z-40 w-full border-b border-[hsl(var(--border-kid))] bg-[hsl(var(--background-kid))]/80 backdrop-blur-md shadow-sm">
        <div className="container mx-auto h-16 flex items-center justify-between px-4 sm:px-6">
          <Link
            href="/kid/home"
            className="flex items-center space-x-2 shrink-0"
          >
            <Sparkles className="h-7 w-7 sm:h-8 sm:w-8 text-[hsl(var(--primary-kid))]" />
            <span className="font-extrabold text-xl sm:text-2xl text-[hsl(var(--primary-kid))] tracking-tight">
              FocusFlare
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1 lg:space-x-2">
            {kidNavItems.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="px-3 py-2 rounded-lg text-sm font-semibold text-[hsl(var(--muted-kid-foreground))] hover:bg-[hsl(var(--accent-kid))]/20 hover:text-[hsl(var(--primary-kid))] transition-colors flex items-center gap-1.5"
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center space-x-2 sm:space-x-3">
            {user && ( // Quick stats in header - subtle
              <div className="hidden sm:flex items-center space-x-3 border-r border-[hsl(var(--border-kid))] pr-3 mr-1">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="flex items-center text-sm text-[hsl(var(--accent-kid))] font-semibold">
                        <Gem className="h-4 w-4 mr-1" /> {user.points || 0}
                      </div>
                    </TooltipTrigger>
                    <TooltipContent className="bg-[hsl(var(--popover-kid))] text-[hsl(var(--popover-foreground-kid))] border-[hsl(var(--border-kid))]">
                      <p>Your Points!</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                {/* Add a quick badge count or icon here later */}
              </div>
            )}
            {user && <KidUserNav user={user} />}{" "}
            {/* Pass full user from session */}
            {/* Mobile Navigation Drawer */}
            <div className="md:hidden">
              <Sheet>
                <SheetTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-[hsl(var(--foreground-kid))]"
                  >
                    <Menu className="h-6 w-6" />
                    <span className="sr-only">Open Menu</span>
                  </Button>
                </SheetTrigger>
                <SheetContent
                  side="right"
                  className="w-[280px] bg-[hsl(var(--background-kid))] text-[hsl(var(--foreground-kid))] border-[hsl(var(--border-kid))] p-0 flex flex-col" // Remove padding here, add to inner divs
                >
                  <SheetHeader className="p-6 pb-4 border-b border-[hsl(var(--border-kid))]">
                    <SheetTitle className="text-xl font-semibold text-center text-[hsl(var(--primary-kid))]">
                      Navigation
                    </SheetTitle>
                    {/* Optional: <SheetDescription>Explore different activities.</SheetDescription> */}
                  </SheetHeader>
                  <nav className="flex flex-col space-y-2 p-4 flex-grow overflow-y-auto">
                    {" "}
                    {/* Make nav scrollable */}
                    {kidNavItems.map((item) => (
                      <SheetClose asChild key={item.label + "-mobile"}>
                        <Link
                          href={item.href}
                          className="px-3 py-3 rounded-lg text-md font-medium text-[hsl(var(--muted-kid-foreground))] hover:bg-[hsl(var(--accent-kid))]/20 hover:text-[hsl(var(--primary-kid))] transition-colors flex items-center gap-2.5"
                        >
                          <item.icon className="h-5 w-5 flex-shrink-0" />
                          <span>{item.label}</span>
                        </Link>
                      </SheetClose>
                    ))}
                  </nav>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-grow container mx-auto px-3 py-6 sm:px-4 sm:py-8">
        {children}
      </main>
      {/* Optional: Simple Kid-Friendly Footer */}
      {/* <footer className="py-4 text-center text-xs text-[hsl(var(--muted-kid-foreground))] border-t border-[hsl(var(--border-kid))]">
        FocusFlare Kids - Keep Exploring! ✨
      </footer> */}
    </div>
  );
}
