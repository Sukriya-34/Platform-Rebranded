import prisma from "./db.js";

async function approveAll() {
  await prisma.video.updateMany({
    where: { status: "PENDING" },
    data: { status: "APPROVED" }
  });
  await prisma.document.updateMany({
    where: { status: "PENDING" },
    data: { status: "APPROVED" }
  });
  console.log("All existing content marked as APPROVED.");
}

approveAll().catch(console.error).finally(() => prisma.$disconnect());
