import express from "express";
import prisma from "../db.js";

const router = express.Router();

// GET Admin Stats overview
router.get("/stats", async (req, res) => {
  try {
    const [usersCount, coursesCount, flaggedCount, enrollmentsCount] = await Promise.all([
      prisma.user.count(),
      prisma.course.count(),
      prisma.course.count({ where: { isFlagged: true } }),
      prisma.enrollment.count(),
    ]);

    res.json({
      usersCount,
      coursesCount,
      flaggedCount,
      enrollmentsCount,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to load admin stats" });
  }
});

// GET all users
router.get("/users", async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        fullName: true,
        email: true,
        role: true,
        isVerified: true,
        createdAt: true,
      },
    });
    res.json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch users list" });
  }
});

// UPDATE user role
router.put("/users/:userId/role", async (req, res) => {
  try {
    const userId = parseInt(req.params.userId);
    const { role } = req.body;

    const resUser = await prisma.user.update({
      where: { id: userId },
      data: { role },
    });
    
    // Audit Log
    await prisma.activityLog.create({
      data: {
        userId: userId,
        action: "USER_ROLE_UPDATED",
        metadata: `Role updated to ${role}`
      }
    });

    res.json({ message: "User role updated successfully", user: resUser });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to update user role" });
  }
});

// DELETE user
router.delete("/users/:userId", async (req, res) => {
  try {
    const userId = parseInt(req.params.userId);
    
    // Audit Log BEFORE deletion
    const userToDel = await prisma.user.findUnique({ where: { id: userId } });
    if (userToDel) {
      await prisma.activityLog.create({
        data: {
          userId: userToDel.id,
          action: "USER_DELETED",
          metadata: `Admin deleted user ${userToDel.email}`
        }
      });
    }

    await prisma.user.delete({ where: { id: userId } });
    res.json({ message: "User deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to delete user" });
  }
});

// GET flagged courses
router.get("/flagged-courses", async (req, res) => {
  try {
    const courses = await prisma.course.findMany({
      where: { isFlagged: true },
      include: {
        creator: { select: { fullName: true, email: true } },
      },
    });
    res.json(courses);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch flagged courses" });
  }
});

// GET ALL courses
router.get("/courses", async (req, res) => {
  try {
    const courses = await prisma.course.findMany({
      include: {
        creator: { select: { fullName: true, email: true } },
        enrollments: true,
      },
      orderBy: { createdAt: "desc" }
    });
    res.json(courses);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch courses" });
  }
});

// TOGGLE FLAG course
router.put("/courses/:courseId/flag", async (req, res) => {
  try {
    const { courseId } = req.params;
    const { isFlagged } = req.body;

    const course = await prisma.course.update({
      where: { id: courseId },
      data: { isFlagged },
    });

    res.json({ message: `Course flag status set to ${isFlagged}`, course });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to flag course" });
  }
});

// DELETE course (moderation)
router.delete("/courses/:courseId", async (req, res) => {
  try {
    const { courseId } = req.params;
    await prisma.course.delete({ where: { id: courseId } });
    res.json({ message: "Course deleted successfully by moderator" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to delete course" });
  }
});

// GET pending content for approval
router.get("/pending-content", async (req, res) => {
  try {
    const [videos, documents] = await Promise.all([
      prisma.video.findMany({ 
        where: { status: "PENDING" },
        include: { course: { include: { creator: true } } } 
      }),
      prisma.document.findMany({ 
        where: { status: "PENDING" },
        include: { course: { include: { creator: true } } } 
      }),
    ]);
    const pendingAssets = [
      ...videos.map((v) => ({ ...v, type: "video" })),
      ...documents.map((d) => ({ ...d, type: "document" })),
    ].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    res.json(pendingAssets);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch pending content" });
  }
});

// UPDATE content status (Approve/Reject)
router.put("/content/:type/:id/status", async (req, res) => {
  try {
    const { type, id } = req.params;
    const { status } = req.body;

    if (type === "video") {
      await prisma.video.update({ where: { id }, data: { status } });
    } else {
      await prisma.document.update({ where: { id }, data: { status } });
    }
    
    // Notify creator & Audit Log
    try {
      const asset = type === "video" 
        ? await prisma.video.findUnique({ where: { id }, include: { course: true } })
        : await prisma.document.findUnique({ where: { id }, include: { course: true } });
        
        if (asset) {
          // Audit Log
          await prisma.activityLog.create({
            data: {
              userId: asset.course.creatorId,
              action: "CONTENT_MODERATED",
              metadata: `Admin ${status} ${type}: ${asset.title}`
            }
          });
          // 1. Notify Creator
          await prisma.notification.create({
            data: {
              userId: asset.course.creatorId,
              message: `Your uploaded ${type} "${asset.title}" has been ${status.toLowerCase()} by an admin.`
            }
          });

          // 2. Notify Learners if APPROVED
          if (status === "APPROVED") {
            const learners = await prisma.user.findMany({ where: { role: 'Learner' } });
            if (learners.length > 0) {
              const notifications = learners.map(learner => ({
                userId: learner.id,
                message: `New Study Material: A ${type} "${asset.title}" was just added to "${asset.course.title}"!`
              }));
              await prisma.notification.createMany({ data: notifications });
            }
          }
        }
      } catch(err) {
        console.error("Failed to notify creator/learners about status change", err);
      }

    res.json({ message: `Content marked as ${status}` });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to update content status" });
  }
});

// GET audit logs
router.get("/audit-logs", async (req, res) => {
  try {
    const logs = await prisma.activityLog.findMany({
      include: { user: true },
      orderBy: { createdAt: "desc" }
    });
    res.json(logs);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch audit logs" });
  }
});

export default router;
