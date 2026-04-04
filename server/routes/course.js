import express from "express";
import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import dotenv from "dotenv";
import prisma from "../db.js";

dotenv.config();
const router = express.Router();

// 1. Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// 2. Upgraded Storage: 'auto' allows both videos and PDFs!
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "platform_courses",
    resource_type: "auto", 
    allowed_formats: ["mp4", "mov", "avi", "mkv", "webm", "pdf", "docx"],
  },
});

// 3. Use .fields() to accept multiple different files at once
const upload = multer({ storage }).fields([
  { name: "video", maxCount: 1 },
  { name: "document", maxCount: 1 }
]);


// 1. CREATE: Upload Course with optional Video and/or Document
router.post("/create", upload, async (req, res) => {
  try {
    const { title, description, creatorId } = req.body;
    
    // Safely extract the files if they exist
    const videoFile = req.files?.video ? req.files.video[0] : null;
    const docFile = req.files?.document ? req.files.document[0] : null;

    console.log("RECEIVED -> Title:", title, "| Video:", !!videoFile, "| Doc:", !!docFile);

    if (!title || !description || !creatorId) {
      return res.status(400).json({ message: "Title, description, and creatorId are required." });
    }

    if (!videoFile && !docFile) {
      return res.status(400).json({ message: "Please upload at least one video or document." });
    }

    // Prepare the nested database entries only if the files were uploaded
    const videosData = videoFile ? [{ title: title + " Video", videoUrl: videoFile.path }] : [];
    const documentsData = docFile ? [{ title: title + " Notes", docUrl: docFile.path }] : [];

    // Save everything to Prisma in one neat package
    const newCourse = await prisma.course.create({
      data: {
        title: title,
        description: description,
        creatorId: parseInt(creatorId, 10),
        videos: { create: videosData },
        documents: { create: documentsData }, 
      },
      // Tell Prisma to return the newly created videos and documents
      include: { videos: true, documents: true }, 
    });

    res.status(201).json({ message: "Course created successfully!", course: newCourse });
  } catch (error) {
    console.error("Course Creation Error:", error);
    res.status(500).json({ message: "Failed to create course." });
  }
});

// 2. READ ALL: Get all courses
router.get("/", async (req, res) => {
  try {
    const courses = await prisma.course.findMany({
      include: { videos: true, documents: true, creator: { select: { fullName: true } } },
    });
    res.status(200).json(courses);
  } catch (error) {
    console.error("Fetch Courses Error:", error);
    res.status(500).json({ message: "Failed to fetch courses." });
  }
});

// 3. READ SINGLE: Get a specific course by its ID
router.get("/:id", async (req, res) => {
  try {
    const course = await prisma.course.findUnique({
      where: { id: req.params.id },
      include: { videos: true, documents: true, creator: { select: { fullName: true } } },
    });

    if (!course) return res.status(404).json({ message: "Course not found." });
    res.status(200).json(course);
  } catch (error) {
    console.error("Fetch Single Course Error:", error);
    res.status(500).json({ message: "Failed to fetch the course." });
  }
});

// 4. UPDATE: Edit course title and description
router.put("/:id", async (req, res) => {
  try {
    const { title, description } = req.body;
    const updatedCourse = await prisma.course.update({
      where: { id: req.params.id },
      data: {
        ...(title && { title }),             
        ...(description && { description })  
      },
    });
    res.status(200).json({ message: "Course updated successfully!", course: updatedCourse });
  } catch (error) {
    console.error("Update Course Error:", error);
    res.status(500).json({ message: "Failed to update course." });
  }
});

// 5. DELETE: Remove a course from the database
router.delete("/:id", async (req, res) => {
  try {
    await prisma.course.delete({
      where: { id: req.params.id },
    });
    res.status(200).json({ message: "Course deleted successfully!" });
  } catch (error) {
    console.error("Delete Course Error:", error);
    res.status(500).json({ message: "Failed to delete course." });
  }
});

export default router;