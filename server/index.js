import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import bcrypt from "bcrypt";
import pool from "./db.js";

dotenv.config();

const app = express();

//middleware
app.use(cors());
app.use(express.json());

//1. Home Route (Fixes "Cannot GET /")
app.get("/", (req, res) => {
  res.send("Platform Rebranded Server is Running!");
});

//database test route
app.get("/test-db", async (req, res) => {
  try {
    const result = await pool.query("SELECT NOW()");
    res.json({
      message: "Database connection successful!",
      time: result.rows[0].now,
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Database connection error");
  }
});

// 2. Registration Route
app.post("/api/register", async (req, res) => {
  // We now accept 'role' from the frontend!
  const { fullName, email, password, role } = req.body;

  try {
    // 1. Generate the new Platform Email
    // Example: If John Doe signs up as a learner, it becomes "john.learner@platform.com"
    const firstName = fullName.split(" ")[0].toLowerCase();
    const platformEmail = `${firstName}.${role}@platform.com`;

    // 2. Check if user already exists (using their personal email)
    const userCheck = await pool.query(
      "SELECT * FROM users WHERE personal_email = $1",
      [email],
    );
    if (userCheck.rows.length > 0) {
      return res.status(400).json({
        message: "An account with this personal email already exists!",
      });
    }

    // 3. Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 4. Insert ALL the new data into PostgreSQL
    const newUser = await pool.query(
      "INSERT INTO users (full_name, personal_email, platform_email, password, role) VALUES ($1, $2, $3, $4, $5) RETURNING id, full_name, platform_email, role",
      [fullName, email, platformEmail, hashedPassword, role],
    );

    console.log(`Success: Registered ${role} - ${platformEmail}`);

    // 5. Send the newly generated email back to the frontend so the user knows what it is!
    res.status(201).json({
      message: "Registered successfully!",
      user: newUser.rows[0],
      assignedEmail: platformEmail,
    });
  } catch (err) {
    console.error("Registration Error: ", err.message);
    res.status(500).json({ error: "Server error during registration" });
  }
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
