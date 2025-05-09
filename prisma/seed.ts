// prisma/seed.ts
import { PrismaClient, ContentType, Role } from "@prisma/client";
const prisma = new PrismaClient();
import bcrypt from "bcryptjs";

async function main() {
  console.log(`Start seeding ...`);

  // --- Seed Learning Content (Stories) ---
  const stories = [
    {
      title: "The Little Blue Rocket",
      description: "A story about a brave little rocket exploring space.",
      contentType: ContentType.STORY,
      subject: "StoryTime", // Match a category you might use
      content: {
        pages: [
          "Once upon a time, in a sky full of twinkling stars, lived a Little Blue Rocket. He wasn't the biggest or the fastest, but he was the bravest.",
          "One day, Little Blue Rocket decided to visit the Giggling Moon. 'I want to see if it really giggles!' he beeped.",
          "He zoomed past fluffy clouds and sparkling planets. He even waved hello to a friendly alien on a passing comet!",
          "Finally, he reached the Giggling Moon. And guess what? It did giggle! A warm, happy sound that made Little Blue Rocket giggle too.",
          "Little Blue Rocket learned that even small adventures can bring big joy. The end.",
        ],
        coverImageUrl: "/images/stories/blue_rocket_cover.png", // Example path
      },
    },
    {
      title: "The Magical Treehouse",
      description:
        "Join Lily and Tom on an adventure in their magical treehouse.",
      contentType: ContentType.STORY,
      subject: "StoryTime",
      content: {
        pages: [
          "Lily and Tom had a secret treehouse. It wasn't just any treehouse; it was magical!",
          "Whenever they wished for an adventure, the treehouse would whisk them away. Today, they wished to visit the land of dinosaurs.",
          "ROAR! A friendly T-Rex greeted them. They shared yummy prehistoric berries and played hide-and-seek among giant ferns.",
          "As the sun began to set, the treehouse gently brought them back home, full of amazing memories.",
        ],
        coverImageUrl: "/images/stories/treehouse_cover.png", // Example path
      },
    },
    {
      title: "The Lost Star",
      description:
        "A little star gets lost and tries to find its way back home.",
      contentType: ContentType.STORY,
      subject: "StoryTime",
      content: {
        pages: [
          "Twinkle, a tiny star, was playing tag with his friends when he tumbled out of the Milky Way!",
          "He felt a little scared but remembered his grandpa's words: 'Even when lost, look for the helpers.'",
          "A wise old owl showed him the North Star. 'Follow that, little one, and you'll find your way.'",
          "Twinkle thanked the owl and journeyed back, finally rejoining his sparkling family, shining brighter than ever.",
        ],
        coverImageUrl: "/images/stories/lost_star_cover.png",
      },
    },
  ];

  for (const story of stories) {
    await prisma.learningContent.upsert({
      where: { title_subject: { title: story.title, subject: story.subject } },
      update: { ...story, content: story.content as any }, // Cast content to 'any' or Prisma.JsonValue
      create: { ...story, content: story.content as any }, // Cast content to 'any' or Prisma.JsonValue
    });
    console.log(`Created/updated story: ${story.title}`);
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
