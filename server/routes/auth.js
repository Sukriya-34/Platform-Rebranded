import bcrypt from "bcrypt";
import pg from "pg";
import express from "express";
import dotenv from "dotenv";

import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

dotenv.config();

const { Pool } = pg;
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter }); //start the prisma engine

const router = express.Router();

// 2. Registration Route
router.post("/register", async (req, res) => {
  console.log("Received Data: ", req.body);
  // We now accept 'role' from the frontend!
  const { fullName, email, password, role } = req.body;

  if (!fullName || !email || !password) {
    console.log("REJECTED: Missing data in req.body!!");
    return res.status(400).json({
      message:
        "Wait, some data is missing! Make sure fullName, email, and password are sent.",
    });
  }

  try {
    const prismaRole = role ? role.replace(/\s+/g, "") : "Learner";

    // 1. Generate the new Platform Email
    // Example: If John Doe signs up as a learner, it becomes "john.learner@platform.com"
    const firstName = fullName.split(" ")[0].toLowerCase();

    //This removes spaces just in case (e.g., "Content Creator" -> "contentcreator")
    const formattedRole = prismaRole.toLowerCase();
    const platformEmail = `${firstName}.${formattedRole}@platform.com`;

    const existingUser = await prisma.user.findFirst({
      where: { personalEmail: email },
    });

    if (existingUser) {
      return res.status(400).json({
        message: "An account with this personal email already exists!",
      });
    }

    // 3. Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 4. Insert ALL the new data into PostgreSQL
    const newUser = await prisma.user.create({
      data: {
        fullName: fullName,
        personalEmail: email,
        platformEmail: platformEmail,
        password: hashedPassword,
        role: prismaRole,
      },
    });

    console.log(`Success: Registered ${prismaRole} - ${platformEmail}`);

    // 5. Send the newly generated email back to the frontend so the user knows what it is!
    res.status(201).json({
      message: "Registered successfully!",
      user: {
        id: newUser.id,
        fullName: newUser.fullName,
        platform: newUser.platformEmail,
        role: newUser.role,
      },
      assignedEmail: platformEmail,
    });
  } catch (err) {
    console.error("Registration Error: ", err.message);
    res.status(500).json({ error: "Server error during registration" });
  }
});

export default router;
