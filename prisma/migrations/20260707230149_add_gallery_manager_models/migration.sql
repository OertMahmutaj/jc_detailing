-- CreateTable
CREATE TABLE "GalleryProject" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL DEFAULT 'Neues Galerie-Projekt',
    "bookingId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GalleryProject_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GalleryMediaAsset" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "storagePath" TEXT NOT NULL,
    "originalFileName" TEXT,
    "mimeType" TEXT NOT NULL,
    "fileSize" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GalleryMediaAsset_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GalleryComparison" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "label" TEXT,
    "beforeAssetId" TEXT,
    "afterAssetId" TEXT,
    "isPublished" BOOLEAN NOT NULL DEFAULT false,
    "publishedAt" TIMESTAMP(3),
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GalleryComparison_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "GalleryProject_bookingId_idx" ON "GalleryProject"("bookingId");

-- CreateIndex
CREATE INDEX "GalleryProject_createdAt_idx" ON "GalleryProject"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "GalleryMediaAsset_storagePath_key" ON "GalleryMediaAsset"("storagePath");

-- CreateIndex
CREATE INDEX "GalleryMediaAsset_projectId_createdAt_idx" ON "GalleryMediaAsset"("projectId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "GalleryComparison_beforeAssetId_key" ON "GalleryComparison"("beforeAssetId");

-- CreateIndex
CREATE UNIQUE INDEX "GalleryComparison_afterAssetId_key" ON "GalleryComparison"("afterAssetId");

-- CreateIndex
CREATE INDEX "GalleryComparison_projectId_sortOrder_idx" ON "GalleryComparison"("projectId", "sortOrder");

-- CreateIndex
CREATE INDEX "GalleryComparison_isPublished_publishedAt_idx" ON "GalleryComparison"("isPublished", "publishedAt");

-- AddForeignKey
ALTER TABLE "GalleryProject" ADD CONSTRAINT "GalleryProject_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "Booking"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GalleryMediaAsset" ADD CONSTRAINT "GalleryMediaAsset_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "GalleryProject"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GalleryComparison" ADD CONSTRAINT "GalleryComparison_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "GalleryProject"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GalleryComparison" ADD CONSTRAINT "GalleryComparison_beforeAssetId_fkey" FOREIGN KEY ("beforeAssetId") REFERENCES "GalleryMediaAsset"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GalleryComparison" ADD CONSTRAINT "GalleryComparison_afterAssetId_fkey" FOREIGN KEY ("afterAssetId") REFERENCES "GalleryMediaAsset"("id") ON DELETE SET NULL ON UPDATE CASCADE;
