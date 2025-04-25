import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Signout from "./(auth)/components/signout";

export default async function Home() {
  const session = await auth();

  if (!session) redirect("/login");
  return (
    <>
      <h1>Welcome {session.user?.name}</h1>
      <Signout />
    </>
  );
}
