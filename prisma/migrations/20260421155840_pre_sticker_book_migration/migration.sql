-- CreateTable
CREATE TABLE "sticker_pages" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "userId" TEXT NOT NULL,
    "pageNumber" INTEGER NOT NULL DEFAULT 1,
    "title" TEXT DEFAULT '새 페이지',
    "backgroundColor" TEXT DEFAULT '#ffffff',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "sticker_pages_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("userId") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_user_sticker_placements" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "userId" TEXT NOT NULL,
    "pageId" INTEGER,
    "itemId" INTEGER NOT NULL,
    "x" REAL NOT NULL,
    "y" REAL NOT NULL,
    "rotation" REAL NOT NULL DEFAULT 0,
    "placedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "user_sticker_placements_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("userId") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "user_sticker_placements_pageId_fkey" FOREIGN KEY ("pageId") REFERENCES "sticker_pages" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "user_sticker_placements_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "items" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_user_sticker_placements" ("id", "itemId", "placedAt", "rotation", "userId", "x", "y") SELECT "id", "itemId", "placedAt", "rotation", "userId", "x", "y" FROM "user_sticker_placements";
DROP TABLE "user_sticker_placements";
ALTER TABLE "new_user_sticker_placements" RENAME TO "user_sticker_placements";
CREATE INDEX "user_sticker_placements_userId_idx" ON "user_sticker_placements"("userId");
CREATE INDEX "user_sticker_placements_pageId_idx" ON "user_sticker_placements"("pageId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE INDEX "sticker_pages_userId_idx" ON "sticker_pages"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "sticker_pages_userId_pageNumber_key" ON "sticker_pages"("userId", "pageNumber");
