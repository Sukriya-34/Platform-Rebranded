import express from "express";
import prisma from "../db.js";

const router = express.Router();

// Get the main dashboard data for the learner
router.get("/dashboard-data/:userId", async (req, res) => {
  try {
    const userId = parseInt(req.params.userId);

    const enrollments = await prisma.enrollment.findMany({
      where: { userId },
      include: {
        course: {
          include: { _count: { select: { videos: true } } }
        }
      },
      orderBy: { updatedAt: 'desc' },
      take: 3
    });

    const enrolledIds = enrollments.map(e => e.courseId);

    const [recommended, trending] = await Promise.all([
      prisma.course.findMany({
        where: { id: { notIn: enrolledIds } },
        include: { _count: { select: { videos: true } } },
        take: 4
      }),
      prisma.course.findMany({
        include: { _count: { select: { videos: true } } },
        orderBy: { enrollments: { _count: 'desc' } },
        take: 4
      })
    ]);

    res.json({ continueLearning: enrollments, recommended, trending });
  } catch (error) {
    console.error("Dashboard error:", error);
    res.status(500).json({ message: "Error loading dashboard" });
  }
});

// Handle course enrollment
router.post("/:courseId/enroll", async (req, res) => {
  try {
    const { courseId } = req.params;
    const { userId } = req.body;

    const existing = await prisma.enrollment.findUnique({
      where: { userId_courseId: { userId: parseInt(userId), courseId } }
    });

    if (existing) return res.status(400).json({ message: "Already enrolled" });

    const enrollment = await prisma.enrollment.create({
      data: {
        userId: parseInt(userId),
        courseId,
        progress: 0
      }
    });

    res.status(201).json(enrollment);
  } catch (error) {
    res.status(500).json({ message: "Enrollment failed" });
  }
});

// Track video completion and update total course progress
router.post("/update-progress", async (req, res) => {
  const { userId, videoId, docId, quizId, courseId } = req.body;
  const uid = parseInt(userId);

  try {
    // Save completion for this specific item
    let existing;
    if (videoId) existing = await prisma.userProgress.findFirst({ where: { userId: uid, videoId } });
    if (docId) existing = await prisma.userProgress.findFirst({ where: { userId: uid, docId } });
    if (quizId) existing = await prisma.userProgress.findFirst({ where: { userId: uid, quizId } });
    
    if (!existing) {
      await prisma.userProgress.create({
        data: { userId: uid, videoId, docId, quizId, courseId, isCompleted: true }
      });
    }

    // Calculate overall percentage
    const [numVideos, numDocs, numQuizzes] = await Promise.all([
      prisma.video.count({ where: { courseId } }),
      prisma.document.count({ where: { courseId } }),
      prisma.quiz.count({ where: { courseId } })
    ]);
    const total = numVideos + numDocs + numQuizzes;
    
    const done = await prisma.userProgress.count({
      where: { userId: uid, courseId, isCompleted: true }
    });

    const percentage = total > 0 ? Math.min(Math.round((done / total) * 100), 100) : 0;

    // Safely update the main enrollment record (it might not exist if creator is testing)
    try {
      await prisma.enrollment.update({
        where: { userId_courseId: { userId: uid, courseId } },
        data: { progress: percentage }
      });
    } catch (e) {
      console.log("Skipping enrollment update: User is likely not formally enrolled yet.");
    }

    res.json({ progress: percentage });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Progress sync failed" });
  }
});

// Fetch completed items for a specific course
router.get("/progress/:courseId/:userId", async (req, res) => {
  try {
    const progress = await prisma.userProgress.findMany({
      where: { 
        courseId: req.params.courseId, 
        userId: parseInt(req.params.userId), 
        isCompleted: true 
      },
      select: { videoId: true, docId: true, quizId: true }
    });
    
    const completedIds = progress.map(p => p.videoId || p.docId || p.quizId).filter(Boolean);
    res.json(completedIds);
  } catch (error) {
    res.status(500).json({ message: "Error fetching progress" });
  }
});

// Fetch the quiz for a specific course
router.get("/quiz/:courseId", async (req, res) => {
  try {
    const quiz = await prisma.quiz.findFirst({
      where: { courseId: req.params.courseId },
      include: { questions: true }
    });

    if (!quiz) return res.status(404).json({ message: "No quiz found" });
    res.json(quiz);
  } catch (error) {
    res.status(500).json({ message: "Error fetching quiz" });
  }
});

// --- NOTES API ---
router.get("/notes", async (req, res) => {
  try {
    const { userId, videoId, docId } = req.query;
    const whereClause = { userId: parseInt(userId) };
    if (videoId) whereClause.videoId = videoId;
    if (docId) whereClause.docId = docId;

    const notes = await prisma.note.findMany({
      where: whereClause,
      orderBy: { createdAt: "desc" }
    });
    res.json(notes);
  } catch (error) {
    res.status(500).json({ message: "Error fetching notes" });
  }
});

router.post("/notes", async (req, res) => {
  try {
    const { userId, videoId, docId, content } = req.body;
    const newNote = await prisma.note.create({
      data: {
        userId: parseInt(userId),
        videoId,
        docId,
        content
      }
    });
    res.status(201).json(newNote);
  } catch (error) {
    res.status(500).json({ message: "Error saving note" });
  }
});

export default router;