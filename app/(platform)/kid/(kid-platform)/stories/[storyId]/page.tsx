// FILE: app/kid/stories/[storyId]/page.tsx

import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getStoryById } from "@/actions/content.actions";
import Link from "next/link";
import StoryViewer from "@/components/story/story-page-view";

interface StoryDetailsPageProps {
  params: {
    storyId: string;
  };
  searchParams?: {
    courseId?: string;
  };
}

export default async function StoryDetailsPage({
  params,
  searchParams,
}: StoryDetailsPageProps) {
  const session = await auth();
  if (!session?.user) {
    redirect("/auth/signin");
  }

  const { storyId } = params;
  const { story, error } = await getStoryById(storyId);

  const courseId = searchParams?.courseId;

  if (error) {
    return (
      <div className="p-8 text-center">
        <h1 className="text-2xl font-bold text-red-500">Error</h1>
        <p className="mt-2">{error}</p>
        <Link
          href="/kid/stories"
          className="mt-4 inline-block text-primary hover:underline"
        >
          ← Back to Stories
        </Link>
      </div>
    );
  }

  if (!story) {
    return (
      <div className="p-8 text-center">
        <h1 className="text-2xl font-bold">Story Not Found</h1>
        <p className="mt-2">
          The story you are looking for does not exist or could not be loaded.
        </p>
        <Link
          href="/kid/stories"
          className="mt-4 inline-block text-primary hover:underline"
        >
          ← Back to Stories
        </Link>
      </div>
    );
  }

  // Render the new StoryViewer component with the fetched story data
  return <StoryViewer story={story} courseId={courseId} />;
}
