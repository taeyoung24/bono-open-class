-- CreateTable
CREATE TABLE "mails" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "senderId" TEXT NOT NULL,
    "receiverId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "mails_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "users" ("userId") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "mails_receiverId_fkey" FOREIGN KEY ("receiverId") REFERENCES "users" ("userId") ON DELETE RESTRICT ON UPDATE CASCADE
);
