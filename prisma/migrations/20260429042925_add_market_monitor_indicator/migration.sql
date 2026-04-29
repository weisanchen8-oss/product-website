-- CreateTable
CREATE TABLE "MarketMonitorIndicator" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "currentValue" REAL NOT NULL,
    "warningThreshold" REAL NOT NULL,
    "dangerThreshold" REAL NOT NULL,
    "compareMode" TEXT NOT NULL DEFAULT 'gte',
    "unit" TEXT,
    "riskLevel" TEXT NOT NULL DEFAULT 'normal',
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
