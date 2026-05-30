import express from "express";
import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import dotenv from "dotenv";
import prisma from "../db.js";
import axios from "axios";

dotenv.config();
const router = express.Router();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "platform_x_assets",
    resource_type: "auto",
    allowed_formats: [
      "jpg",
      "jpeg",
      "png",
      "webp",
      "mp4",
      "mov",
      "pdf",
      "docx",
    ],
  },
});

const upload = multer({ storage }).fields([
  { name: "video", maxCount: 1 },
  { name: "document", maxCount: 1 },
  { name: "thumbnail", maxCount: 1 },
]);

// --- 1. SPECIAL COMMANDS ---

router.get("/creator/:creatorId/assets", async (req, res) => {
  try {
    const creatorId = parseInt(req.params.creatorId);
    const [videos, documents] = await Promise.all([
      prisma.video.findMany({ 
        where: { course: { creatorId: creatorId } },
        include: { course: true } 
      }),
      prisma.document.findMany({ 
        where: { course: { creatorId: creatorId } },
        include: { course: true } 
      }),
    ]);
    const allAssets = [
      ...videos.map((v) => ({
        id: v.id,
        title: v.title,
        type: "video",
        status: v.status,
        course: v.course,
        date: v.createdAt,
      })),
      ...documents.map((d) => ({
        id: d.id,
        title: d.title,
        type: "document",
        status: d.status,
        course: d.course,
        date: d.createdAt,
      })),
    ];
    res.json(allAssets);
  } catch (error) {
    res.json([]);
  }
});

// --- 2. GENERAL ROUTES ---

router.post("/auto-populate/:courseId", async (req, res) => {
  const { topic } = req.body;
  const { courseId } = req.params;
  const YT_KEY = process.env.YOUTUBE_API_KEY;

  if (!topic) return res.status(400).json({ message: "Topic is required" });

  try {
    const ytRes = await axios.get(
      `https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=5&q=${topic}+tutorial&type=video&key=${YT_KEY}`,
    );

    const videoData = ytRes.data.items.map((v) => ({
      title: v.snippet.title,
      videoUrl: `https://www.youtube.com/watch?v=${v.id.videoId}`,
      courseId: courseId,
    }));

    const dbRes = await axios.get(
      `https://openlibrary.org/search.json?q=${topic}&limit=3`,
    );

    const docData = dbRes.data.docs.slice(0, 3).map((d) => ({
      title: d.title,
      docUrl: `https://openlibrary.org${d.key}`,
      courseId: courseId,
    }));

    await prisma.video.createMany({ data: videoData });
    await prisma.document.createMany({ data: docData });

    res.status(201).json({
      message: `Successfully added ${videoData.length} videos and ${docData.length} documents!`,
      videos: videoData,
    });
  } catch (error) {
    console.error(
      "Auto-populate error:",
      error.response?.data || error.message,
    );
    res
      .status(500)
      .json({ message: "Failed to fetch and save external resources." });
  }
});

router.get("/", async (req, res) => {
  const courses = await prisma.course.findMany({
    include: { _count: true },
    orderBy: { createdAt: "desc" },
  });
  res.json(courses);
});

router.get("/creator/:creatorId", async (req, res) => {
  try {
    const creatorId = parseInt(req.params.creatorId);
    const courses = await prisma.course.findMany({
      where: { creatorId },
      include: { _count: true },
      orderBy: { createdAt: "desc" },
    });
    res.json(courses);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

router.post("/create", upload, async (req, res) => {
  const { title, description, category, classification, creatorId, price } = req.body;
  const thumb = req.files?.thumbnail ? req.files.thumbnail[0].path : null;
  const course = await prisma.course.create({
    data: {
      title,
      description,
      category,
      classification,
      thumbnailUrl: thumb,
      creatorId: Number(creatorId),
      price: Number(price) || 0,
    },
  });

  // SMART NOTIFICATIONS: Notify all Learners of the new course
  try {
    const learners = await prisma.user.findMany({ where: { role: 'Learner' } });
    if (learners.length > 0) {
       const notifications = learners.map(learner => ({
          userId: learner.id,
          message: `New Course Alert: "${title}" has just been published in ${category}! Check it out.`
       }));
       await prisma.notification.createMany({ data: notifications });
    }
  } catch (err) {
    console.error("Failed to send smart notifications", err);
  }

  res.json(course);
});

router.post("/upload-content", upload, async (req, res) => {
  try {
    const { title, courseId, type, isFreePreview, videoUrl } = req.body;
    const isFree = isFreePreview === "true";

    if (type === "video") {
      let finalVideoUrl = videoUrl;
      if (!finalVideoUrl) {
        const videoFile = req.files?.video ? req.files.video[0] : null;
        if (!videoFile)
          return res
            .status(400)
            .json({ message: "No video file or URL provided" });
        finalVideoUrl = videoFile.path;
      }

      const newVideo = await prisma.video.create({
        data: {
          title,
          videoUrl: finalVideoUrl,
          courseId,
          isFreePreview: isFree,
        },
      });

      // SMART NOTIFICATION: Notify Learners about the new video
      try {
        const course = await prisma.course.findUnique({ where: { id: courseId } });
        if (course) {
          const learners = await prisma.user.findMany({ where: { role: 'Learner' } });
          if (learners.length > 0) {
            const notifications = learners.map(learner => ({
              userId: learner.id,
              message: `New Content Alert: A new video "${title}" was just added to "${course.title}"!`
            }));
            await prisma.notification.createMany({ data: notifications });
          }
        }
      } catch (err) {
        console.error("Failed to send content upload notification", err);
      }

      return res.status(201).json(newVideo);
    } else {
      const docFile = req.files?.document ? req.files.document[0] : null;
      if (!docFile)
        return res.status(400).json({ message: "No document file" });

      const newDoc = await prisma.document.create({
        data: {
          title,
          docUrl: docFile.path,
          courseId,
          isFreePreview: isFree,
        },
      });

      // SMART NOTIFICATION: Notify Learners about the new document
      try {
        const course = await prisma.course.findUnique({ where: { id: courseId } });
        if (course) {
          const learners = await prisma.user.findMany({ where: { role: 'Learner' } });
          if (learners.length > 0) {
            const notifications = learners.map(learner => ({
              userId: learner.id,
              message: `New Study Material: A document "${title}" was just added to "${course.title}"!`
            }));
            await prisma.notification.createMany({ data: notifications });
          }
        }
      } catch (err) {
        console.error("Failed to send content upload notification", err);
      }

      return res.status(201).json(newDoc);
    }
  } catch (error) {
    res.status(500).json({ message: "Upload failed." });
  }
});

router.post("/progress/complete", async (req, res) => {
  const { userId, videoId, courseId } = req.body;

  try {
    const progress = await prisma.userProgress.upsert({
      where: {
        userId_videoId: {
          userId: Number(userId),
          videoId: videoId,
        },
      },
      update: { isCompleted: true },
      create: {
        userId: Number(userId),
        videoId: videoId,
        courseId: courseId,
        isCompleted: true,
      },
    });
    res.json({ message: "Progress updated", progress });
  } catch (error) {
    console.error("Progress error:", error);
    res.status(500).json({ message: "Failed to update progress" });
  }
});

// --- 3. DYNAMIC ROUTES ---

router.get("/:id", async (req, res) => {
  try {
    const course = await prisma.course.findUnique({
      where: { id: req.params.id },
      include: { 
        videos: { where: { status: "APPROVED" } }, 
        documents: { where: { status: "APPROVED" } } 
      },
    });
    if (!course) return res.status(404).json({ message: "Not found" });
    res.json(course);
  } catch (e) {
    res.status(500).json({ message: "Error" });
  }
});

router.put("/:id", upload, async (req, res) => {
  const thumb = req.files?.thumbnail ? req.files.thumbnail[0].path : undefined;
  const { title, description, category, classification, price } = req.body;

  try {
    const updated = await prisma.course.update({
      where: { id: req.params.id },
      data: {
        ...(title && { title }),
        ...(description && { description }),
        ...(category && { category }),
        ...(classification && { classification }),
        ...(thumb && { thumbnailUrl: thumb }),
        ...(price !== undefined && { price: Number(price) || 0 }),
      },
    });
    res.json(updated);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Update failed" });
  }
});

router.delete("/:id", async (req, res) => {
  await prisma.course.delete({ where: { id: req.params.id } });
  res.json({ message: "Deleted" });
});

router.delete("/asset/:type/:id", async (req, res) => {
  const { type, id } = req.params;
  if (type === "video") await prisma.video.delete({ where: { id } });
  else await prisma.document.delete({ where: { id } });
  res.json({ message: "Deleted" });
});

// CRITICAL FIX: Robust URL vs File path handling for Edit Modal updates
router.put("/asset/:type/:id", upload, async (req, res) => {
  const { type, id } = req.params;
  const { title, videoUrl } = req.body;
  const newFile = req.files?.[type] ? req.files[type][0].path : undefined;

  try {
    if (type === "video") {
      let finalUrl = undefined;

      // If a new file was uploaded, use that path
      if (newFile) {
        finalUrl = newFile;
      }
      // Else if a URL string was provided, use that
      else if (videoUrl !== undefined && videoUrl !== "") {
        finalUrl = videoUrl;
      }

      await prisma.video.update({
        where: { id },
        data: {
          ...(title && { title }),
          ...(finalUrl !== undefined && { videoUrl: finalUrl }),
        },
      });
    } else {
      await prisma.document.update({
        where: { id },
        data: {
          ...(title && { title }),
          ...(newFile && { docUrl: newFile }),
        },
      });
    }
    res.json({ message: "Updated successfully" });
  } catch (error) {
    res.status(500).json({ message: "Update failed" });
  }
});

export default router;
