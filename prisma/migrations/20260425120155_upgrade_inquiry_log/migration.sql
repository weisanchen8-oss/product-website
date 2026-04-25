-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_InquiryLog" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "inquiryId" INTEGER NOT NULL,
    "employeeId" INTEGER,
    "type" TEXT NOT NULL DEFAULT 'status',
    "fromStatus" TEXT,
    "toStatus" TEXT,
    "status" TEXT,
    "note" TEXT,
    "operatorName" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "InquiryLog_inquiryId_fkey" FOREIGN KEY ("inquiryId") REFERENCES "Inquiry" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "InquiryLog_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_InquiryLog" ("createdAt", "employeeId", "id", "inquiryId", "note", "operatorName", "status") SELECT "createdAt", "employeeId", "id", "inquiryId", "note", "operatorName", "status" FROM "InquiryLog";
DROP TABLE "InquiryLog";
ALTER TABLE "new_InquiryLog" RENAME TO "InquiryLog";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
