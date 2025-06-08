import { Card } from "@/components/ui/card";

interface VideoBlockProps {
  url: string;
}

export function VideoBlock({ url }: VideoBlockProps) {
  // Basic URL check to prevent non-embeddable URLs.
  // This can be expanded for more robust validation.
  const isEmbeddable = url.includes("youtube.com/embed");

  if (!isEmbeddable) {
    return (
      <Card className="p-4 bg-red-100 dark:bg-red-900/50 border-red-300 dark:border-red-700">
        <p className="text-red-800 dark:text-red-200 font-semibold">
          This video can&apos;t be shown here. Please make sure it&apos;s a
          valid YouTube embed link.
        </p>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden rounded-2xl border-2 border-slate-200 dark:border-slate-700/80 shadow-lg">
      <div className="aspect-video">
        <iframe
          width="100%"
          height="100%"
          src={url}
          title="Lesson video"
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        ></iframe>
      </div>
    </Card>
  );
} 