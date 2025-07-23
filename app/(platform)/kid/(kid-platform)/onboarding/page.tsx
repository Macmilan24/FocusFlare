import { getGradeLevels } from "@/actions/kid.actions";
import { OnboardingForm } from "@/components/kid/onboarding-form";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Suspense } from "react";

const subjects = [
  { name: "Mathematics" },
  { name: "Reading" },
  { name: "StoryTime" },
  { name: "QuizZone" },
];

export default async function OnboardingPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/auth/signin");
  }

  // Fetch grade levels for the form
  const gradeLevels = await getGradeLevels();

  return (
    <div className="container mx-auto flex items-center justify-center min-h-full p-4">
      <Suspense fallback={<p>Loading setup...</p>}>
        <OnboardingForm
          userId={session.user.id}
          gradeLevels={gradeLevels}
          subjects={subjects}
        />
      </Suspense>
    </div>
  );
}
