import bcrypt from "bcrypt";
import pg from "pg";
import express from "express";
import dotenv from "dotenv";

import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

import jwt from "jsonwebtoken";

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

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if(!emailRegex.test(email)){
    console.log("Rejected: Invalid email format!");
    return res.status(400).json({ message: "Please provide a valid email format!" });
  }

  try {
    const prismaRole = role ? role.replace(/\s+/g, "") : "Learner";

    //generate new email
    const nameParts = fullName.trim().split(" ");
    const firstName = nameParts[0].toLowerCase();

    const lastName =
      nameParts.length > 1
        ? "." + nameParts[nameParts.length - 1].toLowerCase()
        : "";

    const platformEmail = `${firstName}${lastName}@pltfrmX.com`;
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

//login Route
router.post("/login", async (req, res) => {
  console.log("LOGIN ATTEMPT:", req.body);

  const { email, password } = req.body;

  //check if the data is valid
  if (!email || !password) {
    return res
      .status(400)
      .json({ message: "Please provide both email and password!" });
  }

  try {
    const user = await prisma.user.findFirst({
      where: { personalEmail: email },
    });

    //if no user is fouund
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    //compare typed pass with hashed db pass
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials!" });
    }

    //generate digital vip pass(jwt)
    const token = jwt.sign(
      { id: user.id, role: user.role, platformEmail: user.platformEmail },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }, // the pass expires in 1 day
    );

    console.log(`SUCCESS: ${user.fullName} logged in!`);

    //send the pass and user info back to the frontend
    res.status(200).json({
      message: "Logged in successfully!",
      token: token,
      user: {
        id: user.id,
        fullName: user.fullName,
        platformEmail: user.platformEmail,
        role: user.role,
      },
    });
  } catch (err) {
    console.error("Login Error: ", err.message);
    res.status(500).json({ error: "Server error during login" });
  }
});

export default router;
