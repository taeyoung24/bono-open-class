-- CreateTable
CREATE TABLE "items" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "imageUrl" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'STICKER',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "user_inventories" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "userId" TEXT NOT NULL,
    "itemId" INTEGER NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "user_inventories_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("userId") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "user_inventories_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "items" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "user_sticker_placements" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "userId" TEXT NOT NULL,
    "itemId" INTEGER NOT NULL,
    "x" REAL NOT NULL,
    "y" REAL NOT NULL,
    "rotation" REAL NOT NULL DEFAULT 0,
    "placedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "user_sticker_placements_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("userId") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "user_sticker_placements_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "items" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "user_inventories_userId_itemId_key" ON "user_inventories"("userId", "itemId");

-- CreateIndex
CREATE INDEX "user_sticker_placements_userId_idx" ON "user_sticker_placements"("userId");
