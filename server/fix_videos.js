import prisma from './db.js';

async function main() {
  console.log("Analyzing and fixing courses...");

  const courses = await prisma.course.findMany({
    include: { videos: { orderBy: { createdAt: 'asc' } } }
  });

  let fixedCount = 0;
  let populatedCount = 0;

  for (const course of courses) {
    let videos = course.videos;

    // If no videos, populate some dummy ones
    if (videos.length === 0) {
      console.log(`Course '${course.title}' has no videos. Populating dummy videos...`);
      const v1 = await prisma.video.create({
        data: {
          title: "Course Introduction",
          videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4",
          courseId: course.id,
          isFreePreview: true
        }
      });
      const v2 = await prisma.video.create({
        data: {
          title: "Deep Dive",
          videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4",
          courseId: course.id,
          isFreePreview: false
        }
      });
      videos = [v1, v2];
      populatedCount++;
    }

    // Now make sure ONLY the first video is free preview
    if (videos.length > 0) {
      for (let i = 0; i < videos.length; i++) {
        const vid = videos[i];
        const shouldBeFree = i === 0;

        if (vid.isFreePreview !== shouldBeFree) {
          await prisma.video.update({
            where: { id: vid.id },
            data: { isFreePreview: shouldBeFree }
          });
          fixedCount++;
        }
      }
    }
  }

  console.log(`Finished fixing videos. Populated dummy videos for ${populatedCount} courses. Enforced 1st-free-preview logic for ${fixedCount} videos.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
