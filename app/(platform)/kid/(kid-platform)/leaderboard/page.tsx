// focusflare (main app) / app/(platform)/kid/(kid-platform)/leaderboard/page.tsx
import {
  getFamilyLeaderboard,
  getGlobalLeaderboard,
} from "@/actions/leaderboard.actions";
import { LeaderboardDisplay } from "@/components/gamification/leaderboard-display";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"; // npx shadcn@latest add tabs
import { Users, Globe } from "lucide-react";
import { Separator } from "@/components/ui/separator";

export default async function KidLeaderboardPage() {
  // Fetch both leaderboards
  const familyDataPromise = getFamilyLeaderboard();
  const globalDataPromise = getGlobalLeaderboard(); // Default top 10

  const [familyResult, globalResult] = await Promise.all([
    familyDataPromise,
    globalDataPromise,
  ]);

  return (
    <div className="space-y-10 p-2 md:p-4">
      <div className="text-center">
        <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-[hsl(var(--primary-kid))] to-[hsl(var(--accent-kid))] mb-2">
          Leaderboards
        </h1>
        <p className="text-lg text-[hsl(var(--muted-kid-foreground))]">
          See who&apos;s leading the learning adventure!
        </p>
      </div>

      <Tabs defaultValue="family" className="w-full max-w-3xl mx-auto">
        <TabsList className="grid w-full grid-cols-2 bg-slate-100 h-12 shadow">
          <TabsTrigger
            value="family"
            className="text-md h-full data-[state=active]:bg-orange-400 data-[state=active]:text-white data-[state=active]:shadow-inner transition-all duration-300 ease-in-out"
          >
            <Users className="mr-2 h-5 w-5" /> Family Challenge
          </TabsTrigger>
          <TabsTrigger
            value="global"
            className="text-md h-full data-[state=active]:bg-orange-400 data-[state=active]:text-white data-[state=active]:shadow-inner transition-all duration-300 ease-in-out"
          >
            <Globe className="mr-2 h-5 w-5" /> Global Stars
          </TabsTrigger>
        </TabsList>
        <Separator className="my-6" />
        <TabsContent value="family">
          {familyResult.error ? (
            <p className="text-red-500 text-center">{familyResult.error}</p>
          ) : (
            <LeaderboardDisplay
              title="Our Family Scoreboard 🏆"
              users={familyResult.leaderboard || []}
              currentUserData={
                // Construct a simple version for family highlighting
                familyResult.leaderboard?.find(
                  (u) => u.rank === familyResult.currentUserRank
                )
                  ? {
                      ...familyResult.leaderboard.find(
                        (u) => u.rank === familyResult.currentUserRank
                      )!,
                      isRanked: true,
                    }
                  : undefined
              }
              isFamily={true}
            />
          )}
        </TabsContent>
        <TabsContent value="global">
          {globalResult.error ? (
            <p className="text-red-500 text-center">{globalResult.error}</p>
          ) : (
            <LeaderboardDisplay
              title="Top Global Explorers ✨"
              users={globalResult.leaderboard || []}
              currentUserData={globalResult.currentUserData}
              isFamily={false}
            />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
