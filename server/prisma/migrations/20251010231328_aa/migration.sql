-- AlterTable
ALTER TABLE `RevisionRequest` ADD COLUMN `approvedAt` DATETIME(3) NULL,
    ADD COLUMN `implementedAt` DATETIME(3) NULL;

-- AlterTable
ALTER TABLE `RevisionTimeline` ADD COLUMN `description` VARCHAR(191) NULL;
