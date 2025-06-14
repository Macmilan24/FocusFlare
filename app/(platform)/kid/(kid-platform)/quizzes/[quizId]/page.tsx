// FILE: app/kid/quizzes/[quizId]/page.tsx

import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getQuizById } from "@/actions/content.actions";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import QuizView from "@/components/quiz/quiz-view"; // Make sure this path is correct

interface QuizDetailsPageProps {
  params: {
    quizId: string;
  };
  searchParams?: {
    courseId?: string;
  };
}

export default async function QuizDetailsPage({
  params,
  searchParams,
}: QuizDetailsPageProps) {
  const session = await auth();
  if (!session?.user) {
    redirect("/auth/signin");
  }

  const { quizId } = params;
  const { quiz, error } = await getQuizById(quizId);

  const courseId = searchParams?.courseId;

  if (error) {
    return (
      <div className="p-4 md:p-8 text-center">
        <Button
          asChild
          variant="outline"
          size="sm"
          className="mb-4 mr-auto block w-fit"
        >
          <Link href="/kid/quizzes">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Quizzes
          </Link>
        </Button>
        <h1 className="text-2xl font-bold text-red-500 mt-4">
          Error Loading Quiz
        </h1>
        <p>{error}</p>
      </div>
    );
  }

  if (!quiz) {
    return (
      <div className="p-4 md:p-8 text-center">
        <Button
          asChild
          variant="outline"
          size="sm"
          className="mb-4 mr-auto block w-fit"
        >
          <Link href="/kid/quizzes">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Quizzes
          </Link>
        </Button>
        <h1 className="text-2xl font-bold mt-4">Quiz Not Found</h1>
        <p>
          The quiz you are looking for does not exist or could not be loaded.
        </p>
      </div>
    );
  }

  return <QuizView quiz={quiz} courseId={courseId} />;
}
