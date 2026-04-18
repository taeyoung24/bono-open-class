/*
  Warnings:

  - You are about to drop the `password_reset_codes` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropIndex
DROP INDEX "password_reset_codes_userId_key";

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "password_reset_codes";
PRAGMA foreign_keys=on;

-- CreateTable
CREATE TABLE "verification_codes" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "target" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "expiresAt" DATETIME NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "typing_records" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "userId" TEXT NOT NULL,
    "cpm" INTEGER,
    "accuracy" REAL,
    "duration" INTEGER,
    "type" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "typing_records_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("userId") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_mails" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "senderId" TEXT NOT NULL,
    "receiverId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "deletedBySender" BOOLEAN NOT NULL DEFAULT false,
    "deletedByReceiver" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "mails_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "users" ("userId") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "mails_receiverId_fkey" FOREIGN KEY ("receiverId") REFERENCES "users" ("userId") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_mails" ("content", "createdAt", "id", "isRead", "receiverId", "senderId", "title") SELECT "content", "createdAt", "id", "isRead", "receiverId", "senderId", "title" FROM "mails";
DROP TABLE "mails";
ALTER TABLE "new_mails" RENAME TO "mails";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "verification_codes_target_type_key" ON "verification_codes"("target", "type");

-- CreateIndex
CREATE INDEX "typing_records_userId_idx" ON "typing_records"("userId");
