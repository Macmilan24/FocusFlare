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

  const coursesInputData = [
    {
      title: "Math Adventure: Numbers Up To 10",
      description:
        "A fun journey into the world of counting and basic addition with numbers up to 10.",
      subject: "Mathematics",
      coverImageUrl: "/images/courses/math_adventure_cover.png",
      published: true,
    },
    {
      title: "Cosmic Story Quest",
      description:
        "Embark on exciting reading adventures through space and magical lands!",
      subject: "StoryTime",
      coverImageUrl: "/images/courses/cosmic_stories_cover.png",
      published: true,
    },
  ];

  const createdCoursesMap = new Map<string, string>(); // Map: course title -> generated course ID

  for (const courseData of coursesInputData) {
    const course = await prisma.course.upsert({
      where: { title: courseData.title }, // Upsert based on unique title
      update: {
        // Fields to update if course already exists
        description: courseData.description,
        subject: courseData.subject,
        coverImageUrl: courseData.coverImageUrl,
        published: courseData.published,
      },
      create: {
        // Fields for creating a new course (ID will be auto-generated)
        title: courseData.title,
        description: courseData.description,
        subject: courseData.subject,
        coverImageUrl: courseData.coverImageUrl,
        published: courseData.published,
      },
    });
    createdCoursesMap.set(course.title, course.id); // Store title and its new ID
    console.log(`Created/updated course: ${course.title} (ID: ${course.id})`);
  }

  console.log("Seeding learning content and linking to courses...");

  const learningContentInputData = [
    {
      title: "The Little Blue Rocket",
      description: "A story about a brave little rocket exploring space.",
      contentType: ContentType.STORY,
      subject: "StoryTime", // Subject of the content item itself
      courseTitleToLink: "Cosmic Story Quest", // Temporary field to find course ID
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
      title: "The Lost Star",
      description:
        "A little star gets lost and tries to find its way back home.",
      contentType: ContentType.STORY,
      subject: "StoryTime",
      courseTitleToLink: "Cosmic Story Quest",
      orderInCourse: 2,
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
      title: "Counting Fun (1-5)",
      description: "Let's count some fun things!",
      contentType: ContentType.QUIZ,
      subject: "Mathematics",
      coverImageUrl: "/images/quizzes/counting_fun_cover.png",
      courseTitleToLink: "Math Adventure: Numbers Up To 10",
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
      title: "Adding Small Numbers",
      description: "Practice adding numbers up to 5.",
      contentType: ContentType.QUIZ,
      subject: "Mathematics",
      coverImageUrl: "/images/quizzes/adding_small_cover.png",
      courseTitleToLink: "Math Adventure: Numbers Up To 10",
      orderInCourse: 2,
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

  for (const itemData of learningContentInputData) {
    const { courseTitleToLink, ...contentDataToSave } = itemData; // Separate linking field

    let courseIdToSet: string | null = null;
    if (courseTitleToLink) {
      courseIdToSet = createdCoursesMap.get(courseTitleToLink) || null;
      if (!courseIdToSet) {
        console.warn(
          `WARNING: Course titled "${courseTitleToLink}" not found for content "${contentDataToSave.title}". It will be standalone.`
        );
      }
    }

    await prisma.learningContent.upsert({
      where: {
        title_subject: {
          title: contentDataToSave.title,
          subject: contentDataToSave.subject,
        },
      },
      update: {
        ...contentDataToSave,
        content: contentDataToSave.content ?? ({} as Prisma.InputJsonValue),
        courseId: courseIdToSet, // Use the fetched or null courseId
      },
      create: {
        ...contentDataToSave,
        content: contentDataToSave.content ?? ({} as Prisma.InputJsonValue),
        courseId: courseIdToSet,
      },
    });
    console.log(
      `Created/updated content: ${contentDataToSave.title} (${contentDataToSave.contentType} in ${contentDataToSave.subject})`
    );
  }

  console.log(`Seeding finished completely.`);
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
