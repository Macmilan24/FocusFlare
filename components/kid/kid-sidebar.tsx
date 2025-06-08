import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, BookOpen, Book, Trophy, Award, Settings } from "lucide-react";

const navigationItems = [
  { title: "Dashboard", icon: Home, href: "/kid/home" },
  { title: "Courses", icon: BookOpen, href: "/kid/courses" },
  { title: "Stories", icon: Book, href: "/kid/stories" },
  { title: "Quizzes", icon: Trophy, href: "/kid/quizzes" },
  { title: "Badges", icon: Award, href: "/kid/badges" },
  { title: "Settings", icon: Settings, href: "/kid/settings" },
];

export const KidSidebar = () => {
  const pathname = usePathname();
  return (
    <div className="h-full w-64 border-r border-orange-100 bg-white flex flex-col">
      {/* Logo/Brand */}
      <div className="p-6 border-b border-orange-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 gradient-bg-primary rounded-xl flex items-center justify-center">
            <span className="text-white font-bold text-lg">🔥</span>
          </div>
          <div>
            <h1 className="font-bold text-lg text-gray-800">FocusFlare</h1>
            <p className="text-xs text-gray-500">Kids Learning</p>
          </div>
        </div>
      </div>

      {/* Navigation Menu */}
      <div className="flex-1 p-4">
        <div className="space-y-2">
          <p className="text-gray-600 font-semibold px-2 py-1 text-sm">Menu</p>
          {navigationItems.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== "/kid/home" && pathname.startsWith(item.href));
            return (
              <Link
                key={item.title}
                href={item.href}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 no-underline outline-none focus-visible:ring-2 focus-visible:ring-primary-kid/60 ${
                  isActive
                    ? "bg-orange-400 text-white shadow-lg"
                    : "text-gray-600 hover:bg-orange-50 hover:text-primary-kid"
                }`}
                aria-current={isActive ? "page" : undefined}
              >
                <item.icon className="h-5 w-5" />
                <span className="font-medium">{item.title}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
};
