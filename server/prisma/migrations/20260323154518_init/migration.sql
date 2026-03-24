-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('Learner', 'ContentCreator', 'Admin');

-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "fullName" TEXT NOT NULL,
    "personalEmail" TEXT NOT NULL,
    "platformEmail" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" "UserRole" NOT NULL DEFAULT 'Learner',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_personalEmail_key" ON "User"("personalEmail");

-- CreateIndex
CREATE UNIQUE INDEX "User_platformEmail_key" ON "User"("platformEmail");
