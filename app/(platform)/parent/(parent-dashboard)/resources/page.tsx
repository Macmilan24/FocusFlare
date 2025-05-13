// app/(platform)/parent/(parent-dashboard)/resources/page.tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpenText, ExternalLink } from "lucide-react";
import Link from "next/link";

export default function ParentResourcesPage() {
  const resources = [
    {
      title: "Understanding ADHD in Children",
      description: "Comprehensive guides and articles.",
      link: "#",
    },
    {
      title: "Effective Learning Strategies for ADHD",
      description: "Tips to help your child succeed.",
      link: "#",
    },
    {
      title: "Managing Focus and Attention",
      description: "Techniques and exercises.",
      link: "#",
    },
    {
      title: "Support Groups & Communities",
      description: "Connect with other parents.",
      link: "#",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Parent Resources</h2>
        <p className="text-muted-foreground mt-1">
          Helpful articles, guides, and links to support your child&apos;s learning
          journey.
        </p>
      </div>
      <div className="grid gap-6 md:grid-cols-2">
        {resources.map((resource, index) => (
          <Card key={index} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-center space-x-3 mb-1">
                <BookOpenText className="h-6 w-6 text-primary" />
                <CardTitle className="text-lg font-semibold">
                  {resource.title}
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-3">
                {resource.description}
              </p>
              <Link
                href={resource.link}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-primary hover:underline font-medium inline-flex items-center"
              >
                Read More <ExternalLink className="ml-1 h-3 w-3" />
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
