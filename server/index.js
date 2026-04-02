import express from "express";
import cors from "cors";

import dotenv from "dotenv";

import authRoutes from "./routes/auth.js";
import courseRoutes from "./routes/course.js";
  
dotenv.config();
const app = express();

//middleware
app.use(cors());
app.use(express.json());

//1. Home Route
app.get("/", (req, res) => {
  res.send("Platform Rebranded Server is Running!");
});

app.use("/api/courses", courseRoutes);

//2. connect the routes
app.use("/api", authRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});


