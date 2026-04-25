-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_InquiryItem" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "inquiryId" INTEGER NOT NULL,
    "productId" INTEGER,
    "productNameSnapshot" TEXT NOT NULL,
    "priceSnapshot" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "subtotalSnapshot" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "InquiryItem_inquiryId_fkey" FOREIGN KEY ("inquiryId") REFERENCES "Inquiry" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "InquiryItem_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_InquiryItem" ("createdAt", "id", "inquiryId", "priceSnapshot", "productId", "productNameSnapshot", "quantity", "subtotalSnapshot") SELECT "createdAt", "id", "inquiryId", "priceSnapshot", "productId", "productNameSnapshot", "quantity", "subtotalSnapshot" FROM "InquiryItem";
DROP TABLE "InquiryItem";
ALTER TABLE "new_InquiryItem" RENAME TO "InquiryItem";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
