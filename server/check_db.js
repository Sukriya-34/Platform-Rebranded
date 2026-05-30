import prisma from "./db.js";
async function check() {
  const courses = await prisma.course.findMany();
  console.log("Total courses:", courses.length);
  if (courses.length > 0) {
    console.log("First course ID:", courses[0].id);
  }
}
check().catch(console.error).finally(() => prisma.$disconnect());
