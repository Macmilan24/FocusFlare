import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getQuizzesList } from "@/actions/content.actions"; // Adjust path
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import Image from "next/image";
import Link from "next/link";
import { Puzzle } from "lucide-react"; // Example icons

export default async function QuizzesListPage() {
  const session = await auth();
  if (!session?.user) redirect("/auth/signin");

  const { quizzes, error } = await getQuizzesList();

  if (error) {
    return (
      <div className="p-4 md:p-8 text-red-500">
        Error loading quizzes: {error}
      </div>
    );
  }
  if (!quizzes || quizzes.length === 0) {
    return (
      <div className="p-4 md:p-8 text-muted-foreground">
        No quizzes available yet. Time to test your knowledge soon!
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8">
      <div className="mb-8 text-center">
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">Quiz Zone</h1>
        <p className="mt-3 text-lg sm:text-xl text-gray-600 dark:text-gray-400">
          Challenge yourself and learn new things!
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {quizzes.map((quiz) => (
          <Link href={`/kid/quizzes/${quiz.id}`} key={quiz.id} passHref>
            {" "}
            {/* Link will 404 for now */}
            <Card className="h-full flex flex-col overflow-hidden hover:shadow-xl transition-shadow duration-200 ease-in-out cursor-pointer group">
              {quiz.coverImageUrl ? (
                <div className="relative w-full h-40">
                  {" "}
                  {/* Adjusted height for quiz card */}
                  <Image
                    src={quiz.coverImageUrl}
                    alt={quiz.title}
                    layout="fill"
                    objectFit="cover"
                    className="transition-transform duration-300 group-hover:scale-105"
                  />
                </div>
              ) : (
                <div className="w-full h-40 bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center group-hover:bg-indigo-200 dark:group-hover:bg-indigo-800 transition-colors">
                  <Puzzle className="h-16 w-16 text-indigo-500 dark:text-indigo-400" />
                </div>
              )}
              <CardHeader>
                <CardTitle className="text-lg font-semibold group-hover:text-primary">
                  {quiz.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="flex-grow">
                <CardDescription className="text-sm">
                  {quiz.description || "An exciting quiz!"}
                </CardDescription>
                {quiz.questionCount && quiz.questionCount > 0 && (
                  <p className="text-xs text-muted-foreground mt-2">
                    {quiz.questionCount} questions
                  </p>
                )}
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
