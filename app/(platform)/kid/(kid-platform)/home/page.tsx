import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image"; // Keep for content cards
import { Gem, Award, Edit3, Sparkles as SparkleIcon } from "lucide-react";
import * as LucideIcons from "lucide-react";
import {
  getRecommendedContent,
  getContinueLearningContent,
  getSubjectCategories,
  ContentCardItem, // Ensure this includes coverImageUrl at top level
} from "@/actions/kid.actions";
import { getEarnedBadgesForUser } from "@/actions/gamification.actions";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { ContentType } from "@prisma/client";
function ContentDisplayCard({ item }: { item: ContentCardItem }) {
  let linkHref = "#";
  let IconType: LucideIcons.LucideIcon | null = null;

  if (item.contentType === ContentType.STORY) {
    linkHref = `/kid/stories/${item.id}`;
    IconType = LucideIcons.BookHeart;
  } else if (item.contentType === ContentType.QUIZ) {
    linkHref = `/kid/quizzes/${item.id}`;
    IconType = LucideIcons.Brain;
  } else if (item.contentType === ContentType.LESSON) {
    IconType = LucideIcons.ClipboardList;
  } else if (item.contentType === ContentType.COURSE) {
    IconType = LucideIcons.LibraryBig;
  }

  return (
    <Link href={linkHref} passHref className="block group">
      <Card className="h-full flex flex-col overflow-hidden shadow-lg hover:shadow-xl dark:hover:shadow-[hsl(var(--primary-kid))]/30 transition-all duration-300 ease-in-out transform hover:-translate-y-1.5 border-2 border-transparent hover:border-[hsl(var(--primary-kid))]/50 rounded-2xl bg-[hsl(var(--card-kid))] text-[hsl(var(--card-foreground-kid))]">
        <div className="relative w-full h-36 sm:h-40">
          {" "}
          {/* Adjusted height for content cards */}
          {item.coverImageUrl ? (
            <Image
              src={item.coverImageUrl}
              alt={item.title}
              layout="fill"
              objectFit="cover"
              className="group-hover:scale-105 transition-transform duration-300 rounded-t-xl"
            />
          ) : (
            <div className="w-full h-full bg-[hsl(var(--muted-kid))] flex items-center justify-center rounded-t-xl">
              {IconType ? (
                <IconType className="h-12 w-12 text-[hsl(var(--muted-kid-foreground))]/50" />
              ) : (
                <SparkleIcon className="h-12 w-12 text-[hsl(var(--muted-kid-foreground))]/50" />
              )}
            </div>
          )}
          <Badge
            variant="secondary"
            className="absolute top-2 right-2 shadow capitalize bg-[hsl(var(--accent-kid))]/80 text-[hsl(var(--accent-kid-foreground))] text-xs px-2 py-0.5 backdrop-blur-sm"
          >
            {item.contentType.toLowerCase().replace("_", " ")}
          </Badge>
        </div>
        <CardHeader className="pb-2 pt-3 px-3 sm:px-4">
          {item.courseTitle && (
            <p className="text-xs text-[hsl(var(--primary-kid))] font-semibold mb-0.5 line-clamp-1">
              {item.courseTitle}
            </p>
          )}
          <CardTitle className="text-sm sm:text-md font-bold leading-tight group-hover:text-[hsl(var(--primary-kid))] transition-colors line-clamp-2">
            {item.title}
          </CardTitle>
        </CardHeader>
        <CardContent className="px-3 sm:px-4 pb-3 flex-grow">
          {item.description && (
            <p className="text-xs sm:text-sm text-[hsl(var(--muted-kid-foreground))] line-clamp-2 sm:line-clamp-3">
              {item.description}
            </p>
          )}
          {item.progressPercentage !== undefined && (
            <div className="mt-2">
              <Progress
                value={item.progressPercentage}
                className="h-1.5 bg-[hsl(var(--primary-kid))]/20 [&>div]:bg-[hsl(var(--primary-kid))]"
              />
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}

export default async function KidHomePage() {
  const session = await auth();
  if (!session?.user) redirect("/auth/signin");
  if (session.user.role !== "CHILD") redirect("/parent/overview");

  const [
    recommended,
    continueLearning,
    subjects,
    { badges: earnedBadgesData },
  ] = await Promise.all([
    getRecommendedContent(4),
    getContinueLearningContent(3),
    getSubjectCategories(),
    getEarnedBadgesForUser(session.user.id),
  ]);
  const userPoints = session.user.points || 0;
  const childUser = session.user;
  const earnedBadges = earnedBadgesData || []; // Ensure earnedBadges is an array

  const initials = (
    childUser.username?.substring(0, 1) ||
    childUser.name?.substring(0, 1) ||
    "K"
  ).toUpperCase();

  return (
    <div className="kid-theme-content p-3 sm:p-4 md:p-6 space-y-10 md:space-y-12">
      <section className="flex flex-col sm:flex-row items-center justify-between gap-4 md:gap-6 p-4 bg-[hsl(var(--card-kid))] rounded-2xl shadow-lg border border-[hsl(var(--border-kid))]">
        <div className="flex items-center gap-3 sm:gap-4">
          <Avatar className="h-14 w-14 sm:h-16 sm:w-16 border-2 border-[hsl(var(--primary-kid))]">
            <AvatarImage src={childUser.image || undefined} />
            <AvatarFallback className="text-xl sm:text-2xl bg-[hsl(var(--primary-kid))]/20 text-[hsl(var(--primary-kid))] font-semibold">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-lg sm:text-xl font-bold text-[hsl(var(--foreground-kid))]">
              {childUser.username || childUser.name || "Hey Explorer!"}
            </h1>
            <Link
              href="/kid/profile/edit"
              className="text-xs text-[hsl(var(--primary-kid))] hover:underline flex items-center opacity-80 hover:opacity-100 transition-opacity"
            >
              <Edit3 className="h-3 w-3 mr-1" /> My Profile
            </Link>
          </div>
        </div>

        <div className="flex items-center gap-3 sm:gap-4 text-sm">
          <div className="flex items-center gap-1.5 p-2 px-3 rounded-lg bg-[hsl(var(--accent-kid))]/20 border border-[hsl(var(--accent-kid))]/50">
            <Gem className="h-5 w-5 text-[hsl(var(--accent-kid))]" />
            <span className="font-bold text-lg text-[hsl(var(--accent-kid))]">
              {userPoints}
            </span>
            <span className="text-xs text-[hsl(var(--accent-kid-foreground))] opacity-80">
              Points
            </span>
          </div>
          {earnedBadges && earnedBadges.length > 0 && (
            <TooltipProvider>
              {" "}
              <Tooltip>
                {" "}
                <TooltipTrigger asChild>
                  <Link
                    href="/kid/badges"
                    className="flex items-center gap-1.5 p-2 px-3 rounded-lg bg-[hsl(var(--secondary-kid))]/20 border border-[hsl(var(--secondary-kid))]/50"
                  >
                    <Award className="h-5 w-5 text-[hsl(var(--secondary-kid))]" />
                    <span className="font-bold text-lg text-[hsl(var(--secondary-kid))]">
                      {earnedBadges.length}
                    </span>
                    <span className="text-xs text-[hsl(var(--secondary-kid-foreground))] opacity-80">
                      Badges
                    </span>
                  </Link>
                </TooltipTrigger>
                <TooltipContent>
                  <p>View your badges!</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
      </section>
      {continueLearning && continueLearning.length > 0 && (
        <section>
          <h2 className="text-xl md:text-2xl font-bold mb-4 text-[hsl(var(--foreground-kid))]">
            Keep Going... <span className="text-lg">🚀</span>
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-4 sm:gap-x-6 gap-y-6">
            {continueLearning.map((item) => (
              <ContentDisplayCard key={`continue-${item.id}`} item={item} />
            ))}
          </div>
        </section>
      )}
      {/* Recommended For You Section */}
      {recommended && recommended.length > 0 && (
        <section>
          <h2 className="text-xl md:text-2xl font-bold mb-4 text-[hsl(var(--foreground-kid))]">
            Just For You ✨
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-4 sm:gap-x-6 gap-y-6">
            {recommended.map((item) => (
              <ContentDisplayCard key={`reco-${item.id}`} item={item} />
            ))}
          </div>
        </section>
      )}
      {/* Explore by Subject Section */}
      <section>
        <h2 className="text-xl md:text-2xl font-bold mb-4 text-[hsl(var(--foreground-kid))]">
          Explore Subjects
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4 md:gap-5">
          {subjects.map((subject) => {
            return (
              <Link
                href={`/kid/subject/${subject.name
                  .toLowerCase()
                  .replace(/\s+/g, "-")}`}
                key={subject.name}
                className="group block"
              >
                <Card className="text-center p-3 sm:p-4 aspect-[4/3] sm:aspect-square flex flex-col items-center justify-center rounded-2xl shadow-md hover:shadow-xl dark:hover:shadow-[hsl(var(--primary-kid))]/30 bg-[hsl(var(--card-kid))] hover:border-[hsl(var(--primary-kid))] dark:hover:border-[hsl(var(--primary-kid))] transition-all transform hover:scale-105 border-2 border-transparent">
                  <LucideIcons.HelpCircle className="h-8 w-8 sm:h-10 sm:w-10 text-[hsl(var(--primary-kid))] mb-1 sm:mb-2 transition-transform group-hover:scale-110" />
                  <p className="font-semibold text-xs sm:text-sm text-[hsl(var(--card-foreground-kid))] group-hover:text-[hsl(var(--primary-kid))] transition-colors">
                    {subject.name}
                  </p>
                  {subject.itemCount !== undefined && (
                    <p className="text-[10px] sm:text-xs text-[hsl(var(--muted-kid-foreground))]">
                      {subject.itemCount} activities
                    </p>
                  )}
                </Card>
              </Link>
            );
          })}
        </div>
      </section>
      {/* AI Roadmap Placeholder */}
      <section>
        <Card className="p-6 md:p-8 bg-gradient-to-r from-[hsl(var(--secondary-kid))] via-[hsl(var(--primary-kid))] to-[hsl(var(--accent-kid))] rounded-2xl shadow-xl text-center">
          <CardTitle className="text-2xl md:text-3xl font-bold mb-3 text-white">
            Your Personal Learning Path!
          </CardTitle>
          <CardDescription className="text-lg text-white/80 mb-6">
            AI will help guide your adventure, coming very soon!
          </CardDescription>
          <Button
            size="lg"
            variant="outline"
            className="bg-white/20 hover:bg-white/30 border-white/50 text-white font-semibold shadow-md text-md px-6 py-3"
          >
            What&apos;s Next? (AI Roadmap)
          </Button>
        </Card>
      </section>
    </div>
  );
}
