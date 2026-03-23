import bcrypt from "bcrypt";
import pool from "./db.js"; // This connects to  Postgres database!

const createMasterAdmin = async () => {
  // 1. The Admin credentials you are creating
  const fullName = "Super Admin";
  const personalEmail = "admin@mycompany.com";
  const platformEmail = "admin@platform.com";
  const rawPassword = "SecurePassword123!"; 
  const role = "Admin";

  try {
    // 2. Hash the password securely so it isn't readable in pgAdmin
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(rawPassword, salt);

    // 3. Insert the Admin directly into PostgreSQL
    const newAdmin = await pool.query(
      "INSERT INTO users (full_name, personal_email, platform_email, password, role) VALUES ($1, $2, $3, $4, $5) RETURNING full_name, platform_email, role",
      [fullName, personalEmail, platformEmail, hashedPassword, role],
    );

    console.log("SUCCESS: Master Admin created!");
    console.log(newAdmin.rows[0]);
    process.exit(0); // This cleanly stops the script
  } catch (err) {
    console.error("ERROR Creating Admin: ", err.message);
    process.exit(1);
  }
};

// This actually runs the function above
createMasterAdmin();
