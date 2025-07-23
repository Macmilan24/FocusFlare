export const dynamic = 'force-dynamic';
import KidRoadmapView from "@/components/kid/kid-roadmap-view";
import { Suspense } from "react";

export default function KidRoadmapPage() {
  return (
    <div className="h-full">
      <Suspense fallback={<p>Loading your treasure map...</p>}>
        <KidRoadmapView />
      </Suspense>
    </div>
  );
}
