-- AlterTable
ALTER TABLE "deliverables" ADD COLUMN     "fileName" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "sizeBytes" INTEGER NOT NULL DEFAULT 0;
