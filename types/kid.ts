import { LucideIcon } from "lucide-react";

// For the User Details Panel and general kid information
export interface KidData {
  id?: string;
  name: string;
  username?: string; // Added for clarity, can be derived if needed
  avatarUrl?: string | null;
  points: number;
  // Gamification stats - will be populated by a separate action
  dailyStreak?: number;
  goalsThisMonthCompleted?: number; // Will be repurposed for Badges Earned
  goalsThisMonthTotal?: number;     // Will be repurposed for Courses Completed
  badgesEarnedCount?: number; // New field
  coursesCompletedCount?: number; // New field
  coursesInProgressCount?: number; // New field for the dedicated stat box
  rank?: string; // e.g., "Explorer", "Trailblazer"
  weeklyFocusHours: number;
  // For the 7-day streak calendar: true if day was active, false otherwise
  streakCalendar: boolean[]; // Array of 7 booleans
}

// For content items in "Continue Learning" and "Recommended For You"
export interface ContentItem {
  id: string;
  title: string;
  slug?: string; // To link to the content page e.g., /kid/courses/[slug]
  type: "course" | "story" | "quiz" | "lesson" | "subject"; // Type of content
  category?: string; // e.g., "Math", "Science", "Reading"
  subjectName?: string; // To be used if type is 'subject'
  imageUrl?: string | null;
  Icon?: LucideIcon; // For "Continue Learning" cards primarily

  // For "Continue Learning"
  progress?: number; // Percentage, 0-100
  currentLesson?: string; // e.g., "Lesson 3 of 10" or "Chapter 2"
  totalLessons?: number;
  completedLessons?: number;

  // For "Recommended For You" & general display
  author?: string; // e.g., "FocusFlare Team" or specific author
  rating?: number; // 1-5 stars
  reviews?: number; // Number of reviews
  isNew?: boolean;
  duration?: string; // e.g., "15 min", "1 hour"

  // Additional fields that might be useful from Prisma
  createdAt?: Date;
  updatedAt?: Date;
  description?: string | null;
  gradeLevel?: string; // e.g. "Grade 3"
  subject?: string;
  coverImageUrl?: string | null;
  
  // field for lessons count for a course
  lessonsCount?: number; 
}

// Specific to "Continue Learning" where progress is central
export interface ContinueLearningItem extends ContentItem {
  progress: number; // Make progress non-optional for this type
}

// Specific to "Recommended" items
export interface RecommendedItem extends ContentItem {
  // Any specific fields for recommendations can go here
}

// For the Kid Home Page data fetching
export interface KidHomePageData {
  kidData: Omit<KidData, 'dailyStreak' | 'badgesEarnedCount' | 'coursesCompletedCount' | 'coursesInProgressCount' | 'rank' | 'weeklyFocusHours' | 'streakCalendar' | 'goalsThisMonthCompleted' | 'goalsThisMonthTotal'>; // Basic profile, remove stats
  continueLearning: ContinueLearningItem[];
  recommendedItems: RecommendedItem[];
  subjectSections: Record<string, RecommendedItem[]>; // <-- Added for dashboard subject grouping
}

// For the Gamification Stats data fetching
export interface KidGamificationStats {
  dailyStreak: number;
  // goalsThisMonthCompleted: number; // Will be replaced by badgesEarnedCount
  // goalsThisMonthTotal: number;     // Will be replaced by coursesCompletedCount
  badgesEarnedCount: number;
  coursesCompletedCount: number;
  coursesInProgressCount: number;
  rank?: string;
  weeklyFocusHours: number;
  streakCalendar: boolean[]; // Array of 7 booleans, e.g., [true, true, false, true, false, false, false]
} 