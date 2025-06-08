import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { getCourseDetails } from "@/actions/kid.actions";
import {
  ArrowLeft,
  CheckCircle2,
  Lock,
  PlayCircle,
  RefreshCw,
  Sparkles,
  Trophy,
  BookHeart,
  Puzzle,
  ClipboardList,
  Gamepad2,
  FileText,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { ContentType } from "@prisma/client";
import { type LucideIcon } from "lucide-react";

// Helper to get content type icon, moved inside the component for clarity
const getContentTypeIcon = (contentType: ContentType): LucideIcon => {
  switch (contentType) {
    case ContentType.STORY:
      return BookHeart;
    case ContentType.QUIZ:
      return Puzzle;
    case ContentType.LESSON:
      return ClipboardList;
    case ContentType.GAME:
      return Gamepad2;
    default:
      return FileText;
  }
};

type StepStatus = "completed" | "current" | "locked";

const getStepStatusStyles = (status: StepStatus) => {
  switch (status) {
    case "completed":
      return {
        iconBg: "bg-green-500",
        iconColor: "text-white",
        textColor: "text-slate-600",
        lineColor: "bg-green-500",
        wrapperClass: "opacity-80",
      };
    case "current":
      return {
        iconBg: "bg-cyan-500 animate-pulse",
        iconColor: "text-white",
        textColor: "text-slate-800 font-semibold",
        lineColor: "bg-cyan-500",
        wrapperClass:
          "border-2 border-cyan-400 rounded-2xl shadow-lg bg-cyan-50/50 p-4",
      };
    case "locked":
      return {
        iconBg: "bg-slate-300",
        iconColor: "text-slate-500",
        textColor: "text-slate-400",
        lineColor: "bg-slate-300",
        wrapperClass: "opacity-60 cursor-not-allowed",
      };
  }
};

const AdventureStep = ({
  item,
  isLast,
  isCurrent,
}: {
  item: NonNullable<
    NonNullable<
      Awaited<ReturnType<typeof getCourseDetails>>["courseDetails"]
    >["items"]
  >[0];
  isLast: boolean;
  isCurrent: boolean;
}) => {
  const isCompleted = item.status === "completed" || item.status === "passed";
  const status: StepStatus = isCompleted
    ? "completed"
    : isCurrent
    ? "current"
    : "locked";
  const styles = getStepStatusStyles(status);
  const IconComponent = getContentTypeIcon(item.contentType);

  const StepContent = (
    <div
      className={`relative flex items-start gap-4 pb-8 ${styles.wrapperClass}`}
    >
      {!isLast && (
        <div
          className={`absolute left-6 top-12 w-0.5 h-full ${styles.lineColor} -translate-x-1/2`}
        />
      )}
      <div
        className={`relative z-10 flex-shrink-0 flex items-center justify-center w-12 h-12 rounded-full ${styles.iconBg}`}
      >
        {status === "completed" ? (
          <CheckCircle2 className={`h-6 w-6 ${styles.iconColor}`} />
        ) : status === "locked" ? (
          <Lock className={`h-5 w-5 ${styles.iconColor}`} />
        ) : (
          <IconComponent className={`h-6 w-6 ${styles.iconColor}`} />
        )}
      </div>
      <div className="flex-1 min-w-0 pt-2">
        <h3 className={`text-lg font-bold ${styles.textColor}`}>
          {item.title}
        </h3>
        <div className="flex items-center gap-4 text-sm mt-1">
          <Badge variant="outline" className="text-xs">
            {item.contentType.toLowerCase()}
          </Badge>
        </div>
      </div>
    </div>
  );

  return (
    <li>
      {status !== "locked" ? (
        <Link href={item.link} className="block">
          {StepContent}
        </Link>
      ) : (
        <div title="Complete previous steps to unlock">{StepContent}</div>
      )}
    </li>
  );
};

export default async function NewCourseDetailPage({
  params,
}: {
  params: { courseId: string };
}) {
  const session = await auth();
  if (!session?.user) redirect("/auth/signin");

  const { courseDetails, error } = await getCourseDetails(params.courseId);

  if (error || !courseDetails) {
    return (
      <div className="p-8 text-center">
        <p className="text-red-500">
          {error || "Could not find this adventure."}
        </p>
        <Button asChild variant="link" className="mt-4">
          <Link href="/kid/courses">Back to Adventures</Link>
        </Button>
      </div>
    );
  }

  const { title, description, subject, coverImageUrl, items } = courseDetails;
  const completedItemsCount = items.filter(
    (i) => i.status === "completed" || i.status === "passed"
  ).length;
  const progressPercentage =
    items.length > 0
      ? Math.round((completedItemsCount / items.length) * 100)
      : 0;
  const isCompleted = completedItemsCount === items.length;

  let currentStepIndex = items.findIndex(
    (item) => item.status !== "completed" && item.status !== "passed"
  );
  if (currentStepIndex === -1 && items.length > 0) currentStepIndex = 0; // If all are done, point to first for review
  const continueLink =
    items[currentStepIndex]?.link || (items.length > 0 ? items[0].link : "#");

  return (
    <div
      className="min-h-screen bg-gradient-to-br from-sky-50 via-cyan-50 to-emerald-50"
      style={{ fontFamily: "Nunito, sans-serif" }}
    >
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <Button
              asChild
              variant="ghost"
              className="text-slate-600 hover:text-slate-800"
            >
              <Link href="/kid/courses">
                <ArrowLeft className="h-4 w-4 mr-2" /> Back to All Adventures
              </Link>
            </Button>
            <div className="space-y-4">
              <h1 className="text-4xl md:text-5xl font-black text-slate-800 leading-tight">
                {title}
              </h1>
              <p className="text-lg text-slate-600 leading-relaxed max-w-3xl">
                {description}
              </p>
            </div>
            <div className="space-y-6">
              <div className="flex items-center gap-2">
                <h2 className="text-2xl font-bold text-slate-800">
                  Adventure Steps
                </h2>
                <Sparkles className="h-6 w-6 text-yellow-500" />
              </div>
              <ul className="space-y-0">
                {items.map((item, index) => (
                  <AdventureStep
                    key={item.id}
                    item={item}
                    index={index}
                    isLast={index === items.length - 1}
                    isCurrent={index === currentStepIndex}
                  />
                ))}
              </ul>
            </div>
          </div>
          <aside className="lg:col-span-1">
            <div className="sticky top-8">
              <Card className="rounded-2xl shadow-lg border-0 bg-white/80 backdrop-blur-sm">
                <CardHeader className="p-0">
                  <AspectRatio
                    ratio={16 / 9}
                    className="overflow-hidden rounded-t-2xl bg-slate-100"
                  >
                    {coverImageUrl ? (
                      <Image
                        src={coverImageUrl}
                        alt={title}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-cyan-200 to-blue-200">
                        <Trophy className="h-16 w-16 text-white/80" />
                      </div>
                    )}
                  </AspectRatio>
                </CardHeader>
                <CardContent className="p-6 space-y-6">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-semibold text-slate-600">
                        Progress
                      </span>
                      <span className="text-sm font-bold text-slate-800">
                        {progressPercentage}%
                      </span>
                    </div>
                    <Progress value={progressPercentage} className="h-4" />
                    <p className="text-xs text-slate-500 text-center">
                      {completedItemsCount} / {items.length} Steps Completed
                    </p>
                  </div>
                  <Badge className="bg-cyan-100 text-cyan-700 font-semibold">
                    {subject}
                  </Badge>
                </CardContent>
                <CardFooter className="p-6 pt-0">
                  <Button
                    asChild
                    size="lg"
                    className={`w-full font-bold rounded-xl shadow-lg transition-all duration-300 ${
                      isCompleted
                        ? "bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
                        : "bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600"
                    } text-white`}
                  >
                    <Link href={continueLink}>
                      {isCompleted ? (
                        <>
                          <RefreshCw className="h-5 w-5 mr-2" /> Review
                          Adventure
                        </>
                      ) : completedItemsCount > 0 ? (
                        <>
                          <PlayCircle className="h-5 w-5 mr-2" /> Continue
                          Adventure
                        </>
                      ) : (
                        <>
                          <PlayCircle className="h-5 w-5 mr-2" /> Start
                          Adventure!
                        </>
                      )}
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
