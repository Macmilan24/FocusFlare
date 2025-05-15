// actions/roadmap.actions.ts
"use server";

import prisma from "@/lib/db/prisma";
import { auth } from "@/lib/auth";
import { ContentType, Role } from "@prisma/client";
import type * as LucideIcons from "lucide-react"; // For icon slugs

// --- DEFINE ROADMAP INTERFACES HERE ---
export interface RoadmapNode {
  id: string; // Unique ID for this node on the roadmap (could be LearningContent ID)
  learningContentId: string; // Actual ID of the LearningContent
  title: string;
  contentType: ContentType;
  status: "completed" | "current" | "upcoming" | "locked";
  iconSlug?: keyof typeof LucideIcons;
  subject?: string;
  order: number;
  // Add link property to be constructed here for clarity on the client
  link: string;
}

export interface RoadmapMilestone {
  title: string;
  nodes: RoadmapNode[];
  isCompleted: boolean;
  // Add other milestone properties like an overall icon or theme
}
// --- END ROADMAP INTERFACES ---

export async function getKidRoadmapData(): Promise<{
  milestones?: RoadmapMilestone[];
  nodes?: RoadmapNode[];
  error?: string;
}> {
  const session = await auth();
  if (!session?.user || session.user.role !== Role.CHILD) {
    return { error: "Unauthorized." };
  }
  const userId = session.user.id;

  try {
    const allContent = await prisma.learningContent.findMany({
      where: { contentType: { in: [ContentType.STORY, ContentType.QUIZ] } },
      orderBy: [{ subject: "asc" }, { createdAt: "asc" }],
      select: { id: true, title: true, contentType: true, subject: true },
    });

    const progressRecords = await prisma.userLearningProgress.findMany({
      where: { userId, contentId: { in: allContent.map((c) => c.id) } },
      select: { contentId: true, status: true },
    });
    const progressMap = new Map(
      progressRecords.map((p) => [p.contentId, p.status])
    );

    let currentFound = false;
    const roadmapNodes: RoadmapNode[] = allContent.map((content, index) => {
      const statusFromDb = progressMap.get(content.id);
      let status: RoadmapNode["status"] = "upcoming";

      if (statusFromDb === "completed" || statusFromDb === "passed") {
        status = "completed";
      } else if (
        !currentFound &&
        (statusFromDb === "inprogress" || !statusFromDb)
      ) {
        status = "current";
        currentFound = true;
      }

      let iconSlug: keyof typeof LucideIcons = "FileText";
      let link = `/kid/content/${content.id}`; // Generic link, adjust if needed

      if (content.contentType === ContentType.STORY) {
        iconSlug = "BookHeart";
        link = `/kid/stories/${content.id}`;
      } else if (content.contentType === ContentType.QUIZ) {
        iconSlug = "Puzzle";
        link = `/kid/quizzes/${content.id}`;
      }
      // Add cases for LESSON, GAME, COURSE later

      return {
        id: content.id,
        learningContentId: content.id,
        title: content.title,
        contentType: content.contentType,
        status: status,
        iconSlug: iconSlug,
        subject: content.subject,
        order: index,
        link: link, // Add the constructed link
      };
    });

    if (!currentFound && roadmapNodes.length > 0) {
      const firstUpcoming = roadmapNodes.find(
        (node) => node.status === "upcoming"
      );
      if (firstUpcoming) {
        firstUpcoming.status = "current";
      } else if (roadmapNodes.every((node) => node.status === "completed")) {
        // All items are completed, could add a special "Congratulations!" node
        // Or this state is handled on the UI page
      }
    }

    // For now, returning a flat list of nodes.
    // Grouping into milestones will be a next step if we pursue that.
    return { nodes: roadmapNodes };
  } catch (error) {
    console.error("Error fetching kid roadmap data:", error);
    return { error: "Failed to load your learning path." };
  }
}
