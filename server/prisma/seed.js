import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting professional database seeding...");

  // 1. Get your existing real user (Sukriya) instead of a dummy one
  // This ensures the courses actually belong to YOU in the Creator Studio.
  const creator = await prisma.user.findFirst({
    where: { email: "sukriyashrestha34@gmail.com" },
  });

  if (!creator) {
    console.error("❌ ERROR: User not found. Please sign up in the app first!");
    return;
  }

  console.log(`✅ Seeding courses for Creator: ${creator.fullName}`);

  // 2. High-Quality Course Data with professional Unsplash thumbnails
  const coursesToCreate = [
    {
      title: "Mastering React Server Components",
      description:
        "Dive deep into the future of React. Learn about streaming, suspense, and how to build lightning-fast web applications with zero-bundle-size components.",
      category: "Web Development",
      thumbnailUrl:
        "https://images.unsplash.com/photo-1633356122544-f134324a6cee?q=80&w=1200",
      creatorId: creator.id,
      videos: {
        create: [
          {
            title: "1. The Evolution of React",
            videoUrl:
              "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
          },
          {
            title: "2. Setting up RSC with Next.js",
            videoUrl:
              "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
          },
        ],
      },
      documents: {
        create: [
          {
            title: "RSC Architecture Diagram.pdf",
            docUrl:
              "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
          },
        ],
      },
    },
    {
      title: "Python for Data Science & AI",
      description:
        "From data cleaning with Pandas to building neural networks with TensorFlow. This is the only course you need to become a Data Scientist.",
      category: "Data Science",
      thumbnailUrl:
        "https://images.unsplash.com/photo-1551288049-bbbda536ad80?q=80&w=1200",
      creatorId: creator.id,
      videos: {
        create: [
          {
            title: "Intro to NumPy & Pandas",
            videoUrl:
              "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
          },
          {
            title: "Building your first Linear Model",
            videoUrl:
              "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
          },
        ],
      },
    },
    {
      title: "Advanced UI/UX Masterclass",
      description:
        "Design is more than just looking good. Learn the psychology of user behavior, accessibility standards, and high-fidelity prototyping in Figma.",
      category: "Design",
      thumbnailUrl:
        "https://images.unsplash.com/photo-1586717791821-3f44a563dc4c?q=80&w=1200",
      creatorId: creator.id,
      videos: {
        create: [
          {
            title: "Visual Hierarchy & Typography",
            videoUrl:
              "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4",
          },
        ],
      },
      documents: {
        create: [
          {
            title: "UX Audit Checklist.pdf",
            docUrl:
              "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
          },
        ],
      },
    },
    {
      title: "Node.js Microservices Architecture",
      description:
        "Scale your applications using microservices. Learn Docker, Kubernetes, and message brokers like RabbitMQ to build resilient backend systems.",
      category: "Backend",
      thumbnailUrl:
        "https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=1200",
      creatorId: creator.id,
      videos: {
        create: [
          {
            title: "Distributed Systems Overview",
            videoUrl:
              "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4",
          },
        ],
      },
    },
    {
      title: "Modern iOS Development with SwiftUI",
      description:
        "Build beautiful, native iOS applications with less code. Master state management, animations, and App Store deployment.",
      category: "Mobile Development",
      thumbnailUrl:
        "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?q=80&w=1200",
      creatorId: creator.id,
      videos: {
        create: [
          {
            title: "SwiftUI Views & Modifiers",
            videoUrl:
              "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4",
          },
        ],
      },
    },
  ];

  // 3. Clear existing data to avoid duplicates (Optional but recommended)
  // await prisma.video.deleteMany();
  // await prisma.document.deleteMany();
  // await prisma.course.deleteMany();

  for (const courseData of coursesToCreate) {
    const course = await prisma.course.create({
      data: courseData,
    });
    console.log(`✅ Created Course: ${course.title}`);
  }

  console.log("🎉 Seeding finished successfully! Refresh your Dashboard now.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
