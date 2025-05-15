import { getLearningContentBySubject } from "@/actions/kid.actions";
import { ContentDisplayCard } from "@/components/kid/content-display-card";
import { capitalizeWords } from "@/lib/utils";

interface SubjectPageProps {
  params: { subjectSlug: string };
}

export default async function SubjectPage({ params }: SubjectPageProps) {
  const subjectNameFromSlug = params.subjectSlug.replace(/-/g, " ");
  const subjectDisplayName = capitalizeWords(subjectNameFromSlug);
  const subjectQueryName = subjectDisplayName;

  const contentItems = await getLearningContentBySubject(subjectQueryName);
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-[hsl(var(--foreground-kid))]">
        Explore: {subjectDisplayName}
      </h1>
      {contentItems.length === 0 && (
        <p className="text-[hsl(var(--muted-kid-foreground))]">
          No activities found for {subjectDisplayName} yet. More fun coming
          soon!
        </p>
      )}
      {contentItems.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
          {contentItems.map((item) => (
            <ContentDisplayCard key={item.id} item={item} />
          ))}
        </div>
      )}
    </div>
  );
}
