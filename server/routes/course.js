import express from "express";
import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import dotenv from "dotenv";
import prisma from "../db.js";

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
    allowed_formats: ["jpg", "jpeg", "png", "webp", "mp4", "mov", "pdf", "docx"],
  },
});

const upload = multer({ storage }).fields([
  { name: "video", maxCount: 1 },
  { name: "document", maxCount: 1 },
  { name: "thumbnail", maxCount: 1 },
]);

// --- 1. SPECIAL COMMANDS (MUST BE FIRST) ---

router.get("/seed-now", async (req, res) => {
  try {
    const user = await prisma.user.findFirst();
    if (!user) return res.status(400).send("No user found.");

    const data = [
      { title: "React Masterclass", cat: "Web Development", img: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800" },
      { title: "AI with Python", cat: "Programming", img: "https://images.unsplash.com/photo-1551288049-bbbda536ad80?w=800" }
    ];

    for (const item of data) {
      await prisma.course.create({
        data: {
          title: item.title,
          description: "Professional course content.",
          category: item.cat,
          thumbnailUrl: item.img,
          creatorId: user.id,
          videos: {
            create: [{ title: "Introduction", videoUrl: "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4" }]
          }
        }
      });
    }
    res.send("🎉 Seeded!");
  } catch (err) {
    res.status(500).send(err.message);
  }
});

router.get("/all-assets", async (req, res) => {
  try {
    const [videos, documents] = await Promise.all([
      prisma.video.findMany({ include: { course: true } }),
      prisma.document.findMany({ include: { course: true } })
    ]);
    const allAssets = [
      ...videos.map(v => ({ id: v.id, title: v.title, type: "video", course: v.course, date: v.createdAt })),
      ...documents.map(d => ({ id: d.id, title: d.title, type: "document", course: d.course, date: d.createdAt }))
    ];
    res.json(allAssets);
  } catch (error) {
    res.json([]);
  }
});

// --- 2. GENERAL ROUTES ---

router.get("/", async (req, res) => {
  const courses = await prisma.course.findMany({ include: { _count: true }, orderBy: { createdAt: "desc" } });
  res.json(courses);
});

router.post("/create", upload, async (req, res) => {
  const { title, description, category, creatorId } = req.body;
  const thumb = req.files?.thumbnail ? req.files.thumbnail[0].path : null;
  const course = await prisma.course.create({
    data: { title, description, category, thumbnailUrl: thumb, creatorId: Number(creatorId) }
  });
  res.json(course);
});

router.post("/upload-content", upload, async (req, res) => {
  try {
    const { title, courseId, type } = req.body;

    if (type === "video") {
      const videoFile = req.files?.video ? req.files.video[0] : null;
      if (!videoFile) return res.status(400).json({ message: "No video file" });

      const newVideo = await prisma.video.create({
        data: { title, videoUrl: videoFile.path, courseId },
      });
      return res.status(201).json(newVideo);
    } else {
      const docFile = req.files?.document ? req.files.document[0] : null;
      if (!docFile) return res.status(400).json({ message: "No document file" });

      const newDoc = await prisma.document.create({
        data: { title, docUrl: docFile.path, courseId },
      });
      return res.status(201).json(newDoc);
    }
  } catch (error) {
    res.status(500).json({ message: "Upload failed." });
  }
});

// --- 3. DYNAMIC ROUTES (MUST BE LAST) ---

router.get("/:id", async (req, res) => {
  try {
    const course = await prisma.course.findUnique({
      where: { id: req.params.id }, // UUID/String support
      include: { videos: true, documents: true }
    });
    if (!course) return res.status(404).json({ message: "Not found" });
    res.json(course);
  } catch (e) { res.status(500).json({ message: "Error" }); }
});

router.put("/:id", upload, async (req, res) => {
  const thumb = req.files?.thumbnail ? req.files.thumbnail[0].path : undefined;
  const updated = await prisma.course.update({
    where: { id: req.params.id },
    data: { ...req.body, ...(thumb && { thumbnailUrl: thumb }) }
  });
  res.json(updated);
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

export default router;