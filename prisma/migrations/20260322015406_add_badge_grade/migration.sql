-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Badge" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "imagePath" TEXT NOT NULL,
    "grade" INTEGER NOT NULL DEFAULT 1
);
INSERT INTO "new_Badge" ("description", "id", "imagePath", "name") SELECT "description", "id", "imagePath", "name" FROM "Badge";
DROP TABLE "Badge";
ALTER TABLE "new_Badge" RENAME TO "Badge";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
