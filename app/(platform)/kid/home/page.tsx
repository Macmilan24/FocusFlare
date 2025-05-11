import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import Link from "next/link";
import { Sparkles, BookOpen, Target, Palette, Puzzle } from "lucide-react";

interface SubjectCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  href: string;
  colorClass: string;
}

const subjects: SubjectCardProps[] = [
  {
    title: "Math Adventures",
    description: "Explore numbers, shapes, and fun puzzles!",
    icon: <Sparkles className="h-8 w-8" />,
    href: "/kid/math",
    colorClass:
      "bg-blue-100 dark:bg-blue-900 border-blue-300 dark:border-blue-700",
  },
  {
    title: "Story Time",
    description: "Dive into exciting stories and adventures.",
    icon: <BookOpen className="h-8 w-8" />,
    href: "/kid/stories",
    colorClass:
      "bg-green-100 dark:bg-green-900 border-green-300 dark:border-green-700",
  },
  {
    title: "Focus Games",
    description: "Sharpen your attention with engaging games.",
    icon: <Target className="h-8 w-8" />,
    href: "/kid/focus",
    colorClass:
      "bg-yellow-100 dark:bg-yellow-900 border-yellow-300 dark:border-yellow-700",
  },
  {
    title: "Creative Corner",
    description: "Draw, color, and express your imagination!",
    icon: <Palette className="h-8 w-8" />,
    href: "/kid/creative",
    colorClass:
      "bg-purple-100 dark:bg-purple-900 border-purple-300 dark:border-purple-700",
  },
  {
    title: "Quiz Zone",
    description: "Test your knowledge with fun quizzes!",
    icon: <Puzzle className="h-8 w-8" />, // Example icon
    href: "/kid/quizzes", // Link to the new quiz list page
    colorClass:
      "bg-indigo-100 dark:bg-indigo-900 border-indigo-300 dark:border-indigo-700",
  },
];

export default async function KidHomePage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/auth/signin");
  }
  if (session.user.role !== "CHILD") {
    redirect("/parent/home");
  }

  return (
    <div className="p-4 md:p-8">
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-gray-100 sm:text-5xl">
          Welcome, {session.user.username || session.user.name || "Explorer"}!
        </h1>
        <p className="mt-3 text-xl text-gray-600 dark:text-gray-400">
          Ready for an adventure in learning?
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {subjects.map((subject) => (
          <Link
            href={subject.href}
            key={subject.title}
            passHref
            legacyBehavior={subject.href === "#" ? undefined : false}
          >
            <Card
              key={subject.title}
              className={`hover:shadow-lg transition-shadow duration-200 ease-in-out cursor-pointer ${subject.colorClass} border-2`}
            >
              <CardHeader className="items-center text-center">
                <div
                  className={`p-3 rounded-full mb-3 ${subject.colorClass.replace(
                    "bg-",
                    "bg-opacity-50 "
                  )}`}
                >
                  {" "}
                  {/* Slightly different bg for icon circle */}
                  {subject.icon}
                </div>
                <CardTitle className="text-xl font-semibold">
                  {subject.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <CardDescription>{subject.description}</CardDescription>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <div className="mt-12 text-center">
        <p className="text-gray-500 dark:text-gray-400">
          More fun activities coming soon!
        </p>
      </div>
    </div>
  );
}
