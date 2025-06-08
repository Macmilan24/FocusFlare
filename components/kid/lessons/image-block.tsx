import Image from "next/image";
import { Card } from "@/components/ui/card";

interface ImageBlockProps {
  url: string;
  alt?: string;
}

export function ImageBlock({ url, alt = "Lesson image" }: ImageBlockProps) {
  return (
    <Card className="overflow-hidden rounded-2xl border-2 border-slate-200 dark:border-slate-700/80 shadow-lg">
      <div className="relative aspect-video">
        <Image
          src={url}
          alt={alt}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-105"
        />
      </div>
    </Card>
  );
} 