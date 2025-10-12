/*
  Warnings:

  - The values [REVISION] on the enum `Sample_sampleType` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterTable
ALTER TABLE `Sample` ADD COLUMN `accessories` VARCHAR(191) NULL,
    ADD COLUMN `category` ENUM('SHIRT', 'PANTS', 'KNITWEAR', 'DRESS', 'JACKET', 'SKIRT', 'BLOUSE') NULL,
    ADD COLUMN `collectionName` VARCHAR(191) NULL,
    ADD COLUMN `contactEmail` VARCHAR(191) NULL,
    ADD COLUMN `deliveryMethod` ENUM('CARGO', 'SHOWROOM') NOT NULL DEFAULT 'CARGO',
    ADD COLUMN `fabric` VARCHAR(191) NULL,
    ADD COLUMN `fabricColor` VARCHAR(191) NULL,
    ADD COLUMN `gender` ENUM('WOMEN', 'MEN', 'GIRLS', 'BOYS', 'UNISEX') NULL,
    ADD COLUMN `leadTimeDays` INTEGER NULL,
    ADD COLUMN `priorityReason` VARCHAR(191) NULL,
    ADD COLUMN `revisionCount` INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN `revisionDate` DATETIME(3) NULL,
    ADD COLUMN `sizeChartUrl` VARCHAR(191) NULL,
    ADD COLUMN `sizeOrPattern` VARCHAR(191) NULL,
    MODIFY `sampleType` ENUM('STANDARD', 'CUSTOM', 'CRITICAL_URGENT') NOT NULL DEFAULT 'STANDARD';

-- CreateTable
CREATE TABLE `ProductionTracking` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `orderId` INTEGER NOT NULL,
    `collectionId` INTEGER NOT NULL,
    `startDate` DATETIME(3) NOT NULL,
    `planningDays` INTEGER NOT NULL DEFAULT 0,
    `fabricDays` INTEGER NOT NULL DEFAULT 0,
    `cuttingDays` INTEGER NOT NULL DEFAULT 0,
    `sewingDays` INTEGER NOT NULL DEFAULT 0,
    `qualityDays` INTEGER NOT NULL DEFAULT 0,
    `packagingDays` INTEGER NOT NULL DEFAULT 0,
    `shippingDays` INTEGER NOT NULL DEFAULT 0,
    `currentStage` ENUM('PLANNING', 'FABRIC', 'CUTTING', 'SEWING', 'QUALITY', 'PACKAGING', 'SHIPPING') NOT NULL DEFAULT 'PLANNING',
    `overallStatus` ENUM('NOT_STARTED', 'IN_PROGRESS', 'COMPLETED', 'DELAYED', 'CANCELLED') NOT NULL DEFAULT 'IN_PROGRESS',
    `sewingWorkshopId` INTEGER NULL,
    `packagingWorkshopId` INTEGER NULL,

    INDEX `ProductionTracking_orderId_idx`(`orderId`),
    INDEX `ProductionTracking_currentStage_overallStatus_idx`(`currentStage`, `overallStatus`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Workshop` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `type` ENUM('SEWING', 'PACKAGING', 'FABRIC', 'CUTTING') NOT NULL,
    `capacity` INTEGER NULL,
    `location` VARCHAR(191) NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,

    UNIQUE INDEX `Workshop_name_key`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ProductionStageUpdate` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `productionId` INTEGER NOT NULL,
    `stage` ENUM('PLANNING', 'FABRIC', 'CUTTING', 'SEWING', 'QUALITY', 'PACKAGING', 'SHIPPING') NOT NULL,
    `status` ENUM('WAITING', 'IN_PROGRESS', 'COMPLETED', 'DELAYED', 'BLOCKED') NOT NULL DEFAULT 'IN_PROGRESS',
    `actualStartDate` DATETIME(3) NULL,
    `actualEndDate` DATETIME(3) NULL,
    `notes` VARCHAR(191) NULL,
    `photos` VARCHAR(191) NULL,
    `isRevision` BOOLEAN NOT NULL DEFAULT false,
    `extraDays` INTEGER NOT NULL DEFAULT 0,
    `updatedById` INTEGER NOT NULL,

    INDEX `ProductionStageUpdate_productionId_stage_idx`(`productionId`, `stage`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ProductionRevision` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `productionId` INTEGER NOT NULL,
    `oldDeadline` DATETIME(3) NOT NULL,
    `newDeadline` DATETIME(3) NOT NULL,
    `revisionReason` ENUM('FABRIC_DELAY', 'CAPACITY_ISSUE', 'QUALITY_PROBLEM', 'LOGISTICS_DELAY', 'OTHER') NOT NULL,
    `description` VARCHAR(191) NULL,
    `actionTaken` VARCHAR(191) NULL,
    `responsibleDept` ENUM('SEWING_WORKSHOP', 'FABRIC_WORKSHOP', 'FABRIC_SUPPLY', 'QUALITY_CONTROL', 'LOGISTICS') NOT NULL,
    `proofDocument` VARCHAR(191) NULL,
    `updatedById` INTEGER NOT NULL,

    INDEX `ProductionRevision_productionId_idx`(`productionId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `QualityControl` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `productionId` INTEGER NOT NULL,
    `testType` ENUM('FABRIC_QUALITY', 'SIZE_CHECK', 'COLOR_MATCH', 'SEWING_QUALITY', 'ACCESSORY_CHECK', 'GENERAL_APPEARANCE', 'PACKAGING_CHECK') NOT NULL,
    `errorRate` DOUBLE NOT NULL,
    `testResult` ENUM('PASSED', 'FAILED', 'CONDITIONAL_PASS') NOT NULL,
    `inspector` VARCHAR(191) NOT NULL,
    `testDate` DATETIME(3) NOT NULL,
    `notes` VARCHAR(191) NULL,
    `testReport` VARCHAR(191) NULL,

    INDEX `QualityControl_productionId_testType_idx`(`productionId`, `testType`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `ProductionTracking` ADD CONSTRAINT `ProductionTracking_orderId_fkey` FOREIGN KEY (`orderId`) REFERENCES `Order`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ProductionTracking` ADD CONSTRAINT `ProductionTracking_collectionId_fkey` FOREIGN KEY (`collectionId`) REFERENCES `Collection`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ProductionTracking` ADD CONSTRAINT `ProductionTracking_sewingWorkshopId_fkey` FOREIGN KEY (`sewingWorkshopId`) REFERENCES `Workshop`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ProductionTracking` ADD CONSTRAINT `ProductionTracking_packagingWorkshopId_fkey` FOREIGN KEY (`packagingWorkshopId`) REFERENCES `Workshop`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ProductionStageUpdate` ADD CONSTRAINT `ProductionStageUpdate_productionId_fkey` FOREIGN KEY (`productionId`) REFERENCES `ProductionTracking`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ProductionStageUpdate` ADD CONSTRAINT `ProductionStageUpdate_updatedById_fkey` FOREIGN KEY (`updatedById`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ProductionRevision` ADD CONSTRAINT `ProductionRevision_productionId_fkey` FOREIGN KEY (`productionId`) REFERENCES `ProductionTracking`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ProductionRevision` ADD CONSTRAINT `ProductionRevision_updatedById_fkey` FOREIGN KEY (`updatedById`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `QualityControl` ADD CONSTRAINT `QualityControl_productionId_fkey` FOREIGN KEY (`productionId`) REFERENCES `ProductionTracking`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
