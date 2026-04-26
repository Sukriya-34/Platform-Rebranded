import express from "express";
import multer from "multer";

import { createRequire } from "module";
const require = createRequire(import.meta.url);
const pdfParse = require("pdf-parse");

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post("/parse-pdf", upload.single("pdf"), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "No PDF file uploaded" });
  }

  try {
    const data = await pdfParse(req.file.buffer);
    const text = data.text;

    // A very loose but common parser:
    // Looks for lines starting with numbers (1. Question...)
    // Looks for A) B) C) etc. as options
    // Looks for "Answer: X"
    
    // We will split by new lines and iterate
    const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
    const questions = [];
    let currentQuestion = null;

    for (const line of lines) {
      // Super forgiving question match: "1.", "Q.1 )", "■ Q1:", "Question 1)"
      const qMatch = line.match(/^[^a-zA-Z0-9]*(?:[Qq]uestion\s*)?(?:[Qq]\.?\s*)?(\d+)\s*[\.\:\)\]]+\s*(.*)$/i);
      if (qMatch) {
         if (currentQuestion) {
            questions.push(currentQuestion);
         }
         currentQuestion = {
            questionText: qMatch[2] || "Question " + qMatch[1],
            options: [],
            correctAnswer: 0, // default if checking fails
            hint: ""
         };
         continue;
      }

      if (currentQuestion) {
         // Super forgiving option match: "A.", "○ A .", "[B]", "c)"
         const optMatch = line.match(/^[^A-Ea-e0-9]*(?:[\(\[])?\s*([A-Ea-e])\s*[\.\:\)\]]+\s*(.*)$/i);
         if (optMatch) {
            let optText = optMatch[2].trim();
            // Look for explicit filled circles, checkmarks, or an asterisk marking the answer
            const filledIcons = ['◉', '●', '🔘', '✓', '✔', '☑', '☒', '■', '*'];
            
            // Check if string contains any of the known true markers
            const isFilled = filledIcons.some(icon => optText.includes(icon) || line.includes(icon));
            
            // Clean up the text by stripping out leading/trailing unicode circles or special bullets
            // Also removing the '*' if they used it to mark the answer
            optText = optText.replace(/^[^a-zA-Z0-9\(\[\"\'\$\€\£\¥\+\-]+/, '')
                             .replace(/[\*✓✔☑]+$/, '')
                             .trim();
                             
            currentQuestion.options.push(optText);
            
            if (isFilled) {
               currentQuestion.correctAnswer = currentQuestion.options.length - 1;
            }
            continue;
         }

         // Is it the answer? (Handles "Answer: A", "Correct Answer B", "Ans. C")
         const ansMatch = line.match(/^[^a-zA-Z0-9]*(?:(?:Correct\s*)?Answer|Ans|Solution)[\s\:\.]*([A-Ea-e])/i);
         if (ansMatch) {
            const letter = ansMatch[1].toUpperCase();
            // A=0, B=1, C=2, D=3, E=4
            currentQuestion.correctAnswer = letter.charCodeAt(0) - 65;
            continue;
         }
         
         // If we don't match options but have a question, it might be multi-line text
         if (currentQuestion.options.length === 0) {
             currentQuestion.questionText += "\n" + line;
         } else if (line.toLowerCase().startsWith("hint:")) {
             currentQuestion.hint = line.replace(/hint:/i, "").trim();
         }
      }
    }
    
    // Push the final question
    if (currentQuestion) {
        questions.push(currentQuestion);
    }
    
    // Normalize options array to always have 4 elements
    questions.forEach(q => {
        while (q.options.length < 4) {
            q.options.push(""); // pad to 4 options as defined in creator builder expectations
        }
        if (q.options.length > 4) {
            q.options = q.options.slice(0, 4);
        }
    });

    if (questions.length === 0) {
       return res.status(400).json({ message: "Could not detect any valid questions in the PDF. Please use the format: '1. ... A) ... B) ... Answer: A'." });
    }

    res.json(questions);
  } catch (error) {
    console.error("PDF Parsing Error:", error);
    res.status(500).json({ message: "Failed to parse PDF file." });
  }
});

export default router;
