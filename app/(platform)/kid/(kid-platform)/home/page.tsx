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
import Image from "next/image";
import {
  Gem,
  Award,
  BookHeart,
  Brain,
  Palette,
  Sparkles,
  BookOpen,
  Target,
  Puzzle,
  Edit3,
  HelpCircle,
} from "lucide-react";
import {
  getRecommendedContent,
  getContinueLearningContent,
  getSubjectCategories,
  ContentCardItem,
  SubjectCategory,
} from "@/actions/kid.actions"; // Ensure correct path
import {
  getEarnedBadgesForUser,
  EarnedBadge,
} from "@/actions/gamification.actions";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ContentType } from "@prisma/client";

interface SubjectCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  href: string;
  colorClass: string;
}

const subjects: SubjectCardProps[] = [
  {
    title: "Math Adventures",
    description: "Explore numbers, shapes, and fun puzzles!",
    icon: <Sparkles className="h-8 w-8" />,
    href: "/kid/math",
    colorClass:
      "bg-blue-100 dark:bg-blue-900 border-blue-300 dark:border-blue-700",
  },
  {
    title: "Story Time",
    description: "Dive into exciting stories and adventures.",
    icon: <BookOpen className="h-8 w-8" />,
    href: "/kid/stories",
    colorClass:
      "bg-green-100 dark:bg-green-900 border-green-300 dark:border-green-700",
  },
  {
    title: "Focus Games",
    description: "Sharpen your attention with engaging games.",
    icon: <Target className="h-8 w-8" />,
    href: "/kid/focus",
    colorClass:
      "bg-yellow-100 dark:bg-yellow-900 border-yellow-300 dark:border-yellow-700",
  },
  {
    title: "Creative Corner",
    description: "Draw, color, and express your imagination!",
    icon: <Palette className="h-8 w-8" />,
    href: "/kid/creative",
    colorClass:
      "bg-purple-100 dark:bg-purple-900 border-purple-300 dark:border-purple-700",
  },
  {
    title: "Quiz Zone",
    description: "Test your knowledge with fun quizzes!",
    icon: <Puzzle className="h-8 w-8" />, // Example icon
    href: "/kid/quizzes", // Link to the new quiz list page
    colorClass:
      "bg-indigo-100 dark:bg-indigo-900 border-indigo-300 dark:border-indigo-700",
  },
];

function ContentDisplayCard({ item }: { item: ContentCardItem }) {
  let linkHref = "#";
  if (item.contentType === ContentType.STORY)
    linkHref = `/kid/stories/${item.id}`;
  else if (item.contentType === ContentType.QUIZ)
    linkHref = `/kid/quizzes/${item.id}`;
  // Add links for LESSON, COURSE later

  return (
    <Link href={linkHref} passHref className="block group">
      <Card className="h-full overflow-hidden shadow-lg hover:shadow-xl dark:hover:shadow-primary/30 transition-all duration-300 ease-in-out transform hover:-translate-y-1 border-2 border-transparent hover:border-primary/50 rounded-xl">
        <div className="relative w-full h-40">
          {item.coverImageUrl ? (
            <Image
              src={item.coverImageUrl}
              alt={item.title}
              layout="fill"
              objectFit="cover"
              className="group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full bg-muted flex items-center justify-center">
              {item.contentType === ContentType.STORY && (
                <BookHeart className="h-12 w-12 text-muted-foreground/50" />
              )}
              {item.contentType === ContentType.QUIZ && (
                <Brain className="h-12 w-12 text-muted-foreground/50" />
              )}
              {/* Add icons for other content types */}
            </div>
          )}
          {/* Optional: Tag for content type */}
          <Badge
            variant="secondary"
            className="absolute top-2 right-2 shadow capitalize bg-opacity-80 backdrop-blur-sm"
          >
            {item.contentType.toLowerCase()}
          </Badge>
        </div>
        <CardHeader className="pb-2 pt-4 px-4">
          {item.courseTitle && (
            <p className="text-xs text-primary font-semibold mb-0.5">
              {item.courseTitle}
            </p>
          )}
          <CardTitle className="text-md lg:text-lg font-bold leading-tight group-hover:text-primary transition-colors">
            {item.title}
          </CardTitle>
        </CardHeader>
        <CardContent className="px-4 pb-4">
          {item.description && (
            <p className="text-xs lg:text-sm text-muted-foreground line-clamp-2">
              {item.description}
            </p>
          )}
          {item.progressPercentage !== undefined && (
            <div className="mt-2">
              <Progress value={item.progressPercentage} className="h-1.5" />
              <p className="text-xs text-muted-foreground mt-1">
                {item.progressPercentage}% completed
              </p>
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
  if (session.user.role !== "CHILD") redirect("/parent/overview"); // Or a generic app page

  const [recommended, continueLearning, subjects, { badges: earnedBadges }] =
    await Promise.all([
      getRecommendedContent(4),
      getContinueLearningContent(3), // Maybe fewer for continue learning
      getSubjectCategories(),
      getEarnedBadgesForUser(session.user.id), // Fetch earned badges
    ]);
  const userPoints = session.user.points || 0;
  const childUser = session.user; // For easier access

  const initials = (
    childUser.username?.substring(0, 1) ||
    childUser.name?.substring(0, 1) ||
    "K"
  ).toUpperCase();

  return (
    <div className="p-2 sm:p-4 space-y-8 md:space-y-10">
      {/* Hero Welcome Section */}
      <section className="flex flex-col sm:flex-row items-center justify-between gap-4 md:gap-6 p-4 bg-card dark:bg-slate-800/50 rounded-xl shadow">
        <div className="flex items-center gap-3 sm:gap-4">
          <Avatar className="h-16 w-16 sm:h-20 sm:w-20 border-2 border-purple-300 dark:border-purple-600">
            <AvatarImage src={childUser.image || undefined} />
            <AvatarFallback className="text-2xl sm:text-3xl bg-purple-100 dark:bg-purple-800 text-purple-600 dark:text-purple-300">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-800 dark:text-slate-100">
              {childUser.username || childUser.name || "Welcome, Explorer!"}
            </h1>
            <Link
              href="/kid/profile/edit"
              className="text-xs text-primary hover:underline flex items-center"
            >
              <Edit3 className="h-3 w-3 mr-1" /> Edit Profile{" "}
              {/* Link to future profile edit page */}
            </Link>
          </div>
        </div>

        <div className="flex items-center gap-4 sm:gap-6 text-sm text-muted-foreground">
          {/* Streaks - Placeholder for now */}
          {/* <div className="flex items-center gap-1">
            <Zap className="h-5 w-5 text-orange-500"/>
            <span><span className="font-bold text-slate-700 dark:text-slate-200">0</span> week streak</span>
          </div>
          <Separator orientation="vertical" className="h-6 hidden sm:block"/> */}
          <div className="flex items-center gap-1.5 p-2 px-3 rounded-lg bg-amber-100 dark:bg-amber-800/50 border border-amber-300 dark:border-amber-600">
            <Gem className="h-5 w-5 text-amber-600 dark:text-amber-400" />
            <span className="font-bold text-lg text-amber-700 dark:text-amber-300">
              {userPoints}
            </span>
            <span className="text-xs">Points</span>
          </div>
          {/* Badges quick display */}
          {earnedBadges && earnedBadges.length > 0 && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Link
                    href="/kid/badges"
                    className="flex items-center gap-1.5 p-2 px-3 rounded-lg bg-pink-100 dark:bg-pink-800/50 border border-pink-300 dark:border-pink-600"
                  >
                    <Award className="h-5 w-5 text-pink-600 dark:text-pink-400" />
                    <span className="font-bold text-lg text-pink-700 dark:text-pink-300">
                      {earnedBadges.length}
                    </span>
                    <span className="text-xs">Badges</span>
                  </Link>
                </TooltipTrigger>
                <TooltipContent>
                  <p>View all your awesome badges!</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
      </section>

      {/* Continue Learning Section */}
      {continueLearning.length > 0 && (
        <section>
          <h2 className="text-2xl md:text-3xl font-bold mb-6 text-slate-800 dark:text-slate-100">
            Keep Going...
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-8">
            {continueLearning.map((item) => (
              <ContentDisplayCard key={`continue-${item.id}`} item={item} />
            ))}
          </div>
        </section>
      )}

      {/* Recommended For You Section */}
      {recommended.length > 0 && (
        <section>
          <h2 className="text-2xl md:text-3xl font-bold mb-6 text-slate-800 dark:text-slate-100">
            Just For You ✨
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-8">
            {recommended.map((item) => (
              <ContentDisplayCard key={`reco-${item.id}`} item={item} />
            ))}
          </div>
        </section>
      )}

      {/* Explore by Subject Section */}
      <section>
        <h2 className="text-2xl md:text-3xl font-bold mb-6 text-slate-800 dark:text-slate-100">
          Explore Subjects
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
          {subjects.map((subject) => {
            return (
              <Link
                href={`/kid/subject/${subject.name.toLowerCase()}`}
                key={subject.name}
                className="group block"
              >
                <Card className="text-center p-4 md:p-6 aspect-square flex flex-col items-center justify-center rounded-2xl shadow-md hover:shadow-xl dark:hover:shadow-primary/30 bg-white dark:bg-slate-800 hover:border-primary dark:hover:border-primary transition-all transform hover:scale-105 border-2 border-transparent">
                  <HelpCircle className="h-10 w-10 md:h-12 md:w-12 text-primary mb-2 md:mb-3 transition-transform group-hover:scale-110" />
                  <p className="font-semibold text-sm md:text-md text-slate-700 dark:text-slate-200 group-hover:text-primary transition-colors">
                    {subject.name}
                  </p>
                  {subject.itemCount !== undefined && (
                    <p className="text-xs text-muted-foreground">
                      {subject.itemCount} activities
                    </p>
                  )}
                </Card>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Placeholder for AI Roadmap */}
      <section>
        <Card className="p-6 md:p-8 bg-gradient-to-r from-teal-400 via-cyan-500 to-sky-600 rounded-2xl shadow-xl text-white text-center">
          <CardTitle className="text-2xl md:text-3xl font-bold mb-3">
            Your AI Learning Roadmap
          </CardTitle>
          <CardDescription className="text-lg opacity-90 mb-6">
            A personalized journey just for you, coming soon!
          </CardDescription>
          <Button
            size="lg"
            variant="secondary"
            className="bg-white/90 hover:bg-white text-teal-600 font-semibold shadow-md"
          >
            Learn More (Soon)
          </Button>
        </Card>
      </section>
    </div>
  );
}
