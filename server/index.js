import express from "express";
import cors from "cors";

import dotenv from "dotenv";

import authRoutes from "./routes/auth.js";
import courseRoutes from "./routes/course.js";
import learnerRoutes from "./routes/learner.js"; 
import searchRoutes from "./routes/search.js";
import quizRoutes from "./routes/quiz.js";
import uploadQuizRoutes from "./routes/upload-quiz.js";

dotenv.config();
const app = express();

//middleware
app.use(cors());
app.use(express.json());

//1. Home Route
app.get("/", (req, res) => {
  res.send("Platform Rebranded Server is Running!");
});


//2. connect the routes
app.use("/api", authRoutes);

//load the video later, it tells express o make the uploads folder publicly accessible.
app.use("/uploads", express.static("uploads"));

app.use("/api/courses", courseRoutes);
app.use("/api/learner", learnerRoutes); 
app.use("/api/search", searchRoutes);
app.use("/api/quiz", quizRoutes);
app.use("/api/upload-quiz", uploadQuizRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
