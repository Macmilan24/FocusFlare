import { getLessonById } from "@/actions/content.actions";
import { LessonPlayer } from "@/components/lesson/lesson-player";
import { notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import prisma from "@/lib/db/prisma";

export default async function LessonPage({
  params,
}: {
  params: { lessonId: string };
}) {
  const session = await auth();
  const userId = session?.user?.id;

  const { lesson, error } = await getLessonById(params.lessonId);

  if (error || !lesson) {
    notFound();
  }

  let initialCompletedBlocks: string[] = [];

  // This part now works because we query by the LESSON's ID
  if (userId) {
    const lessonProgress = await prisma.userLearningProgress.findUnique({
      where: {
        userId_contentId: {
          userId: userId,
          contentId: lesson.id, // Use the lesson's valid ObjectId
        },
      },
      select: {
        completedBlocks: true, // Select our new field
      },
    });

    // Check if the field exists and is an array, then cast it
    if (
      lessonProgress?.completedBlocks &&
      Array.isArray(lessonProgress.completedBlocks)
    ) {
      initialCompletedBlocks = lessonProgress.completedBlocks as string[];
    }
  }

  return (
    <LessonPlayer
      lesson={lesson}
      initialCompletedBlocks={initialCompletedBlocks}
    />
  );
}
