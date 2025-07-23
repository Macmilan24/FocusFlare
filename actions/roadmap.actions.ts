"use server";

import { auth } from "@/lib/auth";
import db from "@/lib/db/prisma";
import { revalidatePath } from "next/cache";

/**
 * Generates a personalized roadmap for a user based on their grade level and favorite subject.
 * This should be called after the user completes their initial assessment.
 * @param userId The ID of the user to generate the roadmap for.
 * @returns The newly created roadmap with its items.
 */
export async function generateRoadmapForUser(userId: string) {
  try {
    const user = await db.user.findUnique({
      where: { id: userId },
      select: { currentGradeLevelId: true, favoriteSubject: true },
    });

    if (!user || !user.currentGradeLevelId || !user.favoriteSubject) {
      throw new Error(
        "User must have a grade level and favorite subject set to generate a roadmap."
      );
    }

    const existingRoadmap = await db.roadmap.findUnique({
      where: { userId },
    });

    if (existingRoadmap) {
      console.log(`Roadmap already exists for user ${userId}.`);
      // Even if it exists, we return it in the shape the caller expects
      return db.roadmap.findUnique({
        where: { userId },
        include: { items: { include: { course: true } } },
      });
    }

    // --- Start of Corrected Logic ---

    // 1. Attempt to find grade-specific courses first.
    let coursesToUse = await db.course.findMany({
      where: {
        gradeLevelId: user.currentGradeLevelId,
        published: true,
      },
    });

    // 2. If no grade-specific courses are found, use the fallback.
    if (coursesToUse.length === 0) {
      console.warn(
        `No grade-specific courses found for user ${userId}. Using fallback to find any published courses.`
      );
      coursesToUse = await db.course.findMany({
        where: { published: true },
        take: 5, // Get up to 5 generic courses
      });
    }

    // 4. Sort the selected courses (either grade-specific or fallback)
    const sortedCourses = coursesToUse.sort((a, b) => {
      const aIsFav = a.subject === user.favoriteSubject;
      const bIsFav = b.subject === user.favoriteSubject;
      if (aIsFav && !bIsFav) return -1;
      if (!aIsFav && bIsFav) return 1;
      return a.title.localeCompare(b.title);
    });

    // 5. Create the roadmap with the sorted courses.
    const newRoadmap = await db.roadmap.create({
      data: {
        userId: userId,
        items: {
          create: sortedCourses.map((course, index) => ({
            courseId: course.id,
            order: index + 1,
            status: index === 0 ? "unlocked" : "locked",
          })),
        },
      },
      // We include items here just for the return value, but not the nested course
      include: {
        items: true,
      },
    });

    // --- End of Corrected Logic ---
    revalidatePath("/kid/roadmap");

    // CRITICAL FIX: After creating, we must re-fetch the roadmap with the nested
    // course data included to match the type expected by getRoadmapForCurrentUser.
    return db.roadmap.findUnique({
      where: { id: newRoadmap.id },
      include: {
        items: {
          orderBy: { order: "asc" },
          include: { course: true },
        },
      },
    });
  } catch (error) {
    console.error("Failed to generate roadmap:", error);
    throw new Error("Could not generate the learning roadmap.");
  }
}

/**
 * Updates a user's roadmap when they complete a course.
 * It marks the completed course and unlocks the next one in the sequence.
 * @param userId The ID of the user.
 * @param completedCourseId The ID of the course that was completed.
 */
export async function updateRoadmapProgress(
  userId: string,
  completedCourseId: string
) {
  try {
    const roadmap = await db.roadmap.findUnique({
      where: { userId },
      include: { items: { orderBy: { order: "asc" } } },
    });

    if (!roadmap) {
      throw new Error("Roadmap not found for the user.");
    }

    const completedItemIndex = roadmap.items.findIndex(
      (item) => item.courseId === completedCourseId
    );

    if (completedItemIndex === -1) {
      throw new Error("Completed course is not part of the user's roadmap.");
    }

    const completedItemId = roadmap.items[completedItemIndex].id;

    // Mark the current item as completed
    await db.roadmapItem.update({
      where: { id: completedItemId },
      data: { status: "completed" },
    });

    // Unlock the next item in the roadmap, if it exists
    const nextItem = roadmap.items[completedItemIndex + 1];
    if (nextItem) {
      await db.roadmapItem.update({
        where: { id: nextItem.id },
        data: { status: "unlocked" },
      });
    }

    revalidatePath("/kid/roadmap");

    return { success: true };
  } catch (error) {
    console.error("Failed to update roadmap progress:", error);
    return {
      success: false,
      message: "An error occurred while updating roadmap progress.",
    };
  }
}

/**
 * Fetches the roadmap for the currently authenticated user.
 * @returns The user's roadmap with all items and their associated course data.
 */
export async function getRoadmapForCurrentUser() {
  const session = await auth();
  if (!session?.user?.id) {
    // This is not an error, the user is simply not logged in.
    return null;
  }

  let roadmap = await db.roadmap.findUnique({
    where: { userId: session.user.id },
    include: {
      items: {
        orderBy: {
          order: "asc",
        },
        include: {
          // Include the full course details for each roadmap item
          course: true,
        },
      },
    },
  });

  // --- SELF-HEALING LOGIC ---
  // If a roadmap exists but has no items, it's invalid. Delete it so it can be regenerated.
  if (roadmap && roadmap.items.length === 0) {
    console.warn(
      `Found an empty roadmap for user ${session.user.id}. Deleting and preparing to regenerate.`
    );
    await db.roadmap.delete({ where: { id: roadmap.id } });
    roadmap = null; // Set to null to trigger the generation logic below.
  }
  // --- END SELF-HEALING LOGIC ---

  // If no roadmap exists (or it was just deleted), try to generate one.
  if (!roadmap) {
    try {
      console.log(
        `No valid roadmap found for user ${session.user.id}. Attempting to generate one.`
      );
      // generateRoadmapForUser will now correctly create a specific or fallback roadmap.
      roadmap = await generateRoadmapForUser(session.user.id);
    } catch (err) {
      // This can happen if the user hasn't completed onboarding (no grade level set).
      // In this case, it's correct to return null and let the UI show the onboarding prompt.
      console.error(
        `Could not auto-generate roadmap for user ${session.user.id}:`,
        err
      );
      return null; // Explicitly return null on generation failure.
    }
  }

  return roadmap;
}
