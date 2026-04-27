-- AlterTable
ALTER TABLE "AdminLog" ADD COLUMN "rollbackFromLogId" INTEGER;
ALTER TABLE "AdminLog" ADD COLUMN "rolledBackAt" DATETIME;
