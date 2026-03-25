/*
  Warnings:

  - You are about to drop the `Badge` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `StudentBadge` table. If the table is not empty, all the data it contains will be lost.

*/
-- AlterTable
ALTER TABLE "Student" ADD COLUMN "email" TEXT;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "Badge";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "StudentBadge";
PRAGMA foreign_keys=on;

-- CreateTable
CREATE TABLE "Theme" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "Task" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "themeId" INTEGER NOT NULL,
    "prevId" INTEGER,
    "nextId" INTEGER,
    CONSTRAINT "Task_themeId_fkey" FOREIGN KEY ("themeId") REFERENCES "Theme" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "StudentProgress" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "studentId" INTEGER NOT NULL,
    "taskId" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'WAITING',
    CONSTRAINT "StudentProgress_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "StudentProgress_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "Task" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "StudentProgress_studentId_taskId_key" ON "StudentProgress"("studentId", "taskId");
