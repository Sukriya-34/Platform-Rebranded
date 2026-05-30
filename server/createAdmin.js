import bcrypt from "bcrypt";
import prisma from "./db.js";

const createMasterAdmin = async () => {
  const fullName = "Super Admin";
  const email = "admin@platform.com";
  const rawPassword = "SecurePassword123!"; 
  const role = "Admin";

  try {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(rawPassword, salt);

    const newAdmin = await prisma.user.create({
      data: {
        fullName,
        email,
        password: hashedPassword,
        role,
        isVerified: true,
      },
    });

    console.log("SUCCESS: Master Admin created!");
    console.log(newAdmin);
    process.exit(0);
  } catch (err) {
    console.error("ERROR Creating Admin: ", err.message);
    process.exit(1);
  }
};

createMasterAdmin();

