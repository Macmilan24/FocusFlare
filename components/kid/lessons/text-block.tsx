import { Card } from "@/components/ui/card";
import ReactMarkdown from "react-markdown";

interface TextBlockProps {
  content: string;
}

export function TextBlock({ content }: TextBlockProps) {
  return (
    <Card className="p-4 sm:p-6 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-2 border-slate-200 dark:border-slate-700/80 shadow-inner">
      <div className="prose prose-base dark:prose-invert max-w-none prose-p:font-sans prose-p:text-base prose-p:md:text-lg prose-p:leading-relaxed prose-headings:font-bold prose-headings:text-primary-kid-dark dark:prose-headings:text-primary-kid">
        <ReactMarkdown>{content}</ReactMarkdown>
      </div>
    </Card>
  );
} 