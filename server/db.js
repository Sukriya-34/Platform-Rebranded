import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";
import dotenv from "dotenv";

dotenv.config();

// 1. Set up the connection pool
const { Pool } = pg;
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

// 2. Create the adapter
const adapter = new PrismaPg(pool);

// 3. Pass the adapter to Prisma! (This fixes the crash!)
const prisma = new PrismaClient({ adapter });

export default prisma;