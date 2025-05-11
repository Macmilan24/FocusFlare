// app/(platform)/kid/stories/[storyId]/page.tsx
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getStoryById } from "@/actions/content.action";
import Link from "next/link";

import StoryPageView from "@/components/story/story-page-view";

interface StoryDetailsPageProps {
  params: {
    storyId: string;
  };
}

export default async function StoryDetailsPage({
  params,
}: StoryDetailsPageProps) {
  const session = await auth();
  if (!session?.user) {
    redirect("/auth/signin");
  }

  const { storyId } = params;
  const { story, error } = await getStoryById(storyId);

  if (error) {
    return (
      <div className="p-4 md:p-8 text-center">
        <h1 className="text-2xl font-bold text-red-500">Error</h1>
        <p>{error}</p>
        <Link
          href="/kid/stories"
          className="mt-4 inline-block text-blue-600 hover:underline"
        >
          ← Back to Stories
        </Link>
      </div>
    );
  }

  if (!story) {
    return (
      <div className="p-4 md:p-8 text-center">
        <h1 className="text-2xl font-bold">Story Not Found</h1>
        <p>
          The story you are looking for does not exist or could not be loaded.
        </p>
        <Link
          href="/kid/stories"
          className="mt-4 inline-block text-blue-600 hover:underline"
        >
          ← Back to Stories
        </Link>
      </div>
    );
  }
  return <StoryPageView story={story} />;
}
