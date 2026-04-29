-- AlterTable
ALTER TABLE "ProductImage" ADD COLUMN "watermarkAppliedAt" DATETIME;
ALTER TABLE "ProductImage" ADD COLUMN "watermarkText" TEXT;
ALTER TABLE "ProductImage" ADD COLUMN "watermarkType" TEXT;
ALTER TABLE "ProductImage" ADD COLUMN "watermarkedUrl" TEXT;
