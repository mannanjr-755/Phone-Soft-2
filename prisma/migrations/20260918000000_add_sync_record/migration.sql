-- CreateTable
CREATE TABLE "SyncRecord" (
    "id" TEXT NOT NULL,
    "clientOpId" TEXT NOT NULL,
    "method" TEXT NOT NULL,
    "path" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SyncRecord_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SyncRecord_clientOpId_key" ON "SyncRecord"("clientOpId");