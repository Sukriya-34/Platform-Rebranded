import express from "express";
import bcrypt from "bcrypt";
import prisma from "../db.js";
import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import dotenv from "dotenv";

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
    folder: "platform_x_avatars",
    resource_type: "image",
    allowed_formats: ["jpg", "jpeg", "png", "webp"],
  },
});

const upload = multer({ storage });


// GET Profile details
router.get("/:userId", async (req, res) => {
  try {
    const userId = parseInt(req.params.userId);
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        fullName: true,
        email: true,
        role: true,
        avatar: true,
        bio: true,
        skills: true,
      },
    });

    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch profile" });
  }
});

// UPDATE Profile details
router.put("/:userId", upload.single("avatarFile"), async (req, res) => {
  const userId = parseInt(req.params.userId);
  const { fullName, email, avatar, bio, skills, password } = req.body;

  try {
    const updateData = {
      fullName,
      email,
      bio,
      skills,
    };

    if (req.file && req.file.path) {
       updateData.avatar = req.file.path;
    } else if (avatar) {
       updateData.avatar = avatar;
    }

    if (password && password.trim() !== "") {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      updateData.password = hashedPassword;
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        fullName: true,
        email: true,
        role: true,
        avatar: true,
        bio: true,
        skills: true,
      },
    });

    res.json(updatedUser);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to update profile" });
  }
});

// GET Public Contributor Profile (showcase)
router.get("/contributor/:creatorId", async (req, res) => {
  try {
    const creatorId = parseInt(req.params.creatorId);
    const user = await prisma.user.findUnique({
      where: { id: creatorId },
      select: {
        id: true,
        fullName: true,
        avatar: true,
        bio: true,
        skills: true,
        courses: {
          where: { isFlagged: false },
          include: { _count: { select: { videos: true } } },
        },
      },
    });

    if (!user) return res.status(404).json({ message: "Contributor not found" });
    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch contributor details" });
  }
});

// UPDATE Password
router.put("/:userId/password", async (req, res) => {
  const userId = parseInt(req.params.userId);
  const { oldPassword, newPassword } = req.body;

  try {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return res.status(404).json({ message: "User not found" });

    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) return res.status(400).json({ message: "Incorrect old password" });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword }
    });

    res.json({ message: "Password updated successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to update password" });
  }
});

export default router;
