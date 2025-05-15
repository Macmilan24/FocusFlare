"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { RoadmapNode } from "@/actions/roadmap.actions";
import * as LucideIcons from "lucide-react";
import { CheckCircle, Lock, Sparkles, Award, Footprints } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface KidRoadmapViewProps {
  initialNodes: RoadmapNode[];
}

export function KidRoadmapView({ initialNodes }: KidRoadmapViewProps) {
  if (!initialNodes || initialNodes.length === 0) {
    return (
      <p className="text-center text-lg text-[hsl(var(--muted-kid-foreground))]">
        Your adventure map is still being drawn!
      </p>
    );
  }

  const nodes = [...initialNodes].sort((a, b) => a.order - b.order);

  return (
    <div className="relative p-4 md:p-6 overflow-x-auto custom-scrollbar">
      <div className="flex items-center space-x-0 relative w-max pb-10">
        {" "}
        {/* w-max to allow path to extend */}
        {nodes.map((node, index) => {
          const IconComponent = node.iconSlug
            ? (LucideIcons[node.iconSlug] as LucideIcons.LucideIcon)
            : LucideIcons.FileText;
          let StatusIcon = Sparkles; // Default for upcoming
          let iconColor = "text-[hsl(var(--muted-kid-foreground))]";
          let cardBg = "bg-[hsl(var(--card-kid))]/70 backdrop-blur-sm";
          let borderColor = "border-[hsl(var(--border-kid))]";
          let titleColor = "text-[hsl(var(--card-foreground-kid))]";
          let isClickable = false;

          if (node.status === "completed") {
            StatusIcon = CheckCircle;
            iconColor = "text-green-500 dark:text-green-400";
            cardBg = "bg-green-500/10 dark:bg-green-700/20 backdrop-blur-sm";
            borderColor = "border-green-500/50";
            titleColor = "text-green-700 dark:text-green-300";
            isClickable = true;
          } else if (node.status === "current") {
            StatusIcon = Award; // "X marks the spot" - current task is the treasure!
            iconColor = "text-[hsl(var(--primary-kid))] animate-pulse";
            cardBg =
              "bg-[hsl(var(--primary-kid))]/20 backdrop-blur-sm ring-2 ring-[hsl(var(--primary-kid))]";
            borderColor = "border-[hsl(var(--primary-kid))]";
            titleColor = "text-[hsl(var(--primary-kid))]";
            isClickable = true;
          } else if (node.status === "locked") {
            StatusIcon = Lock;
            iconColor = "text-slate-400 dark:text-slate-500";
            cardBg =
              "bg-slate-200/50 dark:bg-slate-700/30 backdrop-blur-sm opacity-60";
            borderColor = "border-slate-300 dark:border-slate-600";
            isClickable = false;
          }

          const nodeContent = (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1, duration: 0.4 }}
              className={cn(
                "relative w-48 h-56 sm:w-52 sm:h-60 p-3 flex flex-col items-center justify-center text-center border-2 rounded-2xl shadow-lg transition-all duration-300",
                cardBg,
                borderColor,
                isClickable
                  ? "hover:shadow-xl hover:scale-105 cursor-pointer"
                  : "cursor-default"
              )}
            >
              <div
                className={`absolute -top-4 -right-3 p-1.5 rounded-full bg-[hsl(var(--background-kid))] shadow-md ${
                  node.status === "current"
                    ? "ring-2 ring-offset-2 ring-offset-[hsl(var(--background-kid))] ring-[hsl(var(--primary-kid))]"
                    : ""
                }`}
              >
                <StatusIcon className={`h-7 w-7 ${iconColor}`} />
              </div>
              <IconComponent className="h-12 w-12 mb-2 text-[hsl(var(--muted-kid-foreground))] group-hover:text-[hsl(var(--primary-kid))]" />
              <p className={`font-bold text-sm line-clamp-2 ${titleColor}`}>
                {node.title}
              </p>
              <Badge
                variant="outline"
                className="mt-1 text-xs bg-transparent border-[hsl(var(--border-kid))] text-[hsl(var(--muted-kid-foreground))]"
              >
                {node.contentType.toLowerCase()}
              </Badge>
              {node.subject && (
                <p className="text-[10px] text-[hsl(var(--muted-kid-foreground))] mt-1">
                  {node.subject}
                </p>
              )}
            </motion.div>
          );

          return (
            <div key={node.id} className="flex items-center">
              {isClickable ? (
                <Link href={node.link} className="group">
                  {nodeContent}
                </Link>
              ) : (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div>{nodeContent}</div>
                      {/* TooltipTrigger needs a DOM element child */}
                    </TooltipTrigger>
                    {node.status === "locked" && (
                      <TooltipContent className="bg-[hsl(var(--popover-kid))] text-[hsl(var(--popover-foreground-kid))] border-[hsl(var(--border-kid))]">
                        <p>Complete previous steps to unlock!</p>
                      </TooltipContent>
                    )}
                  </Tooltip>
                </TooltipProvider>
              )}

              {/* Connecting line to next node (path) */}
              {index < nodes.length - 1 && (
                <div className="w-12 sm:w-16 h-1 bg-orange-300/70 dark:bg-yellow-700/70 relative mx-1">
                  <Footprints className="absolute -top-3 left-1/2 -translate-x-1/2 h-5 w-5 text-orange-400/80 dark:text-yellow-600/80 transform -rotate-45" />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
