import prisma from "./db.js";

async function main() {
  const courses = await prisma.course.findMany();
  let updated = 0;
  for (const c of courses) {
    if (c.thumbnailUrl && c.thumbnailUrl.includes("picsum")) {
       await prisma.course.update({
         where: { id: c.id },
         data: { thumbnailUrl: 'https://placehold.co/400x300/e2e8f0/1e293b?text=Course' }
       });
       updated++;
    }
  }
  console.log(`Updated ${updated} courses thumbnails.`);
}
main().catch(console.error).finally(() => prisma.$disconnect());
