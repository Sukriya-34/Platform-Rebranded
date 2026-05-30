import express from "express";
import prisma from "../db.js";

const router = express.Router();

// GET notifications for a user
router.get("/:userId", async (req, res) => {
  try {
    const userId = parseInt(req.params.userId);
    const notifications = await prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });
    res.json(notifications);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to load notifications" });
  }
});

// MARK notifications as read
router.put("/:userId/read", async (req, res) => {
  try {
    const userId = parseInt(req.params.userId);
    await prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true },
    });
    res.json({ message: "Notifications marked as read" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to update notifications" });
  }
});

// CREATE a notification
router.post("/", async (req, res) => {
  const { userId, message } = req.body;
  if (!userId || !message) {
    return res.status(400).json({ message: "userId and message are required" });
  }

  try {
    const notif = await prisma.notification.create({
      data: {
        userId: parseInt(userId),
        message,
      },
    });
    res.status(201).json(notif);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to create notification" });
  }
});

export default router;
