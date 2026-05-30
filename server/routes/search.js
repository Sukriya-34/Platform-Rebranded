import express from "express";
import axios from "axios";
import dotenv from "dotenv";
import prisma from "../db.js";

dotenv.config();
const router = express.Router();

router.get("/external", async (req, res) => {
  const { q } = req.query;
  const YT_KEY = process.env.YOUTUBE_API_KEY;

  if (!q) return res.status(400).json({ message: "Search query is required" });

  try {
    let localData = [];
    let videoData = [];
    let docData = [];

    // 1. Fetch from Local Database
    try {
      localData = await prisma.course.findMany({
        where: {
          OR: [
            { title: { contains: q, mode: 'insensitive' } },
            { description: { contains: q, mode: 'insensitive' } },
            { category: { contains: q, mode: 'insensitive' } },
            { classification: { contains: q, mode: 'insensitive' } }
          ]
        },
        include: {
          _count: {
            select: { videos: true }
          }
        }
      });
    } catch (err) {
      console.error("Local Course Fetch Error", err.message);
    }

    // 2. Fetch from YouTube
    if (YT_KEY) {
      try {
        const ytRes = await axios.get(
          `https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=6&q=${encodeURIComponent(q)}+tutorial&type=video&key=${YT_KEY}`
        );
        videoData = ytRes.data.items.map((v) => ({
          videoId: v.id.videoId,
          title: v.snippet.title,
          description: v.snippet.description,
          thumbnailUrl: v.snippet.thumbnails?.high?.url || v.snippet.thumbnails?.default?.url,
          channelTitle: v.snippet.channelTitle,
        }));
      } catch (err) {
        console.error("YouTube Fetch Error", err.message);
      }
    }

    // 3. Fetch from OpenLibrary (Educational Books/Docs)
    try {
      const dbRes = await axios.get(
        `https://openlibrary.org/search.json?q=${encodeURIComponent(q)}&limit=4`
      );
      if (dbRes.data && dbRes.data.docs) {
        docData = dbRes.data.docs.map((d) => ({
          url: `https://openlibrary.org${d.key}`,
          title: d.title,
          description: d.author_name ? `By ${d.author_name[0]}` : "Free educational book",
        }));
      }
    } catch (err) {
      console.error("OpenLibrary Fetch Error", err.message);
    }

    res.status(200).json({ localCourses: localData, videos: videoData, documents: docData });
  } catch (error) {
    console.error("Search API Error:", error.message);
    res.status(500).json({ message: "Failed to search resources." });
  }
});

router.get("/youtube/:videoId", async (req, res) => {
  const { videoId } = req.params;
  const YT_KEY = process.env.YOUTUBE_API_KEY;

  try {
    const ytRes = await axios.get(
      `https://www.googleapis.com/youtube/v3/videos?part=snippet&id=${videoId}&key=${YT_KEY}`
    );
    if (ytRes.data.items && ytRes.data.items.length > 0) {
      const v = ytRes.data.items[0];
      res.json({
        videoId: v.id,
        title: v.snippet.title,
        description: v.snippet.description,
        channelTitle: v.snippet.channelTitle,
      });
    } else {
      res.status(404).json({ message: "Video not found" });
    }
  } catch (error) {
    res.status(500).json({ message: "Error fetching video details" });
  }
});

export default router;
