/*
  Warnings:

  - You are about to drop the column `authorId` on the `Category` table. All the data in the column will be lost.
  - You are about to drop the column `authorId` on the `Collection` table. All the data in the column will be lost.
  - You are about to drop the column `price` on the `Collection` table. All the data in the column will be lost.
  - You are about to drop the column `sku` on the `Collection` table. All the data in the column will be lost.
  - You are about to drop the column `stock` on the `Collection` table. All the data in the column will be lost.
  - You are about to alter the column `images` on the `Collection` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Json`.
  - You are about to drop the column `currency` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the column `incoterm` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the column `manufacturerResponse` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the column `targetDeadline` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the column `actionTaken` on the `ProductionRevision` table. All the data in the column will be lost.
  - You are about to drop the column `description` on the `ProductionRevision` table. All the data in the column will be lost.
  - You are about to drop the column `newDeadline` on the `ProductionRevision` table. All the data in the column will be lost.
  - You are about to drop the column `oldDeadline` on the `ProductionRevision` table. All the data in the column will be lost.
  - You are about to drop the column `productionId` on the `ProductionRevision` table. All the data in the column will be lost.
  - You are about to drop the column `proofDocument` on the `ProductionRevision` table. All the data in the column will be lost.
  - You are about to drop the column `responsibleDept` on the `ProductionRevision` table. All the data in the column will be lost.
  - You are about to drop the column `revisionReason` on the `ProductionRevision` table. All the data in the column will be lost.
  - You are about to drop the column `extraDays` on the `ProductionStageUpdate` table. All the data in the column will be lost.
  - You are about to drop the column `isRevision` on the `ProductionStageUpdate` table. All the data in the column will be lost.
  - You are about to drop the column `notes` on the `ProductionStageUpdate` table. All the data in the column will be lost.
  - You are about to drop the column `photos` on the `ProductionStageUpdate` table. All the data in the column will be lost.
  - You are about to drop the column `productionId` on the `ProductionStageUpdate` table. All the data in the column will be lost.
  - You are about to drop the column `packagingWorkshopId` on the `ProductionTracking` table. All the data in the column will be lost.
  - You are about to drop the column `sewingWorkshopId` on the `ProductionTracking` table. All the data in the column will be lost.
  - You are about to drop the column `errorRate` on the `QualityControl` table. All the data in the column will be lost.
  - You are about to drop the column `inspector` on the `QualityControl` table. All the data in the column will be lost.
  - You are about to drop the column `notes` on the `QualityControl` table. All the data in the column will be lost.
  - You are about to drop the column `productionId` on the `QualityControl` table. All the data in the column will be lost.
  - You are about to drop the column `testReport` on the `QualityControl` table. All the data in the column will be lost.
  - You are about to drop the column `testResult` on the `QualityControl` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `QualityControl` table. All the data in the column will be lost.
  - The values [FABRIC_QUALITY,SIZE_CHECK,COLOR_MATCH,SEWING_QUALITY,ACCESSORY_CHECK,GENERAL_APPEARANCE,PACKAGING_CHECK] on the enum `QualityControl_testType` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `collectionId` on the `Question` table. All the data in the column will be lost.
  - You are about to drop the column `collectionId` on the `Review` table. All the data in the column will be lost.
  - You are about to drop the column `isApproved` on the `Review` table. All the data in the column will be lost.
  - You are about to drop the column `accessories` on the `Sample` table. All the data in the column will be lost.
  - You are about to drop the column `actualProductionDate` on the `Sample` table. All the data in the column will be lost.
  - You are about to drop the column `cargoTrackingNumber` on the `Sample` table. All the data in the column will be lost.
  - You are about to drop the column `category` on the `Sample` table. All the data in the column will be lost.
  - You are about to drop the column `collectionName` on the `Sample` table. All the data in the column will be lost.
  - You are about to drop the column `contactEmail` on the `Sample` table. All the data in the column will be lost.
  - You are about to drop the column `customDesignImages` on the `Sample` table. All the data in the column will be lost.
  - You are about to drop the column `deliveryAddress` on the `Sample` table. All the data in the column will be lost.
  - You are about to drop the column `estimatedProductionDate` on the `Sample` table. All the data in the column will be lost.
  - You are about to drop the column `fabric` on the `Sample` table. All the data in the column will be lost.
  - You are about to drop the column `fabricColor` on the `Sample` table. All the data in the column will be lost.
  - You are about to drop the column `gender` on the `Sample` table. All the data in the column will be lost.
  - You are about to drop the column `leadTimeDays` on the `Sample` table. All the data in the column will be lost.
  - You are about to drop the column `originalCollectionId` on the `Sample` table. All the data in the column will be lost.
  - You are about to drop the column `priorityReason` on the `Sample` table. All the data in the column will be lost.
  - You are about to drop the column `productionDays` on the `Sample` table. All the data in the column will be lost.
  - You are about to drop the column `revisionCount` on the `Sample` table. All the data in the column will be lost.
  - You are about to drop the column `revisionDate` on the `Sample` table. All the data in the column will be lost.
  - You are about to drop the column `revisionRequests` on the `Sample` table. All the data in the column will be lost.
  - You are about to drop the column `shippingDate` on the `Sample` table. All the data in the column will be lost.
  - You are about to drop the column `sizeChartUrl` on the `Sample` table. All the data in the column will be lost.
  - You are about to drop the column `sizeOrPattern` on the `Sample` table. All the data in the column will be lost.
  - You are about to alter the column `sampleType` on the `Sample` table. The data in that column could be lost. The data in that column will be cast from `Enum(EnumId(6))` to `VarChar(191)`.
  - The values [REVIEWED,QUOTE_SENT,APPROVED,PRODUCTION_COMPLETE,DELIVERED] on the enum `Sample_status` will be removed. If these variants are still used in the database, this will fail.
  - The values [SHOWROOM] on the enum `Sample_deliveryMethod` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `type` on the `Workshop` table. All the data in the column will be lost.
  - You are about to drop the `OrderProduction` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `SampleProduction` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[slug]` on the table `Collection` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `userId` to the `Category` table without a default value. This is not possible if the table is not empty.
  - Added the required column `slug` to the `Collection` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `Collection` table without a default value. This is not possible if the table is not empty.
  - Made the column `categoryId` on table `Collection` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `productionTrackingId` to the `ProductionRevision` table without a default value. This is not possible if the table is not empty.
  - Added the required column `reason` to the `ProductionRevision` table without a default value. This is not possible if the table is not empty.
  - Added the required column `revisionType` to the `ProductionRevision` table without a default value. This is not possible if the table is not empty.
  - Added the required column `productionTrackingId` to the `ProductionStageUpdate` table without a default value. This is not possible if the table is not empty.
  - Added the required column `workshopId` to the `ProductionTracking` table without a default value. This is not possible if the table is not empty.
  - Added the required column `productionTrackingId` to the `QualityControl` table without a default value. This is not possible if the table is not empty.
  - Added the required column `result` to the `QualityControl` table without a default value. This is not possible if the table is not empty.
  - Made the column `collectionId` on table `Sample` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `ownerId` to the `Workshop` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Workshop` table without a default value. This is not possible if the table is not empty.
  - Made the column `capacity` on table `Workshop` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE `Category` DROP FOREIGN KEY `Category_authorId_fkey`;

-- DropForeignKey
ALTER TABLE `Collection` DROP FOREIGN KEY `Collection_authorId_fkey`;

-- DropForeignKey
ALTER TABLE `Collection` DROP FOREIGN KEY `Collection_categoryId_fkey`;

-- DropForeignKey
ALTER TABLE `OrderProduction` DROP FOREIGN KEY `OrderProduction_orderId_fkey`;

-- DropForeignKey
ALTER TABLE `OrderProduction` DROP FOREIGN KEY `OrderProduction_updatedById_fkey`;

-- DropForeignKey
ALTER TABLE `ProductionRevision` DROP FOREIGN KEY `ProductionRevision_productionId_fkey`;

-- DropForeignKey
ALTER TABLE `ProductionStageUpdate` DROP FOREIGN KEY `ProductionStageUpdate_productionId_fkey`;

-- DropForeignKey
ALTER TABLE `ProductionTracking` DROP FOREIGN KEY `ProductionTracking_collectionId_fkey`;

-- DropForeignKey
ALTER TABLE `ProductionTracking` DROP FOREIGN KEY `ProductionTracking_orderId_fkey`;

-- DropForeignKey
ALTER TABLE `ProductionTracking` DROP FOREIGN KEY `ProductionTracking_packagingWorkshopId_fkey`;

-- DropForeignKey
ALTER TABLE `ProductionTracking` DROP FOREIGN KEY `ProductionTracking_sewingWorkshopId_fkey`;

-- DropForeignKey
ALTER TABLE `QualityControl` DROP FOREIGN KEY `QualityControl_productionId_fkey`;

-- DropForeignKey
ALTER TABLE `Question` DROP FOREIGN KEY `Question_collectionId_fkey`;

-- DropForeignKey
ALTER TABLE `Review` DROP FOREIGN KEY `Review_collectionId_fkey`;

-- DropForeignKey
ALTER TABLE `Sample` DROP FOREIGN KEY `Sample_collectionId_fkey`;

-- DropForeignKey
ALTER TABLE `Sample` DROP FOREIGN KEY `Sample_originalCollectionId_fkey`;

-- DropForeignKey
ALTER TABLE `SampleProduction` DROP FOREIGN KEY `SampleProduction_sampleId_fkey`;

-- DropForeignKey
ALTER TABLE `SampleProduction` DROP FOREIGN KEY `SampleProduction_updatedById_fkey`;

-- DropIndex
DROP INDEX `Category_authorId_fkey` ON `Category`;

-- DropIndex
DROP INDEX `Collection_authorId_fkey` ON `Collection`;

-- DropIndex
DROP INDEX `Collection_categoryId_fkey` ON `Collection`;

-- DropIndex
DROP INDEX `Collection_sku_key` ON `Collection`;

-- DropIndex
DROP INDEX `ProductionRevision_productionId_idx` ON `ProductionRevision`;

-- DropIndex
DROP INDEX `ProductionStageUpdate_productionId_stage_idx` ON `ProductionStageUpdate`;

-- DropIndex
DROP INDEX `ProductionTracking_collectionId_fkey` ON `ProductionTracking`;

-- DropIndex
DROP INDEX `ProductionTracking_orderId_idx` ON `ProductionTracking`;

-- DropIndex
DROP INDEX `ProductionTracking_packagingWorkshopId_fkey` ON `ProductionTracking`;

-- DropIndex
DROP INDEX `ProductionTracking_sewingWorkshopId_fkey` ON `ProductionTracking`;

-- DropIndex
DROP INDEX `QualityControl_productionId_testType_idx` ON `QualityControl`;

-- DropIndex
DROP INDEX `Question_collectionId_fkey` ON `Question`;

-- DropIndex
DROP INDEX `Review_collectionId_fkey` ON `Review`;

-- DropIndex
DROP INDEX `Sample_collectionId_fkey` ON `Sample`;

-- DropIndex
DROP INDEX `Sample_originalCollectionId_fkey` ON `Sample`;

-- DropIndex
DROP INDEX `Workshop_name_key` ON `Workshop`;

-- AlterTable
ALTER TABLE `Category` DROP COLUMN `authorId`,
    ADD COLUMN `userId` INTEGER NOT NULL;

-- AlterTable
ALTER TABLE `Collection` DROP COLUMN `authorId`,
    DROP COLUMN `price`,
    DROP COLUMN `sku`,
    DROP COLUMN `stock`,
    ADD COLUMN `isFeatured` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `slug` VARCHAR(191) NOT NULL,
    ADD COLUMN `tags` JSON NULL,
    ADD COLUMN `userId` INTEGER NOT NULL,
    ADD COLUMN `viewCount` INTEGER NOT NULL DEFAULT 0,
    MODIFY `images` JSON NULL,
    MODIFY `categoryId` INTEGER NOT NULL;

-- AlterTable
ALTER TABLE `Message` ADD COLUMN `fileName` VARCHAR(191) NULL,
    ADD COLUMN `fileUrl` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `Order` DROP COLUMN `currency`,
    DROP COLUMN `incoterm`,
    DROP COLUMN `manufacturerResponse`,
    DROP COLUMN `targetDeadline`,
    ADD COLUMN `manufacturerNote` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `ProductionRevision` DROP COLUMN `actionTaken`,
    DROP COLUMN `description`,
    DROP COLUMN `newDeadline`,
    DROP COLUMN `oldDeadline`,
    DROP COLUMN `productionId`,
    DROP COLUMN `proofDocument`,
    DROP COLUMN `responsibleDept`,
    DROP COLUMN `revisionReason`,
    ADD COLUMN `newValue` VARCHAR(191) NULL,
    ADD COLUMN `oldValue` VARCHAR(191) NULL,
    ADD COLUMN `productionTrackingId` INTEGER NOT NULL,
    ADD COLUMN `reason` VARCHAR(191) NOT NULL,
    ADD COLUMN `revisionType` ENUM('DATE_CHANGE', 'QUANTITY_CHANGE', 'STAGE_UPDATE', 'QUALITY_ISSUE', 'OTHER') NOT NULL;

-- AlterTable
ALTER TABLE `ProductionStageUpdate` DROP COLUMN `extraDays`,
    DROP COLUMN `isRevision`,
    DROP COLUMN `notes`,
    DROP COLUMN `photos`,
    DROP COLUMN `productionId`,
    ADD COLUMN `note` VARCHAR(191) NULL,
    ADD COLUMN `productionTrackingId` INTEGER NOT NULL,
    MODIFY `status` ENUM('NOT_STARTED', 'IN_PROGRESS', 'COMPLETED', 'DELAYED', 'CANCELLED', 'WAITING', 'BLOCKED') NOT NULL;

-- AlterTable
ALTER TABLE `ProductionTracking` DROP COLUMN `packagingWorkshopId`,
    DROP COLUMN `sewingWorkshopId`,
    ADD COLUMN `estimatedTotalDays` INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN `sampleId` INTEGER NULL,
    ADD COLUMN `workshopId` INTEGER NOT NULL,
    MODIFY `orderId` INTEGER NULL,
    MODIFY `collectionId` INTEGER NULL,
    MODIFY `overallStatus` ENUM('NOT_STARTED', 'IN_PROGRESS', 'COMPLETED', 'DELAYED', 'CANCELLED', 'WAITING', 'BLOCKED') NOT NULL DEFAULT 'IN_PROGRESS';

-- AlterTable
ALTER TABLE `QualityControl` DROP COLUMN `errorRate`,
    DROP COLUMN `inspector`,
    DROP COLUMN `notes`,
    DROP COLUMN `productionId`,
    DROP COLUMN `testReport`,
    DROP COLUMN `testResult`,
    DROP COLUMN `updatedAt`,
    ADD COLUMN `details` VARCHAR(191) NULL,
    ADD COLUMN `productionTrackingId` INTEGER NOT NULL,
    ADD COLUMN `result` ENUM('PASSED', 'FAILED', 'NEEDS_REVISION') NOT NULL,
    MODIFY `testType` ENUM('COLOR_FASTNESS', 'SHRINKAGE', 'FABRIC_WEIGHT', 'SEAM_STRENGTH', 'DURABILITY', 'APPEARANCE', 'MEASUREMENT') NOT NULL;

-- AlterTable
ALTER TABLE `Question` DROP COLUMN `collectionId`,
    MODIFY `isPublic` BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE `Review` DROP COLUMN `collectionId`,
    DROP COLUMN `isApproved`;

-- AlterTable
ALTER TABLE `Sample` DROP COLUMN `accessories`,
    DROP COLUMN `actualProductionDate`,
    DROP COLUMN `cargoTrackingNumber`,
    DROP COLUMN `category`,
    DROP COLUMN `collectionName`,
    DROP COLUMN `contactEmail`,
    DROP COLUMN `customDesignImages`,
    DROP COLUMN `deliveryAddress`,
    DROP COLUMN `estimatedProductionDate`,
    DROP COLUMN `fabric`,
    DROP COLUMN `fabricColor`,
    DROP COLUMN `gender`,
    DROP COLUMN `leadTimeDays`,
    DROP COLUMN `originalCollectionId`,
    DROP COLUMN `priorityReason`,
    DROP COLUMN `productionDays`,
    DROP COLUMN `revisionCount`,
    DROP COLUMN `revisionDate`,
    DROP COLUMN `revisionRequests`,
    DROP COLUMN `shippingDate`,
    DROP COLUMN `sizeChartUrl`,
    DROP COLUMN `sizeOrPattern`,
    ADD COLUMN `actualCompletionDate` DATETIME(3) NULL,
    ADD COLUMN `estimatedDays` INTEGER NULL,
    ADD COLUMN `images` JSON NULL,
    ADD COLUMN `isApproved` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `minimumQuantity` INTEGER NULL,
    ADD COLUMN `tags` JSON NULL,
    ADD COLUMN `unitPrice` DOUBLE NULL,
    MODIFY `sampleType` VARCHAR(191) NULL,
    MODIFY `status` ENUM('REQUESTED', 'RECEIVED', 'IN_DESIGN', 'PATTERN_READY', 'IN_PRODUCTION', 'QUALITY_CHECK', 'COMPLETED', 'REJECTED', 'SHIPPED') NOT NULL DEFAULT 'REQUESTED',
    MODIFY `collectionId` INTEGER NOT NULL,
    MODIFY `deliveryMethod` ENUM('PICKUP', 'CARGO', 'COURIER') NOT NULL DEFAULT 'CARGO';

-- AlterTable
ALTER TABLE `Workshop` DROP COLUMN `type`,
    ADD COLUMN `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `ownerId` INTEGER NOT NULL,
    ADD COLUMN `updatedAt` DATETIME(3) NOT NULL,
    MODIFY `capacity` INTEGER NOT NULL DEFAULT 1;

-- DropTable
DROP TABLE `OrderProduction`;

-- DropTable
DROP TABLE `SampleProduction`;

-- CreateIndex
CREATE UNIQUE INDEX `Collection_slug_key` ON `Collection`(`slug`);

-- CreateIndex
CREATE INDEX `ProductionRevision_productionTrackingId_createdAt_idx` ON `ProductionRevision`(`productionTrackingId`, `createdAt`);

-- CreateIndex
CREATE INDEX `ProductionStageUpdate_productionTrackingId_stage_idx` ON `ProductionStageUpdate`(`productionTrackingId`, `stage`);

-- CreateIndex
CREATE INDEX `ProductionTracking_workshopId_idx` ON `ProductionTracking`(`workshopId`);

-- CreateIndex
CREATE INDEX `ProductionTracking_startDate_idx` ON `ProductionTracking`(`startDate`);

-- CreateIndex
CREATE INDEX `QualityControl_productionTrackingId_testType_idx` ON `QualityControl`(`productionTrackingId`, `testType`);

-- CreateIndex
CREATE INDEX `QualityControl_result_testDate_idx` ON `QualityControl`(`result`, `testDate`);

-- CreateIndex
CREATE INDEX `Workshop_isActive_idx` ON `Workshop`(`isActive`);

-- AddForeignKey
ALTER TABLE `Category` ADD CONSTRAINT `Category_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Collection` ADD CONSTRAINT `Collection_categoryId_fkey` FOREIGN KEY (`categoryId`) REFERENCES `Category`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Collection` ADD CONSTRAINT `Collection_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Sample` ADD CONSTRAINT `Sample_collectionId_fkey` FOREIGN KEY (`collectionId`) REFERENCES `Collection`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ProductionTracking` ADD CONSTRAINT `ProductionTracking_orderId_fkey` FOREIGN KEY (`orderId`) REFERENCES `Order`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ProductionTracking` ADD CONSTRAINT `ProductionTracking_sampleId_fkey` FOREIGN KEY (`sampleId`) REFERENCES `Sample`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ProductionTracking` ADD CONSTRAINT `ProductionTracking_collectionId_fkey` FOREIGN KEY (`collectionId`) REFERENCES `Collection`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ProductionTracking` ADD CONSTRAINT `ProductionTracking_workshopId_fkey` FOREIGN KEY (`workshopId`) REFERENCES `Workshop`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Workshop` ADD CONSTRAINT `Workshop_ownerId_fkey` FOREIGN KEY (`ownerId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ProductionStageUpdate` ADD CONSTRAINT `ProductionStageUpdate_productionTrackingId_fkey` FOREIGN KEY (`productionTrackingId`) REFERENCES `ProductionTracking`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ProductionRevision` ADD CONSTRAINT `ProductionRevision_productionTrackingId_fkey` FOREIGN KEY (`productionTrackingId`) REFERENCES `ProductionTracking`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `QualityControl` ADD CONSTRAINT `QualityControl_productionTrackingId_fkey` FOREIGN KEY (`productionTrackingId`) REFERENCES `ProductionTracking`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
