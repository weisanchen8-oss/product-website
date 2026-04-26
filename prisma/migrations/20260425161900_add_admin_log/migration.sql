-- CreateTable
CREATE TABLE "AdminLog" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "module" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "targetId" INTEGER,
    "targetName" TEXT,
    "operatorName" TEXT,
    "note" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
