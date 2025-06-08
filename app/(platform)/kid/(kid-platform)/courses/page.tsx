import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getCoursesList } from "@/actions/kid.actions";
import { NewCoursesListPage } from "./NewCoursesListPage"; // We'll create this next

export default async function CoursesListPage() {
  const session = await auth();
  if (!session?.user) redirect("/auth/signin");

  // Fetch the data on the server
  const { courses, error } = await getCoursesList();

  // Pass the server-fetched data to the new client component
  return <NewCoursesListPage courses={courses || []} error={error} />;
}
