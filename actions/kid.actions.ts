/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";

import prisma from "@/lib/db/prisma";
import { auth } from "@/lib/auth";
import { ContentType, Role } from "@prisma/client";

import type {
  KidHomePageData,
  KidGamificationStats,
  ContinueLearningItem,
  RecommendedItem,
  KidData,
  ContentItem,
} from "@/types/kid";
import {
  BookOpen,
  Dumbbell,
  Lightbulb,
  Mic2,
  Palette,
  Puzzle,
  Rows,
  Search,
  Sparkles,
  Target,
  Video,
  type LucideIcon,
} from "lucide-react";
import { getEarnedBadgesForUser } from "@/actions/gamification.actions";

export interface ContentCardItem {
  id: string;
  title: string;
  description?: string | null;
  coverImageUrl?: string | null;
  contentType: ContentType;
  subject: string;
  courseTitle?: string | null;
  progressPercentage?: number;
  lastAccessed?: Date;
}

export interface CourseCardItem {
  id: string;
  title: string;
  description?: string | null;
  coverImageUrl?: string | null;
  subject: string;
  itemCount: number;
}

export interface CourseContentItemWithProgress
  extends Omit<
    ContentCardItem,
    "progressPercentage" | "courseTitle" | "subject"
  > {
  orderInCourse: number | null;
  status?: string | null;
  score?: number | null;
  link: string;
}

export interface CourseDetails {
  id: string;
  title: string;
  description?: string | null;
  subject: string;
  coverImageUrl?: string | null;
  items: CourseContentItemWithProgress[];
}

export async function getRecommendedContent(
  limit: number = 4
): Promise<ContentCardItem[]> {
  try {
    const items = await prisma.learningContent.findMany({
      orderBy: { createdAt: "desc" },
      take: limit,
      include: { course: { select: { title: true } } },
    });
    return items.map((item) => ({
      id: item.id,
      title: item.title,
      description: item.description,
      coverImageUrl: item.coverImageUrl,
      contentType: item.contentType,
      subject: item.subject,
      courseTitle: item.course?.title,
    }));
  } catch (error) {
    console.error("Error fetching recommended content:", error);
    return [];
  }
}

export async function getContinueLearningContent(
  limit: number = 4
): Promise<ContentCardItem[]> {
  const session = await auth();
  if (!session?.user || session.user.role !== Role.CHILD) return [];
  const userId = session.user.id;

  try {
    const progressItems = await prisma.userLearningProgress.findMany({
      where: {
        userId: userId,
        NOT: { status: "completed" },
      },
      orderBy: { lastAccessed: "desc" },
      take: limit,
      include: {
        content: {
          include: { course: { select: { title: true } } },
        },
      },
    });
    return progressItems.map((p) => ({
      id: p.content.id,
      title: p.content.title,
      description: p.content.description,
      coverImageUrl: p.content.coverImageUrl,
      contentType: p.content.contentType,
      subject: p.content.subject,
      courseTitle: p.content.course?.title,
      lastAccessed: p.lastAccessed,
    }));
  } catch (error) {
    console.error("Error fetching continue learning content:", error);
    return [];
  }
}

export interface SubjectCategory {
  name: string;
  iconSlug: keyof typeof import("lucide-react");
  itemCount?: number;
}
export async function getSubjectCategories(): Promise<SubjectCategory[]> {
  return [
    {
      name: "Mathematics",
      iconSlug: "Calculator",
      itemCount: await prisma.learningContent.count({
        where: { subject: "Mathematics" },
      }),
    },
    {
      name: "Reading",
      iconSlug: "BookOpen",
      itemCount: await prisma.learningContent.count({
        where: { subject: "Reading" },
      }),
    },
    {
      name: "StoryTime",
      iconSlug: "Book",
      itemCount: await prisma.learningContent.count({
        where: { subject: "StoryTime" },
      }),
    },
    {
      name: "QuizZone",
      iconSlug: "HelpCircle",
      itemCount: await prisma.learningContent.count({
        where: { subject: "QuizZone" },
      }),
    },
  ];
}

export async function getLearningContentBySubject(
  subjectNameQuery: string
): Promise<ContentCardItem[]> {
  try {
    const items = await prisma.learningContent.findMany({
      where: {
        subject: subjectNameQuery,
      },
      orderBy: [{ title: "asc" }],
      select: {
        id: true,
        title: true,
        description: true,
        coverImageUrl: true,
        contentType: true,
        subject: true,
        content: true,
      },
    });

    return items.map((item) => {
      let coverImg = item.coverImageUrl;
      if (
        !coverImg &&
        item.content &&
        typeof item.content === "object" &&
        "coverImageUrl" in item.content
      ) {
        coverImg = (item.content as any).coverImageUrl as string | null;
      }

      return {
        id: item.id,
        title: item.title,
        description: item.description,
        coverImageUrl: coverImg,
        contentType: item.contentType,
        subject: item.subject,
      };
    });
  } catch (error) {
    console.error(
      `Error fetching content for subject "${subjectNameQuery}":`,
      error
    );
    return [];
  }
}

export async function getCoursesList(): Promise<{
  courses?: CourseCardItem[];
  error?: string;
}> {
  try {
    const coursesFromDb = await prisma.course.findMany({
      where: {
        published: true,
      },
      orderBy: {
        createdAt: "desc",
      },
      include: {
        _count: {
          select: { lessons: true },
        },
      },
    });

    if (!coursesFromDb) {
      return { courses: [] };
    }

    const courses: CourseCardItem[] = coursesFromDb.map((course) => ({
      id: course.id,
      title: course.title,
      description: course.description,
      coverImageUrl: course.coverImageUrl,
      subject: course.subject,
      itemCount: course._count.lessons,
    }));

    return { courses };
  } catch (error) {
    console.error("Error fetching courses list:", error);
    return { error: "Failed to fetch learning adventures." };
  }
}

export async function getCourseDetails(
  courseId: string
): Promise<{ courseDetails?: CourseDetails; error?: string }> {
  const session = await auth();
  if (!session?.user) return { error: "User not authenticated." };
  const userId = session.user.id;

  if (!courseId) return { error: "Course ID is required." };

  try {
    const course = await prisma.course.findUnique({
      where: { id: courseId, published: true },
      include: {
        lessons: {
          orderBy: { orderInCourse: "asc" },
          select: {
            id: true,
            title: true,
            description: true,
            contentType: true,
            coverImageUrl: true,
            subject: true,
            orderInCourse: true,
            userProgress: {
              where: { userId: userId },
              select: {
                status: true,
                score: true,
                progress: true,
                lastAccessed: true,
                completedAt: true,
              },
              take: 1,
            },
          },
        },
      },
    });

    if (!course) return { error: "Course not found or not published." };

    const courseItems: CourseContentItemWithProgress = course.lessons.map(
      (item) => {
        const progress = item.userProgress[0];
        let itemLink = "#";
        if (item.contentType === ContentType.STORY)
          itemLink = `/kid/stories/${item.id}`;
        else if (item.contentType === ContentType.QUIZ)
          itemLink = `/kid/quizzes/${item.id}`;
        else if (item.contentType === ContentType.LESSON)
          itemLink = `/kid/lessons/${item.id}`;
        return {
          id: item.id,
          title: item.title,
          link: itemLink,
          description: item.description,
          contentType: item.contentType,
          coverImageUrl: item.coverImageUrl,
          orderInCourse: item.orderInCourse,
          status: progress?.status || "not_started",
          score: progress?.score,
        };
      }
    );

    const courseDetails: CourseDetails = {
      id: course.id,
      title: course.title,
      description: course.description,
      subject: course.subject,
      coverImageUrl: course.coverImageUrl,
      items: courseItems,
    };

    return { courseDetails };
  } catch (error) {
    console.error(`Error fetching course details for ${courseId}:`, error);
    return { error: "Failed to load course details." };
  }
}

async function getCurrentKidUser() {
  const session = await auth();
  if (!session?.user || session.user.role !== Role.CHILD) {
    console.log("No authenticated kid user found.");
    return null;
  }
  return session.user;
}

export async function getKidProfileData(): Promise<Omit<
  KidData,
  | "dailyStreak"
  | "badgesEarnedCount"
  | "coursesCompletedCount"
  | "coursesInProgressCount"
  | "rank"
  | "weeklyFocusHours"
  | "streakCalendar"
  | "goalsThisMonthCompleted"
  | "goalsThisMonthTotal"
> | null> {
  const kidUser = await getCurrentKidUser();
  if (!kidUser?.id) return null;

  try {
    const user = await prisma.user.findUnique({
      where: { id: kidUser.id },
      select: {
        id: true,
        name: true,
        username: true,
        image: true,
        points: true,
      },
    });

    if (!user) return null;

    return {
      id: user.id,
      name: user.name ?? "Explorer",
      username:
        user.username ??
        user.name?.toLowerCase().replace(/\s+/g, "") ??
        "explorer",
      avatarUrl: typeof user.image === "string" ? user.image : undefined,
      points: user.points ?? 0,
    };
  } catch (error) {
    console.error("Error fetching kid profile data:", error);
    return null;
  }
}

export async function getKidGamificationStats(): Promise<KidGamificationStats | null> {
  const kidUser = await getCurrentKidUser();
  if (!kidUser?.id) return null;
  const userId = kidUser.id;

  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(today.getDate() - 6);

    // Fetch UserLearningProgress for the last 7 days for streak and calendar
    const recentProgress = await prisma.userLearningProgress.findMany({
      where: {
        userId: userId,
        lastAccessed: {
          gte: sevenDaysAgo,
        },
      },
      orderBy: { lastAccessed: "asc" },
      select: { lastAccessed: true },
    });

    const activeDates = new Set(
      recentProgress.map((p) => {
        const d = new Date(p.lastAccessed);
        d.setHours(0, 0, 0, 0); // Normalize to the start of the day
        return d.toISOString().split("T")[0];
      })
    );

    // Calculate Daily Streak
    let dailyStreak = 0;
    if (activeDates.size > 0) {
      let consecutiveDays = 0;
      const todayString = today.toISOString().split("T")[0];
      const yesterdayString = new Date(new Date().setDate(today.getDate() - 1))
        .toISOString()
        .split("T")[0];

      // Check if today or yesterday is active to start counting
      if (activeDates.has(todayString) || activeDates.has(yesterdayString)) {
        for (let i = 0; i < 7; i++) {
          // Check up to 7 days back for consecutive sequence
          const checkDate = new Date(today);
          checkDate.setDate(today.getDate() - i);
          if (activeDates.has(checkDate.toISOString().split("T")[0])) {
            consecutiveDays++;
          } else {
            break; // Streak broken
          }
        }
        // If the streak doesn't include today, but included yesterday, it's valid up to yesterday.
        // If it includes today, it's up to today.
        // If the most recent active day in the loop was not today or yesterday, the streak is 0.
        if (
          consecutiveDays > 0 &&
          activeDates.has(
            new Date(today.setDate(today.getDate() - (consecutiveDays - 1)))
              .toISOString()
              .split("T")[0]
          )
        ) {
          dailyStreak = consecutiveDays;
        } else {
          dailyStreak = 0;
        }
      }
    }

    // Streak Calendar (Last 7 days)
    const streakCalendar = Array(7).fill(false);
    for (let i = 0; i < 7; i++) {
      const dayToRepresent = new Date(sevenDaysAgo); // Start from 6 days ago
      dayToRepresent.setDate(sevenDaysAgo.getDate() + i);
      if (activeDates.has(dayToRepresent.toISOString().split("T")[0])) {
        streakCalendar[i] = true;
      }
    }

    // Monthly Goals Completed
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const goalsThisMonthCompleted = await prisma.userLearningProgress.count({
      where: {
        userId: userId,
        completedAt: {
          gte: startOfMonth,
          lte: today, // Count completions up to today in the current month
        },
        // Optionally, add specific criteria for what counts as a "goal"
        // e.g., contentType: ContentType.COURSE or contentType: ContentType.QUIZ
      },
    });
    const goalsThisMonthTotal = 5; // Static total goals for now

    // Badges Earned Count
    const badgesData = await getEarnedBadgesForUser(userId);
    const badgesEarnedCount = badgesData.badges?.length ?? 0;

    // Courses Completed Count
    const coursesCompletedCount = await prisma.userLearningProgress.count({
      where: {
        userId: userId,
        content: { contentType: ContentType.COURSE },
        completedAt: { not: null }, // Main indicator for completion
        // OR: { status: "completed" } // Alternative if completedAt is not always set
      },
    });

    // Courses In Progress Count
    const coursesInProgressCount = await prisma.userLearningProgress.count({
      where: {
        userId: userId,
        content: { contentType: ContentType.COURSE },
        completedAt: null,
        status: { notIn: ["completed", "passed"] }, // Assuming status might also indicate completion
      },
    });

    // Rank (based on points)
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { points: true },
    });
    const userPoints = user?.points ?? 0;
    let rank = "Explorer";
    if (userPoints > 1000) rank = "Trailblazer";
    if (userPoints > 5000) rank = "Voyager"; // Example thresholds

    // Weekly Focus Hours (Estimate)
    // This is a very rough estimate. Consider more sophisticated tracking if needed.
    // Counts distinct days active in the last week, assumes 1 hour per active day.
    const distinctActiveDaysLastWeek = new Set();
    const oneWeekAgoUTIL = new Date();
    oneWeekAgoUTIL.setDate(oneWeekAgoUTIL.getDate() - 7);
    oneWeekAgoUTIL.setHours(0, 0, 0, 0);

    recentProgress.forEach((p) => {
      const accessDate = new Date(p.lastAccessed);
      if (accessDate >= oneWeekAgoUTIL) {
        distinctActiveDaysLastWeek.add(accessDate.toISOString().split("T")[0]);
      }
    });
    const weeklyFocusHours = distinctActiveDaysLastWeek.size * 0.5; // Placeholder: 0.5 hour per active day

    return {
      dailyStreak,
      badgesEarnedCount,
      coursesCompletedCount,
      coursesInProgressCount,
      rank,
      weeklyFocusHours,
      streakCalendar,
    };
  } catch (error) {
    console.error("Error fetching kid gamification stats:", error);
    return {
      dailyStreak: 0,
      badgesEarnedCount: 0,
      coursesCompletedCount: 0,
      coursesInProgressCount: 0,
      rank: "Explorer",
      weeklyFocusHours: 0,
      streakCalendar: Array(7).fill(false),
    };
  }
}

function mapContentData(content: {
  contentType: ContentType;
  subject?: string | null;
  title?: string | null;
}): { type: ContentItem["type"]; Icon?: LucideIcon; category?: string } {
  const { contentType, subject } = content;
  let type: ContentItem["type"] = "course";
  let Icon: LucideIcon | undefined = Lightbulb;
  let category = subject ?? "General";

  switch (contentType) {
    case ContentType.COURSE:
      type = "course";
      Icon = Lightbulb;
      category = subject ?? "Course";
      break;
    case ContentType.STORY:
      type = "story";
      Icon = BookOpen;
      category = subject ?? "Story";
      break;
    case ContentType.QUIZ:
      type = "quiz";
      Icon = Puzzle;
      category = subject ?? "Quiz";
      break;
    case ContentType.LESSON:
      type = "lesson";
      Icon = Sparkles;
      category = subject ?? "Lesson";
      break;
    default:
      if (subject) {
        const lowerSubject = subject.toLowerCase();
        if (lowerSubject.includes("math")) {
          Icon = Dumbbell;
          category = "Mathematics";
          type = "subject";
        } else if (lowerSubject.includes("read")) {
          Icon = BookOpen;
          category = "Reading";
          type = "subject";
        } else if (lowerSubject.includes("science")) {
          Icon = Sparkles;
          category = "Science";
          type = "subject";
        } else if (lowerSubject.includes("art")) {
          Icon = Palette;
          category = "Arts & Crafts";
          type = "subject";
        } else if (lowerSubject.includes("music")) {
          Icon = Mic2;
          category = "Music & Movement";
          type = "subject";
        } else {
          Icon = Lightbulb;
          category = subject;
          type = "subject";
        }
      } else {
        Icon = Lightbulb;
        category = "Activity";
        type = "subject";
      }
  }
  return { type, Icon, category };
}

export async function getKidHomePageData({
  gradeLevelId,
  limit = 4,
}: {
  gradeLevelId?: string;
  limit?: number;
} = {}): Promise<KidHomePageData | null> {
  const kidProfile = await getKidProfileData();
  if (!kidProfile) return null;

  const userId = kidProfile.id;

  try {
    // 1. Fetch all published courses, filtered by grade if provided
    const allCourses = await prisma.course.findMany({
      where: {
        published: true,
        ...(gradeLevelId ? { gradeLevelId } : {}),
      },
      include: {
        lessons: {
          select: {
            id: true,
            title: true,
            contentType: true,
            coverImageUrl: true,
            subject: true,
            orderInCourse: true,
          },
        },
        gradeLevel: {
          select: { name: true },
        },
      },
    });

    // 2. Fetch all user progress for lessons/quizzes/stories in these courses
    const allLessonIds = allCourses.flatMap((course) =>
      course.lessons.map((l) => l.id)
    );
    const userProgressRecords = await prisma.userLearningProgress.findMany({
      where: {
        userId: userId,
        contentId: { in: allLessonIds },
      },
      select: {
        contentId: true,
        status: true,
        completedAt: true,
        lastAccessed: true,
      },
    });
    const progressMap = new Map(
      userProgressRecords.map((p) => [p.contentId, p])
    );

    // 3. For each course, calculate progress
    const courseProgressArr: (ContinueLearningItem & {
      lastAccessed: Date | null;
      gradeLevel?: string | null;
    })[] = allCourses.map((course) => {
      const lessons = course.lessons;
      const totalLessons = lessons.length;
      let completedLessons = 0;
      let lastAccessed: Date | null = null;
      let started = false;
      lessons.forEach((lesson) => {
        const progress = progressMap.get(lesson.id);
        if (progress) {
          started = true;
          if (progress.status === "completed" || progress.status === "passed")
            completedLessons++;
          if (
            !lastAccessed ||
            (progress.lastAccessed &&
              (!lastAccessed || progress.lastAccessed > lastAccessed))
          ) {
            lastAccessed = progress.lastAccessed;
          }
        }
      });
      const progressPercent =
        totalLessons > 0
          ? Math.round((completedLessons / totalLessons) * 100)
          : 0;
      return {
        id: course.id,
        title: course.title,
        description: course.description, // <-- Ensure description is included
        slug: `courses/${course.id}`,
        type: "course" as const,
        iconName: "Lightbulb",
        category: course.subject,
        imageUrl: course.coverImageUrl,
        progress: progressPercent,
        lessonsCount: totalLessons,
        completedLessons,
        lastAccessed,
        started,
        gradeLevel: course.gradeLevel?.name,
      };
    });

    // 4. Continue Learning: Only unfinished (in-progress) courses
    const inProgressCourses: ContinueLearningItem[] = courseProgressArr
      .filter((c) => c.progress > 0 && c.progress < 100)
      .sort((a, b) => {
        if (a.lastAccessed && b.lastAccessed)
          return b.lastAccessed.getTime() - a.lastAccessed.getTime();
        if (a.lastAccessed) return -1;
        if (b.lastAccessed) return 1;
        return 0;
      })
      .slice(0, limit)
      .map((c) => {
        const { lastAccessed, ...rest } = c;
        return rest;
      });

    // 5. Recommended: Not-yet-completed (not started or in-progress, but not finished)
    const recommendedCourses: RecommendedItem[] = courseProgressArr
      .filter((c) => c.progress < 100)
      .sort((a, b) => {
        if (a.lastAccessed && b.lastAccessed)
          return b.lastAccessed.getTime() - a.lastAccessed.getTime();
        if (a.lastAccessed) return -1;
        if (b.lastAccessed) return 1;
        return 0;
      })
      .slice(0, limit * 2) // Show more in recommended
      .map((c) => {
        const { lastAccessed, ...rest } = c;
        return rest;
      });

    // 6. Subject Sections: Group by subject, show not-yet-completed (not started or in-progress)
    const subjectSections: Record<string, RecommendedItem[]> = {};
    for (const course of courseProgressArr.filter((c) => c.progress < 100)) {
      const subject = course.category || "Other";
      if (!subjectSections[subject]) subjectSections[subject] = [];
      if (subjectSections[subject].length < limit) {
        const { lastAccessed, ...rest } = course;
        subjectSections[subject].push(rest);
      }
    }

    // TODO: Add stories, lessons, quizzes, etc. to subjectSections as well (not just courses)

    // 7. Return the new structure
    return {
      kidData: kidProfile,
      continueLearning: inProgressCourses,
      recommendedItems: recommendedCourses,
      subjectSections,
    };
  } catch (error) {
    console.error("Error fetching kid home page data:", error);
    return {
      kidData: kidProfile || {
        id: "errorUser",
        name: "Explorer",
        points: 0,
        avatarUrl: null,
      },
      continueLearning: [],
      recommendedItems: [],
      subjectSections: {},
    };
  }
}

// Fetch all grade levels for dropdowns/selectors
export async function getGradeLevels() {
  const grades = await prisma.gradeLevel.findMany({
    orderBy: { order: "asc" },
    select: { id: true, name: true, description: true },
  });
  return grades;
}
