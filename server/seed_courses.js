import prisma from './db.js';

async function main() {
  console.log("Seeding dummy courses...");

  // First, get any creator user or create a generic one
  let creator = await prisma.user.findFirst({
    where: { role: 'ContentCreator' }
  });

  if (!creator) {
     // fallback to any user
     creator = await prisma.user.findFirst();
  }

  if (!creator) {
     console.error("No users found in database to assign as creator. Please register a creator first.");
     return;
  }

  const dummyCourses = [
    // Web Development
    { title: "React for Beginners", description: "Learn React from scratch", category: "Web Development" },
    { title: "Advanced Node.js", description: "Master backend styling and microservices", category: "Web Development" },
    { title: "Fullstack Next.js 14", description: "Build scalable Next applications", category: "Web Development" },
    { title: "CSS Mastery", description: "Learn flexbox, grid, and animations", category: "Web Development" },
    
    // Programming
    { title: "Python for Data Science", description: "Master Python programming for AI", category: "Programming" },
    { title: "Java Fundamentals", description: "Learn object-oriented programming", category: "Programming" },
    { title: "C++ Advanced Concepts", description: "Data structures and algorithms", category: "Programming" },
    { title: "Go Programming", description: "Build high performance applications", category: "Programming" },

    // Design
    { title: "Figma Masterclass", description: "Learn UI/UX design with Figma", category: "Design" },
    { title: "Adobe Illustrator Basics", description: "Vector graphics for everyone", category: "Design" },
    { title: "Color Theory in UI", description: "How to pick the right colors", category: "Design" },
    { title: "Web Design Accessibility", description: "Design for all users", category: "Design" },
  ];

  let addedCount = 0;

  for (const courseData of dummyCourses) {
    // Check if course already exists to prevent duplicates on multiple runs
    const exists = await prisma.course.findFirst({ where: { title: courseData.title } });
    if (!exists) {
      // Create course
      const course = await prisma.course.create({
        data: {
          title: courseData.title,
          description: courseData.description,
          category: courseData.category,
          thumbnailUrl: `https://picsum.photos/seed/${courseData.title.replace(/\s+/g, '')}/400/300`,
          creatorId: creator.id,
        }
      });

      // Add a couple of dummy videos per course
      await prisma.video.create({
        data: {
          title: "Introduction",
          videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4",
          courseId: course.id,
          isFreePreview: true
        }
      });
      await prisma.video.create({
        data: {
          title: "Deep Dive",
          videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4",
          courseId: course.id,
          isFreePreview: false
        }
      });
      addedCount++;
    }
  }

  console.log(`Successfully added ${addedCount} dummy courses with test videos.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
