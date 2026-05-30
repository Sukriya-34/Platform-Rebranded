import express from "express";
import prisma from "../db.js";

const router = express.Router();

// 1. Get chat history between two users
router.get("/history/:userId/:otherId", async (req, res) => {
  const userId = parseInt(req.params.userId);
  const otherId = parseInt(req.params.otherId);

  try {
    const messages = await prisma.chatMessage.findMany({
      where: {
        OR: [
          { senderId: userId, receiverId: otherId },
          { senderId: otherId, receiverId: userId },
        ],
      },
      orderBy: { createdAt: "asc" },
    });
    res.json(messages);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to load chat history" });
  }
});

// 2. Send a message
router.post("/send", async (req, res) => {
  const { senderId, receiverId, message } = req.body;

  if (!senderId || !receiverId || !message || message.trim() === "") {
    return res.status(400).json({ message: "Sender, receiver, and message content are required" });
  }

  try {
    const chatMessage = await prisma.chatMessage.create({
      data: {
        senderId: parseInt(senderId),
        receiverId: parseInt(receiverId),
        message: message.trim(),
      },
    });

    res.status(201).json(chatMessage);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to send message" });
  }
});

// 3. Get user's contacts list (recent chats)
router.get("/contacts/:userId", async (req, res) => {
  const userId = parseInt(req.params.userId);

  try {
    const messages = await prisma.chatMessage.findMany({
      where: {
        OR: [{ senderId: userId }, { receiverId: userId }],
      },
      select: {
        senderId: true,
        receiverId: true,
      },
    });

    const contactIds = new Set();
    messages.forEach((m) => {
      if (m.senderId !== userId) contactIds.add(m.senderId);
      if (m.receiverId !== userId) contactIds.add(m.receiverId);
    });

    const contacts = await prisma.user.findMany({
      where: { id: { in: Array.from(contactIds) } },
      select: {
        id: true,
        fullName: true,
        role: true,
        avatar: true,
      },
    });

    if (contacts.length === 0) {
      const defaultContacts = await prisma.user.findMany({
        where: {
          role: { in: ["Admin", "ContentCreator"] },
          id: { not: userId },
        },
        select: {
          id: true,
          fullName: true,
          role: true,
          avatar: true,
        },
        take: 10,
      });
      return res.json(defaultContacts);
    }

    res.json(contacts);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to load contacts" });
  }
});

export default router;
