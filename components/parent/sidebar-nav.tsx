"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import * as LucideIcons from "lucide-react";

interface NavItemClient {
  href: string;
  title: string;
  iconName?: keyof typeof LucideIcons;
}

interface SidebarNavProps extends React.HTMLAttributes<HTMLElement> {
  items: NavItemClient[];
}

export function SidebarNav({ className, items, ...props }: SidebarNavProps) {
  const pathname = usePathname();

  return (
    <nav
      className={cn(
        "flex space-x-2 lg:flex-col lg:space-x-0 lg:space-y-1",
        className
      )}
      {...props}
    >
      {items.map((item) => {
        const IconComponent = item.iconName
          ? (LucideIcons[item.iconName] as LucideIcons.LucideIcon)
          : null;

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              buttonVariants({ variant: "ghost" }),
              pathname === item.href
                ? "bg-primary/10 text-primary hover:bg-primary/20 font-semibold"
                : "hover:bg-muted hover:text-primary",
              "justify-start text-left w-full px-3 py-2 rounded-md text-sm"
            )}
          >
            {IconComponent && (
              <IconComponent className="mr-2 h-4 w-4 flex-shrink-0" />
            )}
            <span>{item.title}</span>
          </Link>
        );
      })}
    </nav>
  );
}
