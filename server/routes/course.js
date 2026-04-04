import express from "express";
import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import dotenv from "dotenv";
import prisma from "../db.js";

dotenv.config();
const router = express.Router();

// 1. Cloudinary Config
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// 2. Storage Setup
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "platform_x_assets",
    resource_type: "auto",
    allowed_formats: ["jpg", "jpeg", "png", "webp", "mp4", "mov", "pdf", "docx"],
  },
});

const upload = multer({ storage }).fields([
  { name: "video", maxCount: 1 },
  { name: "document", maxCount: 1 },
  { name: "thumbnail", maxCount: 1 } 
]);

// --- ROUTES ---

// 1. CREATE COURSE (With Category 
router.post("/create", upload, async (req, res) => {
  try {
    const { title, description, category, creatorId } = req.body;

    const thumbnailFile = req.files?.thumbnail ? req.files.thumbnail[0] : null;
    const videoFile = req.files?.video ? req.files.video[0] : null;
    const docFile = req.files?.document ? req.files.document[0] : null;

    const newCourse = await prisma.course.create({
      data: {
        title,
        description,
        category, 
        thumbnailUrl: thumbnailFile ? thumbnailFile.path : null, // Save image URL
        creatorId: parseInt(creatorId),
        videos: videoFile
          ? { create: [{ title: title + " Video", videoUrl: videoFile.path }] }
          : undefined,
        documents: docFile
          ? { create: [{ title: title + " Notes", docUrl: docFile.path }] }
          : undefined,
      },
      include: { videos: true, documents: true },
    });

    res.status(201).json(newCourse);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to create course." });
  }
});

// 2. GET ALL COURSES (For your "My Courses" page)
router.get("/", async (req, res) => {
  try {
    const courses = await prisma.course.findMany({
      include: {
        _count: { select: { videos: true, documents: true } },
      },
      orderBy: { createdAt: "desc" },
    });
    res.json(courses);
  } catch (error) {
    res.status(500).json({ message: "Error fetching courses" });
  }
});

// 3. GET ALL CONTENT (Specifically for your "Manage Content" Library page)
router.get("/all-assets", async (req, res) => {
  try {
    const videos = await prisma.video.findMany({ include: { course: true } });
    const documents = await prisma.document.findMany({
      include: { course: true },
    });

    // Combine them into one list for your table
    const allAssets = [
      ...videos.map((v) => ({
        ...v,
        type: "video",
        size: "Calculated",
        date: v.createdAt,
      })),
      ...documents.map((d) => ({
        ...d,
        type: "document",
        size: "Calculated",
        date: d.createdAt,
      })),
    ];

    res.json(allAssets);
  } catch (error) {
    res.status(500).json({ message: "Error fetching assets" });
  }
});

// 4. DELETE ASSET (For the Trash button in Manage Content)
router.delete("/asset/:type/:id", async (req, res) => {
  const { type, id } = req.params;
  try {
    if (type === "video") await prisma.video.delete({ where: { id } });
    else await prisma.document.delete({ where: { id } });
    res.json({ message: "Asset deleted" });
  } catch (error) {
    res.status(500).json({ message: "Delete failed" });
  }
});

export default router;
