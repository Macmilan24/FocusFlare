/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";

import prisma from "@/lib/db/prisma";
import { auth } from "@/lib/auth";
import { ContentType, Role } from "@prisma/client";

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

    const courseItems: CourseContentItemWithProgress[] = course.lessons.map(
      (item) => {
        const progress = item.userProgress[0];
        let itemLink = "#";
        if (item.contentType === ContentType.STORY)
          itemLink = `/kid/stories/${item.id}`;
        else if (item.contentType === ContentType.QUIZ)
          itemLink = `/kid/quizzes/${item.id}`;
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
