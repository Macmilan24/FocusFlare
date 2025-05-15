// app/(platform)/kid/(kid-platform)/roadmap/page.tsx
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getKidRoadmapData, RoadmapNode } from "@/actions/roadmap.actions"; // Adjust path
import { KidRoadmapView } from "@/components/kid/kid-roadmap-view"; // Client component for display
import { AlertTriangle, Map } from "lucide-react";

export default async function KidRoadmapPage() {
  const session = await auth();
  if (!session?.user || session.user.role !== "CHILD") {
    redirect(
      session?.user
        ? session.user.role === "PARENT"
          ? "/parent/overview"
          : "/auth/signin"
        : "/auth/signin"
    );
  }

  const { nodes, error } = await getKidRoadmapData();

  return (
    <div className="space-y-6 p-2 sm:p-4 md:p-6">
      <div className="text-center mb-8">
        <Map className="h-16 w-16 mx-auto text-[hsl(var(--primary-kid))] mb-3 opacity-80" />
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[hsl(var(--foreground-kid))]">
          Your Learning Adventure Map!
        </h1>
        <p className="text-md sm:text-lg text-[hsl(var(--muted-kid-foreground))] mt-2 max-w-2xl mx-auto">
          Follow the path to explore new topics, practice your skills, and earn
          awesome rewards!
        </p>
      </div>

      {error && (
        <div className="flex flex-col items-center justify-center text-center p-6 bg-[hsl(var(--destructive-kid))]/10 border border-[hsl(var(--destructive-kid))]/30 rounded-lg">
          <AlertTriangle className="h-10 w-10 text-[hsl(var(--destructive-kid))]/80 mb-3" />
          <p className="font-semibold text-[hsl(var(--destructive-kid))]">
            Oops! Could not load your roadmap.
          </p>
          <p className="text-sm text-[hsl(var(--destructive-kid))]/70">
            {error}
          </p>
        </div>
      )}

      {!error && nodes && nodes.length === 0 && (
        <p className="text-center text-lg text-[hsl(var(--muted-kid-foreground))] py-10">
          Your adventure map is being drawn... come back soon to see your path!
        </p>
      )}

      {!error && nodes && nodes.length > 0 && (
        // KidRoadmapView will handle the actual visual rendering of the nodes
        <KidRoadmapView initialNodes={nodes} />
      )}
    </div>
  );
}
