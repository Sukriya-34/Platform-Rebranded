import prisma from './db.js';

async function main() {
  console.log("Seeding more dummy courses to fill categories...");

  let creator = await prisma.user.findFirst({
    where: { role: 'ContentCreator' }
  });

  if (!creator) creator = await prisma.user.findFirst();
  if (!creator) {
     console.error("No users found.");
     return;
  }

  const dummyCourses = [
    // Data Science
    { title: "Machine Learning Basics", description: "Introduction to ML", category: "Data Science" },
    { title: "Pandas for Data Analysis", description: "Master data manipulation", category: "Data Science" },
    { title: "Deep Learning with PyTorch", description: "Build neural networks", category: "Data Science" },
    
    // Web
    { title: "HTML & CSS from Scratch", description: "Build your first website", category: "Web" },
    { title: "JavaScript ES6+", description: "Modern JS features", category: "Web" },
    { title: "Vue.js Masterclass", description: "Reactive interfaces with Vue", category: "Web" },

    // Backend
    { title: "Express.js REST APIs", description: "Build robust APIs", category: "Backend" },
    { title: "PostgreSQL Database Admin", description: "Manage SQL databases", category: "Backend" },
    { title: "GraphQL Apollo Server", description: "Modern API layers", category: "Backend" },

    // Development
    { title: "Docker & Kubernetes", description: "Container orchestration", category: "Development" },
    { title: "CI/CD Pipeline Building", description: "Automated deployments", category: "Development" },
    { title: "Git Version Control", description: "Master branch management", category: "Development" },
  ];

  let addedCount = 0;

  for (const courseData of dummyCourses) {
    const exists = await prisma.course.findFirst({ where: { title: courseData.title } });
    if (!exists) {
      const course = await prisma.course.create({
        data: {
          title: courseData.title,
          description: courseData.description,
          category: courseData.category,
          thumbnailUrl: `https://picsum.photos/seed/${courseData.title.replace(/\s+/g, '')}/400/300`,
          creatorId: creator.id,
        }
      });

      await prisma.video.createMany({
        data: [
          { title: "Introduction", videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4", courseId: course.id, isFreePreview: true },
          { title: "Deep Dive", videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4", courseId: course.id, isFreePreview: false }
        ]
      });
      addedCount++;
    }
  }

  console.log(`Successfully added ${addedCount} additional dummy courses.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
