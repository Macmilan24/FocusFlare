// app/(platform)/parent/(parent-dashboard)/layout.tsx
import { SidebarNav } from "@/components/parent/sidebar-nav";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import Link from "next/link";

const sidebarNavItems = [
  {
    title: "Overview",
    href: "/parent/overview",
    iconName: "BarChart3" as keyof typeof import("lucide-react"),
  },
  {
    title: "My Children",
    href: "/parent/children",
    iconName: "Users" as keyof typeof import("lucide-react"),
  },
  {
    title: "Add Child",
    href: "/parent/add-child",
    iconName: "UserPlus" as keyof typeof import("lucide-react"),
  },
  {
    title: "Resources",
    href: "/parent/resources",
    iconName: "BookText" as keyof typeof import("lucide-react"),
  },
  {
    title: "Settings",
    href: "/parent/settings",
    iconName: "Settings" as keyof typeof import("lucide-react"),
  },
];

export default function ParentDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <div className="hidden md:block border-t">
        <div className="bg-background">
          <div className="grid lg:grid-cols-5 min-h-[calc(100vh-theme(spacing.16)-theme(spacing.16)-1px)]">
            {/* sidebar stays blue→indigo */}
            <aside
              className="lg:col-span-1 lg:border-r border-primary/20
                              bg-gradient-to-b from-indigo-100 to-indigo-200
                              dark:from-indigo-900 dark:to-indigo-800
                              p-4 lg:p-6"
            >
              <ScrollArea className="h-full">
                <SidebarNav items={sidebarNavItems} />
              </ScrollArea>
            </aside>
            {/* main content tinted purple-light */}
            <div
              className="lg:col-span-4 p-6 lg:p-8
                            bg-primary/10 dark:bg-primary/20
                            rounded-lg shadow-lg"
            >
              {children}
            </div>
          </div>
        </div>
      </div>
      {/* mobile */}
      <div className="block md:hidden p-4 space-y-6">
        <div className="space-y-0.5 border-b border-primary/20 pb-4">
          <h2 className="text-xl font-bold text-primary">Parent Dashboard</h2>
          <p className="text-muted-foreground text-sm">
            Manage your family&apos;s learning.
          </p>
        </div>
        <nav
          className="flex flex-col space-y-1
                        bg-indigo-100 dark:bg-indigo-800 p-2 rounded"
        >
          {sidebarNavItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-muted-foreground hover:text-primary p-2 rounded-md text-sm"
            >
              {item.title}
            </Link>
          ))}
        </nav>
        <Separator className="border-primary/40" />
        {children}
      </div>
    </>
  );
}
