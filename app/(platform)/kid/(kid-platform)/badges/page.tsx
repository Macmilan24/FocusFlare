import { getEarnedBadgesForUser } from "@/actions/gamification.actions";
import { Card, CardTitle } from "@/components/ui/card"; // For dynamic badge icons
import { Award } from "lucide-react"; // Default icon

export default async function KidBadgesPage() {
  const { badges, error } = await getEarnedBadgesForUser();

  return (
    <div className="space-y-6">
      <div className="text-center">
        <Award className="h-16 w-16 mx-auto text-[hsl(var(--accent-kid))] mb-2" />
        <h1 className="text-3xl font-bold text-[hsl(var(--foreground-kid))]">
          My Awesome Badges!
        </h1>
        <p className="text-[hsl(var(--muted-kid-foreground))]">
          Look at all the cool badges you&apos;ve collected!
        </p>
      </div>
      {error && <p className="text-red-500 text-center">{error}</p>}
      {!error && badges && badges.length === 0 && (
        <p className="text-center text-[hsl(var(--muted-kid-foreground))]">
          You haven&apos;t earned any badges yet. Keep learning!
        </p>
      )}
      {!error && badges && badges.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {badges.map((badge) => {
            return (
              <Card
                key={badge.id}
                className="flex flex-col items-center p-4 text-center bg-[hsl(var(--card-kid))] shadow-md"
              >
                <Award className="h-12 w-12 text-[hsl(var(--primary-kid))] mb-2" />
                <CardTitle className="text-md font-semibold text-[hsl(var(--card-foreground-kid))]">
                  {badge.name}
                </CardTitle>
                <p className="text-xs text-[hsl(var(--muted-kid-foreground))] mt-1">
                  {badge.description}
                </p>
                <p className="text-[10px] text-[hsl(var(--muted-kid-foreground))] mt-2">
                  Earned: {new Date(badge.earnedAt).toLocaleDateString()}
                </p>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
