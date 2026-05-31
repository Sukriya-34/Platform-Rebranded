import express from "express";
import prisma from "../db.js";

const router = express.Router();

// GET all quizzes for a specific creator's courses (useful for dashboard)
router.get("/creator/:creatorId", async (req, res) => {
  try {
    const courses = await prisma.course.findMany({
      where: { creatorId: parseInt(req.params.creatorId) },
      include: {
        quizzes: {
          include: { questions: true },
        },
      },
    });

    const quizzes = courses
      .map((c) => c.quizzes.map((q) => ({ ...q, courseTitle: c.title })))
      .flat();
    res.json(quizzes);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// GET a specific quiz
router.get("/:id", async (req, res) => {
  try {
    const quiz = await prisma.quiz.findUnique({
      where: { id: req.params.id },
      include: { questions: true, course: { select: { title: true } } },
    });
    if (!quiz) return res.status(404).json({ message: "Quiz not found" });
    res.json(quiz);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

router.get("/learner/quiz/:courseId", async (req, res) => {
  try {
    const quiz = await prisma.quiz.findFirst({
      where: { courseId: req.params.courseId },
      include: { questions: true }, // Must include the questions!
    });

    if (!quiz)
      return res.status(404).json({ message: "No quiz found for this course" });
    res.json(quiz);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// POST a new quiz with questions
router.post("/", async (req, res) => {
  const { courseId, questions } = req.body;
  if (!courseId || !questions || !questions.length) {
    return res
      .status(400)
      .json({ message: "Course ID and at least 1 question required." });
  }

  try {
    const newQuiz = await prisma.quiz.create({
      data: {
        courseId,
        questions: {
          create: questions.map((q) => ({
            questionText: q.questionText,
            options: q.options,
            correctAnswer: q.correctAnswer,
            hint: q.hint,
          })),
        },
      },
      include: { questions: true },
    });
    res.status(201).json(newQuiz);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to create quiz." });
  }
});

// PUT (Update) an existing quiz
router.put("/:id", async (req, res) => {
  const { questions } = req.body;
  if (!questions || !questions.length) {
    return res.status(400).json({ message: "At least 1 question required." });
  }

  try {
    // 1. Delete all existing questions for this quiz
    await prisma.question.deleteMany({
      where: { quizId: req.params.id },
    });

    // 2. Add the new/updated questions
    const updatedQuiz = await prisma.quiz.update({
      where: { id: req.params.id },
      data: {
        questions: {
          create: questions.map((q) => ({
            questionText: q.questionText,
            options: q.options,
            correctAnswer: q.correctAnswer,
            hint: q.hint,
          })),
        },
      },
      include: { questions: true },
    });
    res.json(updatedQuiz);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to update quiz." });
  }
});

// DELETE a quiz
router.delete("/:id", async (req, res) => {
  try {
    await prisma.quiz.delete({
      where: { id: req.params.id },
    });
    res.json({ message: "Quiz deleted." });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete quiz." });
  }
});

export default router;
