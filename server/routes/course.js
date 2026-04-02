import express from "express";
// 👇 Importing the bouncers we made earlier!
import { verifyToken, isCreator } from "../middleware/authMiddleware.js";
import prisma from "../db.js";

const router = express.Router();

// 1. UPLOAD A NEW COURSE (Creators & Admins Only)
router.post("/upload", verifyToken, isCreator, async (req, res) => {
  try {
    const { title, description, fileUrl } = req.body;

    // req.user.id automatically comes from our verifyToken middleware!
    const newCourse = await prisma.course.create({
      data: {
        title,
        description,
        fileUrl,
        creatorId: req.user.id, 
      },
    });

    res.status(201).json({ message: "Course uploaded successfully!", course: newCourse });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to upload course." });
  }
});

// 2. GET ALL COURSES (Anyone logged in can view)
router.get("/", verifyToken, async (req, res) => {
  try {
    // Find all courses and also grab the name of the person who created it
    const courses = await prisma.course.findMany({
      include: {
        creator: {
          select: { email: true }, // We will pull their email/name to display on the course card
        },
      },
      orderBy: {
        createdAt: 'desc' // Shows the newest courses first!
      }
    });

    res.status(200).json(courses);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch courses." });
  }
});

export default router;