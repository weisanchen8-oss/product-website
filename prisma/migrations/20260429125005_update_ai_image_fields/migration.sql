-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_ProductImage" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "productId" INTEGER NOT NULL,
    "originalUrl" TEXT NOT NULL,
    "processedUrl" TEXT,
    "isProcessed" BOOLEAN NOT NULL DEFAULT false,
    "processingStatus" TEXT NOT NULL DEFAULT 'idle',
    "processingError" TEXT,
    "aiProvider" TEXT,
    "processedAt" DATETIME,
    "useProcessedAsCover" BOOLEAN NOT NULL DEFAULT false,
    "logoApplied" BOOLEAN NOT NULL DEFAULT false,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isCover" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "ProductImage_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_ProductImage" ("createdAt", "id", "isCover", "isProcessed", "logoApplied", "originalUrl", "processedUrl", "processingError", "processingStatus", "productId", "sortOrder", "updatedAt") SELECT "createdAt", "id", "isCover", "isProcessed", "logoApplied", "originalUrl", "processedUrl", "processingError", "processingStatus", "productId", "sortOrder", "updatedAt" FROM "ProductImage";
DROP TABLE "ProductImage";
ALTER TABLE "new_ProductImage" RENAME TO "ProductImage";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
