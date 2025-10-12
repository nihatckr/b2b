/*
  Warnings:

  - Added the required column `companyId` to the `Collection` table without a default value. This is not possible if the table is not empty.
  - Added the required column `companyId` to the `Order` table without a default value. This is not possible if the table is not empty.
  - Added the required column `companyId` to the `Sample` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `User` ADD COLUMN `companyId` INTEGER NULL;

-- CreateTable
CREATE TABLE `Company` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NULL,
    `website` VARCHAR(191) NULL,
    `address` VARCHAR(191) NULL,
    `phone` VARCHAR(191) NULL,
    `email` VARCHAR(191) NULL,
    `taxNumber` VARCHAR(191) NULL,
    `logo` VARCHAR(191) NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Create a default company for existing data
INSERT INTO `Company` (`id`, `name`, `description`, `createdAt`, `updatedAt`) 
VALUES (1, 'Default Company', 'Default company for existing data', NOW(), NOW());

-- Add companyId columns with default values
ALTER TABLE `Collection` ADD COLUMN `companyId` INTEGER NOT NULL DEFAULT 1;
ALTER TABLE `Order` ADD COLUMN `companyId` INTEGER NOT NULL DEFAULT 1;
ALTER TABLE `Sample` ADD COLUMN `companyId` INTEGER NOT NULL DEFAULT 1;

-- Remove default values after data migration
ALTER TABLE `Collection` ALTER COLUMN `companyId` DROP DEFAULT;
ALTER TABLE `Order` ALTER COLUMN `companyId` DROP DEFAULT;
ALTER TABLE `Sample` ALTER COLUMN `companyId` DROP DEFAULT;

-- AddForeignKey
ALTER TABLE `User` ADD CONSTRAINT `User_companyId_fkey` FOREIGN KEY (`companyId`) REFERENCES `Company`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Collection` ADD CONSTRAINT `Collection_companyId_fkey` FOREIGN KEY (`companyId`) REFERENCES `Company`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Sample` ADD CONSTRAINT `Sample_companyId_fkey` FOREIGN KEY (`companyId`) REFERENCES `Company`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Order` ADD CONSTRAINT `Order_companyId_fkey` FOREIGN KEY (`companyId`) REFERENCES `Company`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
