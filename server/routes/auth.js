import bcrypt from "bcrypt";
import pg from "pg";
import express from "express";
import dotenv from "dotenv";

import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";

dotenv.config();

const { Pool } = pg;
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter }); //start the prisma engine

const router = express.Router();

//setting up the email sender
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

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
  if (!emailRegex.test(email)) {
    console.log("Rejected: Invalid email format!");
    return res
      .status(400)
      .json({ message: "Please provide a valid email format!" });
  }

  try {
    const prismaRole = role ? role.replace(/\s+/g, "") : "Learner";

    //check for existing user uing just 'email'
    const existingUser = await prisma.user.findUnique({
      where: { email: email },
    });

    if (existingUser) {
      return res.status(400).json({
        message: "An account with this personal email already exists!",
      });
    }

    //3. Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    //generate a 6-digit OTP and set expiry(15 minutes)
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiry = new Date(Date.now() + 15 * 60 * 1000);

    // 4. Insert ALL the new data into PostgreSQL
    const newUser = await prisma.user.create({
      data: {
        fullName: fullName,
        email: email,
        password: hashedPassword,
        role: prismaRole,
        isVerified: false, //start unverified
        otpCode: otpCode,
        otpExpiry: otpExpiry,
      },
    });

    console.log(`Success: Registered ${prismaRole} - ${email}`);

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Verify your Platform Account",
      html: `<div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
          <h2>Welcome to Platform, ${fullName}!</h2>
          <p>You are almost there. Your verification code is:</p>
          <h1 style="color: #4285F4; letter-spacing: 5px;">${otpCode}</h1>
          <p>This code will expire in 15 minutes.</p>
        </div>`,
    };

    await transporter.sendMail(mailOptions);
    console.log(`OTP sent to ${email}`);

    //send success to frontend
    res.status(201).json({
      message: "Registered successfully! Please check your email for the OTP.",
      email: newUser.email,
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
    //search using email
    const user = await prisma.user.findUnique({
      where: { email: email },
    });

    //if no user is fouund
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    if (user.isVerified == false) {
      return res.status(403).json({
        message: "Please verify your email address before loggin in.",
      });
    }

    //compare typed pass with hashed db pass
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials!" });
    }

    //generate digital vip pass(jwt)
    const token = jwt.sign(
      { id: user.id, role: user.role },
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
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    console.error("Login Error: ", err.message);
    res.status(500).json({ error: "Server error during login" });
  }
});

//verify otp route
router.post("/verify", async (req, res) => {
  const { email, otpCode } = req.body;

  try {
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    // Check if the code matches
    if (user.otpCode !== otpCode) {
      return res.status(400).json({ message: "Invalid verification code." });
    }

    // Check if the 15-minute timer ran out
    if (new Date() > user.otpExpiry) {
      return res
        .status(400)
        .json({ message: "Code has expired. Please click Resend." });
    }

    //Update the user to verified and clear out the old OTP data
    await prisma.user.update({
      where: { email },
      data: {
        isVerified: true,
        otpCode: null,
        otpExpiry: null,
      },
    });

    console.log(`SUCCESS: ${email} is now verified!`);
    res.status(200).json({ message: "Account successfully verified!" });
  } catch (err) {
    console.error("Verification Error:", err.message);
    res.status(500).json({ message: "Server error during verification." });
  }
});

//resend otp route
router.post("/resend-otp", async (req, res) => {
  const { email } = req.body;

  try {
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    // Generate a brand new 6-digit code and a new 15-minute timer
    const newOtpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const newOtpExpiry = new Date(Date.now() + 15 * 60 * 1000);

    // Save the new code to the database
    await prisma.user.update({
      where: { email },
      data: {
        otpCode: newOtpCode,
        otpExpiry: newOtpExpiry,
      },
    });

    // Send the new email
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Your New Verification Code - Platform",
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
          <h2>Here is your new code!</h2>
          <p>Your new verification code is:</p>
          <h1 style="color: #4285F4; letter-spacing: 5px;">${newOtpCode}</h1>
          <p>This code will expire in 15 minutes.</p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`New OTP sent to ${email}`);

    res
      .status(200)
      .json({ message: "A new code has been sent to your email!" });
  } catch (err) {
    console.error("Resend Error:", err.message);
    res.status(500).json({ message: "Failed to resend code." });
  }
});

export default router;
