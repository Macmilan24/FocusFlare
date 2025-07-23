import {
  getRoadmapForCurrentUser,
  generateRoadmapForUser,
} from "@/actions/roadmap.actions";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { KeyRound, Lock, Gift } from "lucide-react";
import Link from "next/link";

// A simple component to render the appropriate icon based on status
const StatusIcon = ({
  status,
  isCurrent,
}: {
  status: string;
  isCurrent: boolean;
}) => {
  if (status === "completed") {
    return <Gift className="h-8 w-8 text-amber-600" />;
  }
  if (isCurrent) {
    return <KeyRound className="h-8 w-8 text-yellow-400 animate-pulse" />;
  }
  if (status === "locked") {
    return <Lock className="h-8 w-8 text-gray-500" />;
  }
  return null;
};

export default async function KidRoadmapView() {
  const roadmapData = await getRoadmapForCurrentUser();

  // Defensively filter out items where the associated course might have been deleted
  const validItems = roadmapData?.items.filter((item) => item.course) || [];

  // If no roadmap exists, prompt for onboarding
  if (!roadmapData) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-8">
        <Card>
          <CardHeader>
            <CardTitle>Your Adventure Awaits!</CardTitle>
            <CardDescription>
              Complete your assessment to build your personalized learning map.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p>
              <Link
                href="/kid/onboarding"
                className="text-primary hover:underline font-bold"
              >
                Click here to start your assessment
              </Link>{" "}
              and unlock your first course!
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }
  // If roadmap exists but has no items, inform the user
  if (validItems.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-8">
        <Card>
          <CardHeader>
            <CardTitle>No Courses Available Yet</CardTitle>
            <CardDescription>
              We’re adding new adventures for your level. Check back soon!
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  // Find the first item that is not completed from the valid list
  const currentItem =
    validItems.find((item) => item.status !== "completed") ||
    validItems[validItems.length - 1];

  return (
    <div className="p-4 md:p-8 bg-map-background bg-cover bg-center">
      <h1
        className="text-4xl font-bold text-center mb-4 text-amber-800"
        style={{ fontFamily: "'Cinzel Decorative', cursive" }}
      >
        Your Learning Treasure Map
      </h1>
      <p className="text-center text-amber-700 mb-12 max-w-2xl mx-auto">
        Follow the path to unlock new courses, earn points, and become a master
        learner! Each step on your journey is a new course to explore.
      </p>

      <div className="relative">
        {/* Dotted line connecting the nodes */}
        <div className="absolute left-1/2 top-0 bottom-0 w-1 -translate-x-1/2">
          <div className="h-full w-full border-l-4 border-dashed border-amber-700/50"></div>
        </div>

        <div className="space-y-16">
          {validItems.map((item, index) => {
            const isCurrent = item.id === currentItem.id;
            const isLocked = item.status === "locked";

            const cardContent = (
              <Card
                className={cn(
                  "w-full max-w-md transition-all duration-300 hover:shadow-xl hover:scale-105 bg-amber-50/80 backdrop-blur-sm border-2 border-amber-700/60 shadow-lg",
                  isLocked &&
                    "bg-gray-200/80 border-gray-400/60 cursor-not-allowed",
                  isCurrent && "border-yellow-400 scale-105",
                  index % 2 === 0 ? "mr-auto" : "ml-auto"
                )}
              >
                <CardHeader className="flex flex-row items-start gap-4">
                  <div className="flex-shrink-0">
                    <StatusIcon status={item.status} isCurrent={isCurrent} />
                  </div>
                  <div>
                    <CardTitle className="text-xl text-amber-900">
                      {item.course.title}
                    </CardTitle>
                    <CardDescription className="text-amber-800">
                      {item.course.subject}
                    </CardDescription>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-amber-900/80 line-clamp-2">
                    {item.course.description}
                  </p>
                </CardContent>
              </Card>
            );

            return (
              <div key={item.id} className="relative">
                {isLocked ? (
                  <div className="cursor-not-allowed">{cardContent}</div>
                ) : (
                  <Link href={`/kid/courses/${item.courseId}`}>
                    {cardContent}
                  </Link>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
