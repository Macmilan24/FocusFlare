import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getCoursesList, CourseCardItem } from "@/actions/kid.actions";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Image from "next/image";
import Link from "next/link";
import { LibraryBig, BookCopy, Puzzle } from "lucide-react";
function CourseDisplayCard({ course }: { course: CourseCardItem }) {
  let SubjectIcon = Puzzle; // Default
  if (course.subject === "Mathematics") SubjectIcon = Puzzle; // Or Calculator
  if (course.subject === "StoryTime" || course.subject === "Reading")
    SubjectIcon = BookCopy;

  return (
    <Link
      href={`/kid/courses/${course.id}`}
      passHref
      className="block group h-full"
    >
      <Card className="h-full flex flex-col overflow-hidden shadow-lg hover:shadow-xl dark:hover:shadow-[hsl(var(--primary-kid))]/30 transition-all duration-300 ease-in-out transform hover:-translate-y-1 focus-visible:ring-2 focus-visible:ring-[hsl(var(--ring-kid))] focus-visible:ring-offset-2 border-2 border-transparent hover:border-[hsl(var(--primary-kid))]/50 rounded-2xl bg-[hsl(var(--card-kid))] text-[hsl(var(--card-foreground-kid))]">
        <div className="relative w-full h-40">
          {course.coverImageUrl ? (
            <Image
              src={course.coverImageUrl}
              alt={course.title}
              layout="fill"
              objectFit="cover"
              className="group-hover:scale-105 transition-transform duration-300 rounded-t-xl"
            />
          ) : (
            <div className="w-full h-full bg-[hsl(var(--muted-kid))]/60 flex items-center justify-center rounded-t-xl">
              <LibraryBig className="h-16 w-16 text-[hsl(var(--muted-kid-foreground))]/70" />
            </div>
          )}
        </div>
        <CardHeader className="pb-2 pt-3 px-4">
          <p className="text-xs font-semibold text-[hsl(var(--primary-kid))] mb-0.5 uppercase tracking-wider">
            {course.subject}
          </p>
          <CardTitle className="text-md font-bold leading-tight group-hover:text-[hsl(var(--primary-kid))] transition-colors line-clamp-2">
            {course.title}
          </CardTitle>
        </CardHeader>
        <CardContent className="px-4 pb-3 flex-grow">
          {course.description && (
            <p className="text-xs text-[hsl(var(--muted-kid-foreground))] line-clamp-3 mb-2">
              {course.description}
            </p>
          )}
        </CardContent>
        <CardFooter className="px-4 pt-2 pb-3 border-t border-[hsl(var(--border-kid))]/50 text-xs text-[hsl(var(--muted-kid-foreground))]">
          <SubjectIcon className="h-4 w-4 mr-1.5 opacity-70" />{" "}
          {course.itemCount} activities
        </CardFooter>
      </Card>
    </Link>
  );
}

export default async function CoursesListPage() {
  const session = await auth();
  if (!session?.user) redirect("/auth/signin");

  const { courses, error } = await getCoursesList();

  if (error) {
    return (
      <div className="p-4 md:p-8 text-red-500 text-center">
        Error loading learning adventures: {error}
      </div>
    );
  }
  if (!courses || courses.length === 0) {
    return (
      <div className="p-4 md:p-8 text-[hsl(var(--muted-kid-foreground))] text-center">
        No learning adventures available yet. Check back soon!
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 space-y-8">
      <div className="mb-8 text-center">
        <LibraryBig className="h-16 w-16 mx-auto text-[hsl(var(--primary-kid))] mb-3 opacity-80" />
        <h1 className="text-4xl font-extrabold tracking-tight text-[hsl(var(--foreground-kid))]">
          Learning Adventures
        </h1>
        <p className="mt-3 text-xl text-[hsl(var(--muted-kid-foreground))] max-w-2xl mx-auto">
          Explore structured paths filled with fun stories, quizzes, and
          activities!
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
        {courses.map((course) => (
          <CourseDisplayCard key={course.id} course={course} />
        ))}
      </div>
    </div>
  );
}
