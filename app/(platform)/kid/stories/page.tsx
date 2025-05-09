import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getStoriesList, StoryListItem } from "@/actions/content.action"; // Adjust path
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import Image from "next/image";
import Link from "next/link";

export default async function StoriesListPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/auth/signin");
  }

  const { stories, error } = await getStoriesList();

  if (error) {
    return (
      <div className="p-4 md:p-8 text-red-500">
        Error loading stories: {error}
      </div>
    );
  }

  if (!stories || stories.length === 0) {
    return (
      <div className="p-4 md:p-8 text-muted-foreground">
        No stories available at the moment. Check back soon!
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8">
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold tracking-tight">
          Story Time Adventures
        </h1>
        <p className="mt-3 text-xl text-gray-600 dark:text-gray-400">
          Pick a story and let your imagination soar!
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {stories.map((story) => (
          <Link href={`/kid/stories/${story.id}`} key={story.id} passHref>
            <Card className="h-full flex flex-col overflow-hidden hover:shadow-xl transition-shadow duration-200 ease-in-out cursor-pointer group">
              {story.coverImageUrl ? (
                <div className="relative w-full h-48">
                  <Image
                    src={story.coverImageUrl} // Ensure these images exist in /public
                    alt={story.title}
                    layout="fill"
                    objectFit="cover"
                    className="transition-transform duration-300 group-hover:scale-105"
                  />
                </div>
              ) : (
                <div className="w-full h-48 bg-slate-200 dark:bg-slate-700 flex items-center justify-center">
                  <span className="text-slate-500">No Image</span>
                </div>
              )}
              <CardHeader>
                <CardTitle className="text-lg font-semibold group-hover:text-primary">
                  {story.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="flex-grow">
                <CardDescription className="text-sm">
                  {story.description || "A wonderful story awaits..."}
                </CardDescription>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
