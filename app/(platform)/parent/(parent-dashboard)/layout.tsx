import { SidebarNav } from "@/components/parent/sidebar-nav";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";

export interface NavItem {
  title: string;
  href: string;
  iconName?: keyof typeof import("lucide-react");
}

const sidebarNavItems: NavItem[] = [
  { title: "Overview", href: "/parent/overview", iconName: "Home" },
  { title: "My Children", href: "/parent/children", iconName: "Users" },
  { title: "Add New Child", href: "/parent/add-child", iconName: "UserPlus" },
  {
    title: "Learning Resources",
    href: "/parent/resources",
    iconName: "BookText",
  },
  { title: "Settings", href: "/parent/settings", iconName: "Settings" },
];

export default function ParentDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <div className="hidden space-y-6 p-6 pb-16 md:block">
        <div className="space-y-0.5">
          <h2 className="text-2xl font-bold tracking-tight">
            Parent Dashboard
          </h2>
          <p className="text-muted-foreground">
            Manage your children&apos;s learning journey and track their
            progress.
          </p>
        </div>
        <Separator className="my-6" />
        <div className="flex flex-col space-y-8 lg:flex-row lg:space-x-12 lg:space-y-0">
          <aside className="-mx-4 lg:w-1/5">
            {" "}
            <ScrollArea className="h-[calc(100vh-250px)]">
              <SidebarNav items={sidebarNavItems} />
            </ScrollArea>
          </aside>
          <div className="flex-1 lg:max-w-4xl">{children}</div>{" "}
          {/* Main content area */}
        </div>
      </div>

      <div className="block space-y-6 p-4 pb-16 md:hidden">
        <p className="text-center text-muted-foreground">
          Parent dashboard is best viewed on larger screens.
        </p>
        {children}
      </div>
    </>
  );
}
