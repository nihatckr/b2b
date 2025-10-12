/*
  Warnings:

  - You are about to drop the column `userId` on the `Category` table. All the data in the column will be lost.
  - You are about to drop the column `availableColors` on the `Collection` table. All the data in the column will be lost.
  - You are about to drop the column `availableMaterials` on the `Collection` table. All the data in the column will be lost.
  - You are about to drop the column `availableSizes` on the `Collection` table. All the data in the column will be lost.
  - You are about to drop the column `basePrice` on the `Collection` table. All the data in the column will be lost.
  - You are about to drop the column `certifications` on the `Collection` table. All the data in the column will be lost.
  - You are about to drop the column `currency` on the `Collection` table. All the data in the column will be lost.
  - You are about to drop the column `hasVariants` on the `Collection` table. All the data in the column will be lost.
  - You are about to drop the column `leadTimeDays` on the `Collection` table. All the data in the column will be lost.
  - You are about to drop the column `minOrderQuantity` on the `Collection` table. All the data in the column will be lost.
  - You are about to drop the column `modelCode` on the `Collection` table. All the data in the column will be lost.
  - You are about to drop the column `priceRange` on the `Collection` table. All the data in the column will be lost.
  - You are about to drop the column `season` on the `Collection` table. All the data in the column will be lost.
  - You are about to drop the column `specifications` on the `Collection` table. All the data in the column will be lost.
  - You are about to drop the column `tags` on the `Collection` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `Collection` table. All the data in the column will be lost.
  - You are about to drop the column `variantType` on the `Collection` table. All the data in the column will be lost.
  - You are about to drop the column `viewCount` on the `Collection` table. All the data in the column will be lost.
  - You are about to drop the column `year` on the `Collection` table. All the data in the column will be lost.
  - You are about to drop the column `actualDelivery` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the column `advancePayment` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the column `estimatedDelivery` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the column `manufacturerNote` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the column `remainingBalance` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the column `actualCompletionDate` on the `Sample` table. All the data in the column will be lost.
  - You are about to drop the column `deliveryMethod` on the `Sample` table. All the data in the column will be lost.
  - You are about to drop the column `estimatedDays` on the `Sample` table. All the data in the column will be lost.
  - You are about to drop the column `images` on the `Sample` table. All the data in the column will be lost.
  - You are about to drop the column `isApproved` on the `Sample` table. All the data in the column will be lost.
  - You are about to drop the column `minimumQuantity` on the `Sample` table. All the data in the column will be lost.
  - You are about to drop the column `tags` on the `Sample` table. All the data in the column will be lost.
  - You are about to drop the column `unitPrice` on the `Sample` table. All the data in the column will be lost.
  - The values [RECEIVED,IN_DESIGN,PATTERN_READY,QUALITY_CHECK,COMPLETED] on the enum `SampleProduction_status` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `businessLicense` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `profilePicture` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `taxNumber` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `tokenVersion` on the `User` table. All the data in the column will be lost.
  - You are about to drop the `Company` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Message` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `OrderApproval` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `OrderDeadline` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `OrderItem` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `OrderNotification` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `OrderStageTracking` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ProductVariant` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ProductionRevision` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ProductionStageUpdate` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ProductionTracking` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `QualityControl` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `RevisionApproval` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `RevisionImpact` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `RevisionRequest` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `RevisionTimeline` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `SampleVariant` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Workshop` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[sku]` on the table `Collection` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[username]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `collectionId` to the `Question` table without a default value. This is not possible if the table is not empty.
  - Added the required column `collectionId` to the `Review` table without a default value. This is not possible if the table is not empty.
  - Made the column `sampleType` on table `Sample` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE `Category` DROP FOREIGN KEY `Category_userId_fkey`;

-- DropForeignKey
ALTER TABLE `Collection` DROP FOREIGN KEY `Collection_categoryId_fkey`;

-- DropForeignKey
ALTER TABLE `Collection` DROP FOREIGN KEY `Collection_companyId_fkey`;

-- DropForeignKey
ALTER TABLE `Collection` DROP FOREIGN KEY `Collection_userId_fkey`;

-- DropForeignKey
ALTER TABLE `Message` DROP FOREIGN KEY `Message_receiverId_fkey`;

-- DropForeignKey
ALTER TABLE `Message` DROP FOREIGN KEY `Message_relatedCollectionId_fkey`;

-- DropForeignKey
ALTER TABLE `Message` DROP FOREIGN KEY `Message_relatedOrderId_fkey`;

-- DropForeignKey
ALTER TABLE `Message` DROP FOREIGN KEY `Message_relatedSampleId_fkey`;

-- DropForeignKey
ALTER TABLE `Message` DROP FOREIGN KEY `Message_senderId_fkey`;

-- DropForeignKey
ALTER TABLE `Order` DROP FOREIGN KEY `Order_companyId_fkey`;

-- DropForeignKey
ALTER TABLE `OrderApproval` DROP FOREIGN KEY `OrderApproval_approverUserId_fkey`;

-- DropForeignKey
ALTER TABLE `OrderApproval` DROP FOREIGN KEY `OrderApproval_companyId_fkey`;

-- DropForeignKey
ALTER TABLE `OrderApproval` DROP FOREIGN KEY `OrderApproval_orderId_fkey`;

-- DropForeignKey
ALTER TABLE `OrderApproval` DROP FOREIGN KEY `OrderApproval_requesterUserId_fkey`;

-- DropForeignKey
ALTER TABLE `OrderApproval` DROP FOREIGN KEY `OrderApproval_stageTrackingId_fkey`;

-- DropForeignKey
ALTER TABLE `OrderDeadline` DROP FOREIGN KEY `OrderDeadline_companyId_fkey`;

-- DropForeignKey
ALTER TABLE `OrderDeadline` DROP FOREIGN KEY `OrderDeadline_orderId_fkey`;

-- DropForeignKey
ALTER TABLE `OrderItem` DROP FOREIGN KEY `OrderItem_companyId_fkey`;

-- DropForeignKey
ALTER TABLE `OrderItem` DROP FOREIGN KEY `OrderItem_orderId_fkey`;

-- DropForeignKey
ALTER TABLE `OrderItem` DROP FOREIGN KEY `OrderItem_productVariantId_fkey`;

-- DropForeignKey
ALTER TABLE `OrderNotification` DROP FOREIGN KEY `OrderNotification_companyId_fkey`;

-- DropForeignKey
ALTER TABLE `OrderNotification` DROP FOREIGN KEY `OrderNotification_orderId_fkey`;

-- DropForeignKey
ALTER TABLE `OrderNotification` DROP FOREIGN KEY `OrderNotification_recipientUserId_fkey`;

-- DropForeignKey
ALTER TABLE `OrderStageTracking` DROP FOREIGN KEY `OrderStageTracking_assignedToId_fkey`;

-- DropForeignKey
ALTER TABLE `OrderStageTracking` DROP FOREIGN KEY `OrderStageTracking_companyId_fkey`;

-- DropForeignKey
ALTER TABLE `OrderStageTracking` DROP FOREIGN KEY `OrderStageTracking_orderId_fkey`;

-- DropForeignKey
ALTER TABLE `ProductVariant` DROP FOREIGN KEY `ProductVariant_collectionId_fkey`;

-- DropForeignKey
ALTER TABLE `ProductVariant` DROP FOREIGN KEY `ProductVariant_companyId_fkey`;

-- DropForeignKey
ALTER TABLE `ProductionRevision` DROP FOREIGN KEY `ProductionRevision_productionTrackingId_fkey`;

-- DropForeignKey
ALTER TABLE `ProductionRevision` DROP FOREIGN KEY `ProductionRevision_updatedById_fkey`;

-- DropForeignKey
ALTER TABLE `ProductionStageUpdate` DROP FOREIGN KEY `ProductionStageUpdate_productionTrackingId_fkey`;

-- DropForeignKey
ALTER TABLE `ProductionStageUpdate` DROP FOREIGN KEY `ProductionStageUpdate_updatedById_fkey`;

-- DropForeignKey
ALTER TABLE `ProductionTracking` DROP FOREIGN KEY `ProductionTracking_collectionId_fkey`;

-- DropForeignKey
ALTER TABLE `ProductionTracking` DROP FOREIGN KEY `ProductionTracking_orderId_fkey`;

-- DropForeignKey
ALTER TABLE `ProductionTracking` DROP FOREIGN KEY `ProductionTracking_sampleId_fkey`;

-- DropForeignKey
ALTER TABLE `ProductionTracking` DROP FOREIGN KEY `ProductionTracking_workshopId_fkey`;

-- DropForeignKey
ALTER TABLE `QualityControl` DROP FOREIGN KEY `QualityControl_productionTrackingId_fkey`;

-- DropForeignKey
ALTER TABLE `RevisionApproval` DROP FOREIGN KEY `RevisionApproval_approverId_fkey`;

-- DropForeignKey
ALTER TABLE `RevisionApproval` DROP FOREIGN KEY `RevisionApproval_companyId_fkey`;

-- DropForeignKey
ALTER TABLE `RevisionApproval` DROP FOREIGN KEY `RevisionApproval_revisionRequestId_fkey`;

-- DropForeignKey
ALTER TABLE `RevisionImpact` DROP FOREIGN KEY `RevisionImpact_companyId_fkey`;

-- DropForeignKey
ALTER TABLE `RevisionImpact` DROP FOREIGN KEY `RevisionImpact_revisionRequestId_fkey`;

-- DropForeignKey
ALTER TABLE `RevisionRequest` DROP FOREIGN KEY `RevisionRequest_assignedToId_fkey`;

-- DropForeignKey
ALTER TABLE `RevisionRequest` DROP FOREIGN KEY `RevisionRequest_companyId_fkey`;

-- DropForeignKey
ALTER TABLE `RevisionRequest` DROP FOREIGN KEY `RevisionRequest_orderId_fkey`;

-- DropForeignKey
ALTER TABLE `RevisionRequest` DROP FOREIGN KEY `RevisionRequest_productionTrackingId_fkey`;

-- DropForeignKey
ALTER TABLE `RevisionRequest` DROP FOREIGN KEY `RevisionRequest_requestedById_fkey`;

-- DropForeignKey
ALTER TABLE `RevisionRequest` DROP FOREIGN KEY `RevisionRequest_sampleId_fkey`;

-- DropForeignKey
ALTER TABLE `RevisionTimeline` DROP FOREIGN KEY `RevisionTimeline_companyId_fkey`;

-- DropForeignKey
ALTER TABLE `RevisionTimeline` DROP FOREIGN KEY `RevisionTimeline_performedById_fkey`;

-- DropForeignKey
ALTER TABLE `RevisionTimeline` DROP FOREIGN KEY `RevisionTimeline_revisionRequestId_fkey`;

-- DropForeignKey
ALTER TABLE `Sample` DROP FOREIGN KEY `Sample_collectionId_fkey`;

-- DropForeignKey
ALTER TABLE `Sample` DROP FOREIGN KEY `Sample_companyId_fkey`;

-- DropForeignKey
ALTER TABLE `SampleVariant` DROP FOREIGN KEY `SampleVariant_companyId_fkey`;

-- DropForeignKey
ALTER TABLE `SampleVariant` DROP FOREIGN KEY `SampleVariant_productVariantId_fkey`;

-- DropForeignKey
ALTER TABLE `SampleVariant` DROP FOREIGN KEY `SampleVariant_sampleId_fkey`;

-- DropForeignKey
ALTER TABLE `User` DROP FOREIGN KEY `User_companyId_fkey`;

-- DropForeignKey
ALTER TABLE `Workshop` DROP FOREIGN KEY `Workshop_ownerId_fkey`;

-- DropIndex
DROP INDEX `Category_userId_fkey` ON `Category`;

-- DropIndex
DROP INDEX `Collection_categoryId_fkey` ON `Collection`;

-- DropIndex
DROP INDEX `Collection_companyId_fkey` ON `Collection`;

-- DropIndex
DROP INDEX `Collection_modelCode_key` ON `Collection`;

-- DropIndex
DROP INDEX `Collection_userId_fkey` ON `Collection`;

-- DropIndex
DROP INDEX `Order_companyId_fkey` ON `Order`;

-- DropIndex
DROP INDEX `Sample_collectionId_fkey` ON `Sample`;

-- DropIndex
DROP INDEX `Sample_companyId_fkey` ON `Sample`;

-- DropIndex
DROP INDEX `User_companyId_fkey` ON `User`;

-- AlterTable
ALTER TABLE `Category` DROP COLUMN `userId`,
    ADD COLUMN `authorId` INTEGER NULL,
    ADD COLUMN `companyId` INTEGER NULL;

-- AlterTable
ALTER TABLE `Collection` DROP COLUMN `availableColors`,
    DROP COLUMN `availableMaterials`,
    DROP COLUMN `availableSizes`,
    DROP COLUMN `basePrice`,
    DROP COLUMN `certifications`,
    DROP COLUMN `currency`,
    DROP COLUMN `hasVariants`,
    DROP COLUMN `leadTimeDays`,
    DROP COLUMN `minOrderQuantity`,
    DROP COLUMN `modelCode`,
    DROP COLUMN `priceRange`,
    DROP COLUMN `season`,
    DROP COLUMN `specifications`,
    DROP COLUMN `tags`,
    DROP COLUMN `userId`,
    DROP COLUMN `variantType`,
    DROP COLUMN `viewCount`,
    DROP COLUMN `year`,
    ADD COLUMN `authorId` INTEGER NULL,
    ADD COLUMN `price` DOUBLE NOT NULL DEFAULT 0.00,
    ADD COLUMN `sku` VARCHAR(191) NULL,
    ADD COLUMN `stock` INTEGER NOT NULL DEFAULT 0,
    MODIFY `images` VARCHAR(191) NULL,
    MODIFY `categoryId` INTEGER NULL,
    MODIFY `slug` VARCHAR(191) NULL,
    MODIFY `companyId` INTEGER NULL;

-- AlterTable
ALTER TABLE `Order` DROP COLUMN `actualDelivery`,
    DROP COLUMN `advancePayment`,
    DROP COLUMN `estimatedDelivery`,
    DROP COLUMN `manufacturerNote`,
    DROP COLUMN `remainingBalance`,
    ADD COLUMN `manufacturerResponse` VARCHAR(191) NULL,
    MODIFY `companyId` INTEGER NULL;

-- AlterTable
ALTER TABLE `Question` ADD COLUMN `collectionId` INTEGER NOT NULL,
    MODIFY `isPublic` BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE `Review` ADD COLUMN `collectionId` INTEGER NOT NULL,
    ADD COLUMN `isApproved` BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE `Sample` DROP COLUMN `actualCompletionDate`,
    DROP COLUMN `deliveryMethod`,
    DROP COLUMN `estimatedDays`,
    DROP COLUMN `images`,
    DROP COLUMN `isApproved`,
    DROP COLUMN `minimumQuantity`,
    DROP COLUMN `tags`,
    DROP COLUMN `unitPrice`,
    ADD COLUMN `actualProductionDate` DATETIME(3) NULL,
    ADD COLUMN `cargoTrackingNumber` VARCHAR(191) NULL,
    ADD COLUMN `customDesignImages` VARCHAR(191) NULL,
    ADD COLUMN `deliveryAddress` VARCHAR(191) NULL,
    ADD COLUMN `estimatedProductionDate` DATETIME(3) NULL,
    ADD COLUMN `originalCollectionId` INTEGER NULL,
    ADD COLUMN `productionDays` INTEGER NULL,
    ADD COLUMN `revisionRequests` VARCHAR(191) NULL,
    ADD COLUMN `shippingDate` DATETIME(3) NULL,
    MODIFY `sampleType` ENUM('STANDARD', 'REVISION', 'CUSTOM') NOT NULL DEFAULT 'STANDARD',
    MODIFY `status` ENUM('REQUESTED', 'REVIEWED', 'QUOTE_SENT', 'APPROVED', 'REJECTED', 'IN_PRODUCTION', 'PRODUCTION_COMPLETE', 'SHIPPED', 'DELIVERED') NOT NULL DEFAULT 'REQUESTED',
    MODIFY `collectionId` INTEGER NULL,
    MODIFY `companyId` INTEGER NULL;

-- AlterTable
ALTER TABLE `User` DROP COLUMN `businessLicense`,
    DROP COLUMN `profilePicture`,
    DROP COLUMN `taxNumber`,
    DROP COLUMN `tokenVersion`;

-- DropTable
DROP TABLE `Company`;

-- DropTable
DROP TABLE `Message`;

-- DropTable
DROP TABLE `OrderApproval`;

-- DropTable
DROP TABLE `OrderDeadline`;

-- DropTable
DROP TABLE `OrderItem`;

-- DropTable
DROP TABLE `OrderNotification`;

-- DropTable
DROP TABLE `OrderStageTracking`;

-- DropTable
DROP TABLE `ProductVariant`;

-- DropTable
DROP TABLE `ProductionRevision`;

-- DropTable
DROP TABLE `ProductionStageUpdate`;

-- DropTable
DROP TABLE `ProductionTracking`;

-- DropTable
DROP TABLE `QualityControl`;

-- DropTable
DROP TABLE `RevisionApproval`;

-- DropTable
DROP TABLE `RevisionImpact`;

-- DropTable
DROP TABLE `RevisionRequest`;

-- DropTable
DROP TABLE `RevisionTimeline`;

-- DropTable
DROP TABLE `SampleVariant`;

-- DropTable
DROP TABLE `Workshop`;

-- CreateTable
CREATE TABLE `companies` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `phone` VARCHAR(191) NULL,
    `address` VARCHAR(191) NULL,
    `website` VARCHAR(191) NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `companies_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `messages` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `content` VARCHAR(191) NOT NULL,
    `senderId` INTEGER NOT NULL,
    `receiver` VARCHAR(191) NULL,
    `isRead` BOOLEAN NOT NULL DEFAULT false,
    `type` VARCHAR(191) NOT NULL DEFAULT 'general',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `companyId` INTEGER NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `production_tracking` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `orderId` INTEGER NULL,
    `sampleId` INTEGER NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'pending',
    `stage` VARCHAR(191) NOT NULL DEFAULT 'preparation',
    `progress` INTEGER NOT NULL DEFAULT 0,
    `estimatedEnd` DATETIME(3) NULL,
    `actualEnd` DATETIME(3) NULL,
    `notes` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `companyId` INTEGER NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `revisions` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `orderId` INTEGER NULL,
    `sampleId` INTEGER NULL,
    `productionTrackingId` INTEGER NULL,
    `revisionNumber` INTEGER NOT NULL DEFAULT 1,
    `requestMessage` VARCHAR(191) NULL,
    `responseMessage` VARCHAR(191) NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'pending',
    `requestedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `completedAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `SampleProduction` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `status` ENUM('REQUESTED', 'REVIEWED', 'QUOTE_SENT', 'APPROVED', 'REJECTED', 'IN_PRODUCTION', 'PRODUCTION_COMPLETE', 'SHIPPED', 'DELIVERED') NOT NULL,
    `note` VARCHAR(191) NULL,
    `estimatedDays` INTEGER NULL,
    `actualDate` DATETIME(3) NULL,
    `sampleId` INTEGER NOT NULL,
    `updatedById` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `OrderProduction` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `status` ENUM('PENDING', 'REVIEWED', 'QUOTE_SENT', 'CONFIRMED', 'REJECTED', 'IN_PRODUCTION', 'PRODUCTION_COMPLETE', 'QUALITY_CHECK', 'SHIPPED', 'DELIVERED', 'CANCELLED') NOT NULL,
    `note` VARCHAR(191) NULL,
    `estimatedDays` INTEGER NULL,
    `actualDate` DATETIME(3) NULL,
    `orderId` INTEGER NOT NULL,
    `updatedById` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE UNIQUE INDEX `Collection_sku_key` ON `Collection`(`sku`);

-- CreateIndex
CREATE UNIQUE INDEX `User_username_key` ON `User`(`username`);

-- AddForeignKey
ALTER TABLE `messages` ADD CONSTRAINT `messages_senderId_fkey` FOREIGN KEY (`senderId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `messages` ADD CONSTRAINT `messages_companyId_fkey` FOREIGN KEY (`companyId`) REFERENCES `companies`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `production_tracking` ADD CONSTRAINT `production_tracking_orderId_fkey` FOREIGN KEY (`orderId`) REFERENCES `Order`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `production_tracking` ADD CONSTRAINT `production_tracking_sampleId_fkey` FOREIGN KEY (`sampleId`) REFERENCES `Sample`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `production_tracking` ADD CONSTRAINT `production_tracking_companyId_fkey` FOREIGN KEY (`companyId`) REFERENCES `companies`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `revisions` ADD CONSTRAINT `revisions_orderId_fkey` FOREIGN KEY (`orderId`) REFERENCES `Order`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `revisions` ADD CONSTRAINT `revisions_sampleId_fkey` FOREIGN KEY (`sampleId`) REFERENCES `Sample`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `revisions` ADD CONSTRAINT `revisions_productionTrackingId_fkey` FOREIGN KEY (`productionTrackingId`) REFERENCES `production_tracking`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `User` ADD CONSTRAINT `User_companyId_fkey` FOREIGN KEY (`companyId`) REFERENCES `companies`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Category` ADD CONSTRAINT `Category_authorId_fkey` FOREIGN KEY (`authorId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Category` ADD CONSTRAINT `Category_companyId_fkey` FOREIGN KEY (`companyId`) REFERENCES `companies`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Collection` ADD CONSTRAINT `Collection_categoryId_fkey` FOREIGN KEY (`categoryId`) REFERENCES `Category`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Collection` ADD CONSTRAINT `Collection_authorId_fkey` FOREIGN KEY (`authorId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Collection` ADD CONSTRAINT `Collection_companyId_fkey` FOREIGN KEY (`companyId`) REFERENCES `companies`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Sample` ADD CONSTRAINT `Sample_collectionId_fkey` FOREIGN KEY (`collectionId`) REFERENCES `Collection`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Sample` ADD CONSTRAINT `Sample_originalCollectionId_fkey` FOREIGN KEY (`originalCollectionId`) REFERENCES `Collection`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Sample` ADD CONSTRAINT `Sample_companyId_fkey` FOREIGN KEY (`companyId`) REFERENCES `companies`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SampleProduction` ADD CONSTRAINT `SampleProduction_sampleId_fkey` FOREIGN KEY (`sampleId`) REFERENCES `Sample`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SampleProduction` ADD CONSTRAINT `SampleProduction_updatedById_fkey` FOREIGN KEY (`updatedById`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Order` ADD CONSTRAINT `Order_companyId_fkey` FOREIGN KEY (`companyId`) REFERENCES `companies`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `OrderProduction` ADD CONSTRAINT `OrderProduction_orderId_fkey` FOREIGN KEY (`orderId`) REFERENCES `Order`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `OrderProduction` ADD CONSTRAINT `OrderProduction_updatedById_fkey` FOREIGN KEY (`updatedById`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Question` ADD CONSTRAINT `Question_collectionId_fkey` FOREIGN KEY (`collectionId`) REFERENCES `Collection`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Review` ADD CONSTRAINT `Review_collectionId_fkey` FOREIGN KEY (`collectionId`) REFERENCES `Collection`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
