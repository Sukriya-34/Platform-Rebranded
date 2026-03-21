import express from "express";
import cors from "cors";
import dotenv from "dotenv";
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

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

// 2. Registration Route(Step 2)
app.post("/api/register", async(req, res) =>{
  const { email, password, role } = req.body;

  try{
    //check if user already exists
    const userCheck = await pool.query("SELECT * FROM users WHERE email = $1",[email]);

    if (userCheck.rows.length > 0){
      return res.stattus(400).json({message: "User already exists!"});
    }

    //hash the password(makes it unreadable in pgAdmin)
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    //insert into PostgreSQL
    const newUser = await pool.query(
      "INSERT INTO users(email, password, role) VALUES ($1, $2, $3) RETURNING id, email, role",[email, hashedPassword, role]
    );

    //triggering emails here.
    console.log(`Sucess: Registered ${role} - ${email}`);

    res.status(201).json({
      message: `Registered successfully as ${role}!`,
      user: newUser.rows[0]
    });

  }catch (err){
    console.error("Registration Error: ", err.message);
    res.status(500).json({ error: "Server error during registration"});
  }
});

