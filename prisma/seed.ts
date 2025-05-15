import { PrismaClient, ContentType, Prisma } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  // --- NEW: Seed Badges ---
  console.log("Seeding badges...");
  const badgesToSeed = [
    {
      name: "Story Novice",
      description: "Read your first story!",
      iconSlug: "BookOpenText",
      criteriaText: "Complete 1 story",
    },
    {
      name: "Bookworm Beginner",
      description: "Read 3 amazing stories!",
      iconSlug: "Library",
      criteriaText: "Complete 3 stories",
    },
    {
      name: "Quiz Challenger",
      description: "Tackled your first quiz!",
      iconSlug: "HelpCircle",
      criteriaText: "Attempt 1 quiz",
    },
    {
      name: "Puzzle Pro",
      description: "Mastered 3 quizzes!",
      iconSlug: "Brain",
      criteriaText: "Pass 3 quizzes",
    },
  ];
  for (const badgeData of badgesToSeed) {
    await prisma.badge.upsert({
      where: { name: badgeData.name },
      update: badgeData,
      create: badgeData,
    });
    console.log(`Created/updated badge: ${badgeData.name}`);
  }

  console.log(`Seeding finished.`);

  // --- Seed Learning Content (Stories) ---

  const mathCourse = await prisma.course.upsert({
    where: { title: "Beginner Math Fun" },
    update: {},
    create: {
      title: "Beginner Math Fun",
      description: "Learn basic math concepts with exciting activities!",
      subject: "Mathematics", // Matches your KidHomePage subject
      coverImageUrl: "/images/courses/math_beginners.png", // Placeholder
      published: true,
    },
  });

  const readingCourse = await prisma.course.upsert({
    where: { title: "Reading Adventures" },
    update: {},
    create: {
      title: "Reading Adventures",
      description: "Explore the world of words and wonderful stories.",
      subject: "Reading", // Matches your KidHomePage subject
      coverImageUrl: "/images/courses/reading_adventures.png",
      published: true,
    },
  });
  console.log("Courses seeded.");

  const storiesToSeed = [
    {
      title: "The Little Blue Rocket",
      description: "A story about a brave little rocket exploring space.",
      contentType: ContentType.STORY, // Still a story, but can be part of a course as a "lesson"
      subject: "Reading", // Align subject with course
      coverImageUrl: "/images/stories/covers/blue_rocket_cover.png", // Now top-level
      courseId: readingCourse.id, // Link to course
      orderInCourse: 1,
      content: {
        coverImageUrl: "/images/stories/covers/blue_rocket_cover.png", // Example path
        pages: [
          {
            text: "Once upon a time, in a sky full of twinkling stars, lived a Little Blue Rocket. He wasn't the biggest or the fastest, but he was the bravest.",
            imageUrl: "/images/stories/blue_rocket/page1.png", // Example path
          },
          {
            text: "One day, Little Blue Rocket decided to visit the Giggling Moon. 'I want to see if it really giggles!' he beeped.",
            imageUrl: null, // No image for this page, or provide one
          },
          {
            text: "He zoomed past fluffy clouds and sparkling planets. He even waved hello to a friendly alien on a passing comet!",
            imageUrl: "/images/stories/blue_rocket/page3.png",
          },
          {
            text: "Finally, he reached the Giggling Moon. And guess what? It did giggle! A warm, happy sound that made Little Blue Rocket giggle too.",
            imageUrl: null,
          },
          {
            text: "Little Blue Rocket learned that even small adventures can bring big joy. The end.",
            imageUrl: "/images/stories/blue_rocket/page5.png",
          },
        ],
      },
    },
    {
      title: "The Magical Treehouse",
      description:
        "Join Lily and Tom on an adventure in their magical treehouse.",
      contentType: ContentType.STORY,
      subject: "StoryTime",
      content: {
        coverImageUrl: "/images/stories/covers/treehouse_cover.png",
        pages: [
          {
            text: "Lily and Tom had a secret treehouse. It wasn't just any treehouse; it was magical!",
            imageUrl: "/images/stories/treehouse/page1.png",
          },
          {
            text: "Whenever they wished for an adventure, the treehouse would whisk them away. Today, they wished to visit the land of dinosaurs.",
            imageUrl: null,
          },
          {
            text: "ROAR! A friendly T-Rex greeted them. They shared yummy prehistoric berries and played hide-and-seek among giant ferns.",
            imageUrl: "/images/stories/treehouse/page3.png",
          },
          {
            text: "As the sun began to set, the treehouse gently brought them back home, full of amazing memories.",
            imageUrl: null,
          },
        ],
      },
    },
    // --- NEW QUIZ DATA ---
    {
      title: "Simple Math Quiz",
      description: "Test your basic addition skills!",
      contentType: ContentType.QUIZ,
      subject: "Mathematics",
      coverImageUrl: "/images/quizzes/math_quiz_cover.png", // Add covers for quizzes too
      courseId: mathCourse.id,
      orderInCourse: 1, // New subject for quizzes
      content: {
        questions: [
          {
            id: "q1m",
            text: "What is 2 + 3?",
            options: [
              { id: "a", text: "4" },
              { id: "b", text: "5" },
              { id: "c", text: "6" },
            ],
            correctOptionId: "b",
            explanation: "2 apples plus 3 apples makes 5 apples!",
          },
          {
            id: "q2m",
            text: "What is 5 - 1?",
            options: [
              { id: "a", text: "3" },
              { id: "b", text: "4" },
              { id: "c", text: "2" },
            ],
            correctOptionId: "b",
            explanation: "If you have 5 cookies and eat 1, you have 4 left.",
          },
        ],
        passingScorePercentage: 50, // Example: 50% to "pass" (1 out of 2 correct)
      } as unknown as Prisma.JsonValue, // Cast to Prisma.JsonValue
    },
    {
      title: "Animal Sounds Quiz",
      description: "Do you know your animal sounds?",
      contentType: ContentType.QUIZ,
      subject: "QuizZone",
      content: {
        questions: [
          {
            id: "q1a",
            text: "Which animal says 'woof'?",
            options: [
              { id: "a", text: "Cat" },
              { id: "b", text: "Bird" },
              { id: "c", text: "Dog" },
            ],
            correctOptionId: "c",
          },
          {
            id: "q2a",
            text: "Which animal says 'meow'?",
            options: [
              { id: "a", text: "Lion" },
              { id: "b", text: "Cat" },
              { id: "c", text: "Horse" },
            ],
            correctOptionId: "b",
            explanation: "Cats often meow to communicate!",
          },
          {
            id: "q3a",
            text: "Which animal says 'oink'?",
            options: [
              { id: "a", text: "Pig" },
              { id: "b", text: "Sheep" },
              { id: "c", text: "Duck" },
            ],
            correctOptionId: "a",
          },
        ],
        passingScorePercentage: 66, // Example: ~66% to "pass" (2 out of 3 correct)
      } as unknown as Prisma.JsonValue,
    },
  ];

  for (const itemData of storiesToSeed) {
    const contentJson: Prisma.JsonValue = itemData.content; // Already cast above

    await prisma.learningContent.upsert({
      where: {
        title_subject: { title: itemData.title, subject: itemData.subject },
      }, // Relies on @@unique([title, subject])
      update: { ...itemData, content: contentJson ?? {} },
      create: { ...itemData, content: contentJson ?? {} },
    });
    console.log(
      `Created/updated content: ${itemData.title} (${itemData.contentType} in ${itemData.subject})`
    );
  }

  console.log(`Seeding finished.`);
}

main()
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

//
