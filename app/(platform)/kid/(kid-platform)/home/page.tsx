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
// import { motion } from "framer-motion"; // Temporarily comment out
import {
  Gem,
  Award,
  Edit3,
  Map,
  Compass,
  Rocket,
  Target,
  Footprints,
  BookHeart,
  Brain,
  LibraryBig,
  Calculator,
  BookOpen,
  Book,
  HelpCircle,
  Sparkles,
} from "lucide-react";
import {
  getRecommendedContent,
  getContinueLearningContent,
  getSubjectCategories,
  ContentCardItem,
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
import { ContentDisplayCard } from "@/components/kid/content-display-card";
import { cn } from "@/lib/utils";

// Define a specific map for subject icons
const subjectIconMap: Record<string, React.ElementType> = {
  Calculator: Calculator,
  BookOpen: BookOpen,
  Book: Book,
  HelpCircle: HelpCircle,
  // Add other specific subject icons here if needed
};

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
  const earnedBadges = earnedBadgesData || [];
  const initials = (
    childUser.username?.substring(0, 1) ||
    childUser.name?.substring(0, 1) ||
    "K"
  ).toUpperCase();

  return (
    <div className="kid-theme-content space-y-8 md:space-y-10">
      {/* Hero Section with Adventure Theme */}
      <section className="relative rounded-3xl bg-gradient-to-br from-[hsl(var(--primary-kid))] via-[hsl(var(--secondary-kid))] to-[hsl(var(--accent-kid))] p-6 md:p-8 overflow-hidden">
        <div className="absolute inset-0 bg-[url('/patterns/topography.svg')] opacity-10" />
        
        <div className="relative flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          {/* User Welcome */}
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16 md:h-20 md:w-20 ring-4 ring-white/20">
              <AvatarImage src={childUser.image || undefined} />
              <AvatarFallback className="text-2xl bg-white/10 text-white font-bold">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="space-y-1">
              <h1 className="text-2xl md:text-3xl font-bold text-white">
                Welcome back, {childUser.username || childUser.name || "Explorer"}!
              </h1>
              <Link
                href="/kid/profile/edit"
                className="inline-flex items-center text-white/80 hover:text-white text-sm transition-colors"
              >
                <Edit3 className="h-3.5 w-3.5 mr-1.5" />
                Customize My Profile
              </Link>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="flex flex-wrap gap-3">
            <Card className="bg-white/10 border-white/20 backdrop-blur-sm">
              <CardContent className="flex items-center gap-3 p-3">
                <div className="h-12 w-12 rounded-full bg-white/10 flex items-center justify-center">
                  <Gem className="h-6 w-6 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">{userPoints}</p>
                  <p className="text-xs text-white/70">Total Points</p>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-white/10 border-white/20 backdrop-blur-sm">
              <CardContent className="flex items-center gap-3 p-3">
                <div className="h-12 w-12 rounded-full bg-white/10 flex items-center justify-center">
                  <Award className="h-6 w-6 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">{earnedBadges.length}</p>
                  <p className="text-xs text-white/70">Badges Earned</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* AI Roadmap Preview */}
      <section>
        <Card className="relative overflow-hidden border-2 border-[hsl(var(--primary-kid))] shadow-lg">
          <div className="absolute inset-0 bg-[url('/patterns/compass-rose.svg')] opacity-5" />
          <CardContent className="relative p-6 md:p-8">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Map className="h-8 w-8 text-[hsl(var(--primary-kid))]" />
                  <h2 className="text-2xl font-bold">Your Next Adventure!</h2>
                </div>
                <p className="text-[hsl(var(--muted-kid-foreground))] max-w-md">
                  Follow your personalized learning path and discover exciting new challenges!
                </p>
              </div>
              <Link href="/kid/roadmap">
                <Button size="lg" className="gap-2">
                  <Compass className="h-5 w-5" />
                  View My Learning Map
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Continue Learning Section */}
      {continueLearning && continueLearning.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Rocket className="h-6 w-6 text-[hsl(var(--primary-kid))]" />
              <h2 className="text-xl font-bold">Keep Going...</h2>
            </div>
            <Link href="/kid/courses">
              <Button variant="ghost" className="gap-2">
                View All
                <Footprints className="h-4 w-4" />
              </Button>
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {continueLearning.map((item) => (
              <ContentDisplayCard key={`continue-${item.id}`} item={item} />
            ))}
          </div>
        </section>
      )}

      {/* Recommended Section */}
      {recommended && recommended.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Target className="h-6 w-6 text-[hsl(var(--secondary-kid))]" />
              <h2 className="text-xl font-bold">Just For You</h2>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {recommended.map((item) => (
              <ContentDisplayCard key={`reco-${item.id}`} item={item} />
            ))}
          </div>
        </section>
      )}

      {/* Explore Subjects Section */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <Sparkles className="h-6 w-6 text-[hsl(var(--accent-kid))]" />
          <h2 className="text-xl font-bold">Explore Adventure Worlds</h2>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {subjects.map((subject, index) => {
            const SpecificIcon = subject.iconSlug ? subjectIconMap[subject.iconSlug] : undefined;
            const IconComponent = SpecificIcon || Sparkles;

            return (
              <Link
                href={`/kid/subject/${subject.name.toLowerCase().replace(/\s+/g, "-")}`}
                key={subject.name}
                className="group block"
              >
                {/* <motion.div  // Temporarily remove motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                > */}
                  <Card className={cn(
                    "relative overflow-hidden aspect-square p-4",
                    "flex flex-col items-center justify-center text-center",
                    "border-2 border-transparent",
                    "transition-all duration-300 group-hover:scale-105", // Keep hover effects
                    "group-hover:border-[hsl(var(--primary-kid))]",
                    "group-hover:shadow-lg"
                  )}>
                    <div className="absolute inset-0 bg-gradient-to-br from-[hsl(var(--primary-kid))]/5 to-[hsl(var(--accent-kid))]/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                    <IconComponent className="h-12 w-12 mb-3 text-[hsl(var(--muted-kid-foreground))] group-hover:text-[hsl(var(--primary-kid))] transition-colors" />
                    <CardTitle className="text-sm font-bold mb-1 group-hover:text-[hsl(var(--primary-kid))] transition-colors">
                      {subject.name}
                    </CardTitle>
                    {subject.itemCount !== undefined && (
                      <p className="text-xs text-[hsl(var(--muted-kid-foreground))]">
                        {subject.itemCount} activities
                      </p>
                    )}
                  </Card>
                {/* </motion.div> */}
              </Link>
            );
          })}
        </div>
      </section>

      {/* Quick Access Section */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link href="/kid/stories">
          <Card className="group hover:border-[hsl(var(--primary-kid))] transition-all hover:shadow-lg">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="h-12 w-12 rounded-full bg-[hsl(var(--primary-kid))]/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                <BookHeart className="h-6 w-6 text-[hsl(var(--primary-kid))]" />
              </div>
              <div>
                <h3 className="font-bold mb-1 group-hover:text-[hsl(var(--primary-kid))] transition-colors">Stories</h3>
                <p className="text-sm text-[hsl(var(--muted-kid-foreground))]">Discover amazing tales</p>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/kid/quizzes">
          <Card className="group hover:border-[hsl(var(--secondary-kid))] transition-all hover:shadow-lg">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="h-12 w-12 rounded-full bg-[hsl(var(--secondary-kid))]/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Brain className="h-6 w-6 text-[hsl(var(--secondary-kid))]" />
              </div>
              <div>
                <h3 className="font-bold mb-1 group-hover:text-[hsl(var(--secondary-kid))] transition-colors">Quizzes</h3>
                <p className="text-sm text-[hsl(var(--muted-kid-foreground))]">Test your knowledge</p>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/kid/courses">
          <Card className="group hover:border-[hsl(var(--accent-kid))] transition-all hover:shadow-lg">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="h-12 w-12 rounded-full bg-[hsl(var(--accent-kid))]/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                <LibraryBig className="h-6 w-6 text-[hsl(var(--accent-kid))]" />
              </div>
              <div>
                <h3 className="font-bold mb-1 group-hover:text-[hsl(var(--accent-kid))] transition-colors">Adventures</h3>
                <p className="text-sm text-[hsl(var(--muted-kid-foreground))]">Start a learning journey</p>
              </div>
            </CardContent>
          </Card>
        </Link>
      </section>
    </div>
  );
}
