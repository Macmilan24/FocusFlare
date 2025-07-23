// app/(platform)/parent/(parent-dashboard)/layout.tsx
import { SidebarNav } from "@/components/parent/sidebar-nav";
import { ScrollArea } from "@/components/ui/scroll-area";
import Link from "next/link";
import { Separator } from "@/components/ui/separator"; // Keep if used, otherwise can remove
import { UserNav } from "@/components/layout/user-nav"; // For the header
import Image from "next/image";

export interface NavItem {
  title: string;
  href: string;
  iconName?: keyof typeof import("lucide-react"); // Using string names for icons
}

const sidebarNavItems: NavItem[] = [
  { title: "Overview", href: "/parent/overview", iconName: "BarChart3" },
  { title: "My Children", href: "/parent/children", iconName: "Users" },
  { title: "Add Child", href: "/parent/add-child", iconName: "UserPlus" },
  { title: "Resources", href: "/parent/resources", iconName: "BookText" },
  { title: "Settings", href: "/parent/settings", iconName: "Settings" },
];

export default function ParentDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col min-h-screen bg-slate-50 dark:bg-slate-900">
      {" "}
      {/* Overall page background */}
      {/* Parent Dashboard Specific Header */}
      <header className="sticky top-0 z-40 w-full border-b bg-background/95 dark:bg-slate-800/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 shadow-sm">
        <nav className="container h-16 flex items-center justify-between px-4 md:px-6">
          <Link
            href="/parent/overview"
            className="flex items-center space-x-2 text-lg font-semibold text-primary hover:opacity-80 transition-opacity"
          >
            <Image
              src="/Logo/logo.png"
              alt="FocusFlare Logo"
              width={240}
              height={240}
            />
            <span className="hidden sm:inline">Parent Portal</span>
          </Link>
          <div className="flex items-center space-x-4">
            {/* Any other parent-specific top nav items can go here */}
            <UserNav /> {/* Parent's user navigation */}
          </div>
        </nav>
      </header>
      {/* Desktop Layout with Sidebar */}
      <div className="flex-grow hidden md:block border-t dark:border-slate-700">
        {" "}
        {/* flex-grow to take available space */}
        {/* Removed extra bg-background here, let the grid define sections */}
        <div className="container mx-auto grid lg:grid-cols-5 gap-x-8 h-full">
          {" "}
          {/* h-full to try and fill flex-grow space */}
          <aside
            className="lg:col-span-1 lg:border-r border-primary/20 
                           bg-gradient-to-b from-indigo-50 to-indigo-100 
                           dark:from-slate-800 dark:to-slate-800/70
                           py-6 px-2 lg:px-4" // Your existing styling
          >
            <ScrollArea className="h-[calc(100vh-theme(spacing.16)-theme(spacing.12)-2px)]">
              {" "}
              {/* Adjust calc based on header and py-6 of parent */}
              <div className="space-y-1.5 mb-6 px-1 lg:px-0">
                {" "}
                {/* Added some padding for title */}
                <h2 className="text-xl font-semibold tracking-tight text-primary dark:text-indigo-300">
                  Dashboard
                </h2>
                <p className="text-xs text-muted-foreground">
                  Your family command center.
                </p>
              </div>
              <SidebarNav items={sidebarNavItems} />
            </ScrollArea>
          </aside>
          <main className="lg:col-span-4 py-6 px-2 sm:px-4 lg:px-8">
            {" "}
            {/* Main content column with padding */}
            {children}
          </main>
        </div>
      </div>
      {/* Mobile Layout - Stacks content, sidebar nav might be a drawer or top tabs later */}
      <div className="flex-grow block md:hidden p-4 space-y-6">
        {" "}
        {/* flex-grow for mobile too */}
        <div className="space-y-0.5 border-b border-primary/20 pb-4">
          <h2 className="text-xl font-bold text-primary">Parent Menu</h2>
          <p className="text-muted-foreground text-sm">
            Manage your family&apos;s learning.
          </p>
        </div>
        <nav
          className="flex flex-wrap gap-2 justify-center
                        bg-indigo-50 dark:bg-slate-800 p-3 rounded-lg shadow" // Your mobile nav styling
        >
          {sidebarNavItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-muted-foreground bg-background hover:bg-muted hover:text-primary py-2 px-3 rounded-md text-sm inline-flex items-center shadow-sm border border-transparent hover:border-primary/30"
            >
              {/* You could add icons here for mobile too if desired */}
              {item.title}
            </Link>
          ))}
        </nav>
        <Separator className="my-6 border-primary/30" />{" "}
        {/* Your separator styling */}
        <div className="mt-6">
          {" "}
          {/* Added mt-6 for spacing */}
          {children}
        </div>
      </div>
      <footer className="border-t dark:border-slate-700 text-center p-4 text-xs text-muted-foreground">
        © {new Date().getFullYear()} FocusFlare Parent Portal.
      </footer>
    </div>
  );
}
