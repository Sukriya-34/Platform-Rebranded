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

    // Core FYP Algorithm: Activity-Based Recommendations
    const activityLogs = await prisma.activityLog.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 50
    });

    // Build user interest profile from enrollments & activity metadata
    const enrolledCategories = enrollments.map(e => e.course.category);
    const activityKeywords = activityLogs.filter(a => a.action === "SEARCH" && a.metadata).map(a => a.metadata);
    
    const interestsMap = [...enrolledCategories, ...activityKeywords].reduce((acc, val) => {
       if(val) acc[val] = (acc[val] || 0) + 1;
       return acc;
     }, {});

    const topKeywords = Object.keys(interestsMap).sort((a,b) => interestsMap[b] - interestsMap[a]).slice(0, 3);
    
    let dbRecommended = [];
    if (topKeywords.length > 0) {
      dbRecommended = await prisma.course.findMany({
         where: { 
           id: { notIn: enrolledIds },
           isFlagged: false,
           OR: [
              ...topKeywords.map(k => ({ category: { contains: k, mode: 'insensitive' } })),
              ...topKeywords.map(k => ({ title: { contains: k, mode: 'insensitive' } }))
           ]
         },
         include: { _count: { select: { videos: true } } },
         take: 8
      });
    }

    // Pad with fallback courses if recommendation doesn't yield 8 full results
    let fallback = [];
    if (dbRecommended.length < 8) {
       const excludeIds = [...enrolledIds, ...dbRecommended.map(c => c.id)];
       fallback = await prisma.course.findMany({
         where: { id: { notIn: excludeIds }, isFlagged: false },
         include: { _count: { select: { videos: true } } },
         take: 8 - dbRecommended.length,
         orderBy: { enrollments: { _count: 'desc' } }
       });
     }
    const recommendedRaw = [...dbRecommended, ...fallback];

    // Personalize recommendation reason insights
    const recommended = recommendedRaw.map(course => {
      let reason = "Popular recommendation";
      
      const matchSearch = activityLogs.find(a => 
        a.action === "SEARCH" && a.metadata && 
        (course.title.toLowerCase().includes(a.metadata.toLowerCase()) || 
         course.category.toLowerCase().includes(a.metadata.toLowerCase()))
      );

      if (matchSearch) {
        reason = `Based on your search for "${matchSearch.metadata}"`;
      } else {
        const matchCategory = enrollments.find(e => e.course.category === course.category);
        if (matchCategory) {
          reason = `Because you are interested in ${course.category}`;
        } else if (course.classification) {
          reason = `Curated in "${course.classification}"`;
        }
      }
      return { ...course, reason };
    });

    const trending = await prisma.course.findMany({
      where: { isFlagged: false },
      include: { _count: { select: { videos: true } } },
      orderBy: { enrollments: { _count: 'desc' } },
      take: 8
    });

    // Group local courses by category
    const allCourses = await prisma.course.findMany({
      where: { isFlagged: false },
      include: { _count: { select: { videos: true } } },
      orderBy: { createdAt: 'desc' }
    });
    
    const categoryGroups = {};
    allCourses.forEach(c => {
      if (!categoryGroups[c.category]) categoryGroups[c.category] = [];
      if (categoryGroups[c.category].length < 8) categoryGroups[c.category].push(c);
    });
    
    const categories = Object.keys(categoryGroups).map(k => ({ title: k, courses: categoryGroups[k] }));

    res.json({ continueLearning: enrollments, recommended, trending, categories });
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

    // Log Activity
    try {
      const course = await prisma.course.findUnique({ where: { id: courseId } });
      await prisma.activityLog.create({
        data: {
          userId: parseInt(userId),
          action: "ENROLL",
          metadata: `Enrolled in course "${course?.title || 'Course'}"`
        }
      });
    } catch (e) {
      console.error("Activity logging failed on enroll:", e);
    }

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

    // Log Completed Activity with human-readable titles
    try {
      let detailMessage = "Completed a lesson";
      if (quizId) {
        const q = await prisma.quiz.findUnique({
          where: { id: quizId },
          include: { course: true }
        });
        detailMessage = `Completed assessment for "${q?.course?.title || 'Course'}"`;
      } else if (videoId) {
        const v = await prisma.video.findUnique({
          where: { id: videoId },
          include: { course: true }
        });
        detailMessage = `Completed video "${v?.title || 'Lesson'}" in "${v?.course?.title || 'Course'}"`;
      } else if (docId) {
        const d = await prisma.document.findUnique({
          where: { id: docId },
          include: { course: true }
        });
        detailMessage = `Read study material "${d?.title || 'Document'}" in "${d?.course?.title || 'Course'}"`;
      }

      await prisma.activityLog.create({
        data: { 
          userId: uid, 
          action: quizId ? "COMPLETED_QUIZ" : "COMPLETE_RESOURCE", 
          metadata: detailMessage 
        }
      });
    } catch (err) {
      console.error("Failed to log activity details:", err);
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

router.put("/notes/:noteId", async (req, res) => {
  try {
    const { noteId } = req.params;
    const { content } = req.body;
    const updatedNote = await prisma.note.update({
      where: { id: parseInt(noteId) },
      data: { content }
    });
    res.json(updatedNote);
  } catch (error) {
    res.status(500).json({ message: "Error updating note" });
  }
});

// Proxy for embedding external docs
router.get("/proxy-doc", async (req, res) => {
  try {
    const { url } = req.query;
    if (!url) return res.send("No URL provided");
    const response = await fetch(url);
    let html = await response.text();
    const origin = new URL(url).origin;
    html = html.replace('<head>', `<head><base href="${origin}">`);
    res.send(html);
  } catch(e) {
    res.send("Failed to load document");
  }
});

// --- ACTIVITY & PERSONALIZATION API ---
router.post("/activity", async (req, res) => {
  try {
    const { userId, action, metadata } = req.body;
    if (!userId) return res.status(400).send("No user ID");
    
    await prisma.activityLog.create({
      data: { userId: parseInt(userId), action, metadata }
    });
    res.status(201).json({ status: "logged" });
  } catch (error) {
    console.error("Activity log error:", error);
    res.status(500).json({ message: "Error tracking activity" });
  }
});

// --- SAVED / RESOURCES API ---
router.post("/:courseId/toggle-save", async (req, res) => {
  try {
    const { courseId } = req.params;
    const { userId } = req.body;
    const uid = parseInt(userId);

    const existing = await prisma.savedCourse.findUnique({
      where: { userId_courseId: { userId: uid, courseId } }
    });

    let saved = false;
    if (existing) {
      await prisma.savedCourse.delete({
        where: { userId_courseId: { userId: uid, courseId } }
      });
      saved = false;
    } else {
      await prisma.savedCourse.create({
        data: { userId: uid, courseId }
      });
      saved = true;
    }

    // Log Toggle Save Activity
    try {
      const course = await prisma.course.findUnique({ where: { id: courseId } });
      await prisma.activityLog.create({
        data: {
          userId: uid,
          action: "TOGGLE_SAVE",
          metadata: saved 
            ? `Bookmarked "${course?.title || 'course'}"`
            : `Removed bookmark for "${course?.title || 'course'}"`
        }
      });
    } catch (e) {
      console.error(e);
    }

    res.json({ saved });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Toggling save failed" });
  }
});

router.get("/saved-courses/:userId", async (req, res) => {
  try {
     const records = await prisma.savedCourse.findMany({
        where: { userId: parseInt(req.params.userId) },
        include: { course: { include: { _count: { select: { videos: true } } } } },
        orderBy: { createdAt: "desc" }
     });
     res.json(records);
  } catch (err) {
     res.status(500).json({ message: "Failed to load saved resources" });
  }
});

router.get("/enrolled-courses/:userId", async (req, res) => {
  try {
    const enrollments = await prisma.enrollment.findMany({
      where: { userId: parseInt(req.params.userId) },
      include: {
        course: {
          include: { _count: { select: { videos: true } } }
        }
      },
      orderBy: { updatedAt: 'desc' }
    });
    res.json(enrollments);
  } catch (err) {
    res.status(500).json({ message: "Failed to load enrollments" });
  }
});

// GET activity history for the learner
router.get("/history/:userId", async (req, res) => {
  try {
    const userId = parseInt(req.params.userId);
    const history = await prisma.activityLog.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 100
    });
    res.json(history);
  } catch (error) {
    console.error("History fetch error:", error);
    res.status(500).json({ message: "Failed to load learning history" });
  }
});

export default router;