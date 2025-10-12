/*
  Warnings:

  - A unique constraint covering the columns `[modelCode]` on the table `Collection` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE `Collection` ADD COLUMN `availableColors` JSON NULL,
    ADD COLUMN `availableMaterials` JSON NULL,
    ADD COLUMN `availableSizes` JSON NULL,
    ADD COLUMN `basePrice` DECIMAL(10, 2) NULL,
    ADD COLUMN `certifications` JSON NULL,
    ADD COLUMN `currency` ENUM('USD', 'EUR', 'TRY', 'GBP') NULL DEFAULT 'USD',
    ADD COLUMN `hasVariants` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `leadTimeDays` INTEGER NULL,
    ADD COLUMN `minOrderQuantity` INTEGER NULL DEFAULT 1,
    ADD COLUMN `modelCode` VARCHAR(191) NULL,
    ADD COLUMN `specifications` JSON NULL,
    ADD COLUMN `variantType` ENUM('SIZE', 'COLOR', 'MATERIAL', 'PATTERN', 'COMBINATION', 'CUSTOM') NULL;

-- CreateTable
CREATE TABLE `ProductVariant` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `variantCode` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NULL,
    `size` VARCHAR(191) NULL,
    `color` VARCHAR(191) NULL,
    `colorHex` VARCHAR(191) NULL,
    `material` VARCHAR(191) NULL,
    `pattern` VARCHAR(191) NULL,
    `price` DECIMAL(10, 2) NULL,
    `costPrice` DECIMAL(10, 2) NULL,
    `currency` ENUM('USD', 'EUR', 'TRY', 'GBP') NOT NULL DEFAULT 'USD',
    `stockQuantity` INTEGER NOT NULL DEFAULT 0,
    `reservedQuantity` INTEGER NOT NULL DEFAULT 0,
    `minOrderQuantity` INTEGER NOT NULL DEFAULT 1,
    `maxOrderQuantity` INTEGER NULL,
    `leadTimeDays` INTEGER NULL,
    `weight` DECIMAL(8, 3) NULL,
    `dimensions` JSON NULL,
    `packagingInfo` JSON NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `isAvailable` BOOLEAN NOT NULL DEFAULT true,
    `discontinuedAt` DATETIME(3) NULL,
    `seasonalAvailability` JSON NULL,
    `images` JSON NULL,
    `thumbnail` VARCHAR(191) NULL,
    `customAttributes` JSON NULL,
    `collectionId` INTEGER NOT NULL,
    `companyId` INTEGER NOT NULL,

    UNIQUE INDEX `ProductVariant_variantCode_key`(`variantCode`),
    INDEX `ProductVariant_collectionId_isActive_isAvailable_idx`(`collectionId`, `isActive`, `isAvailable`),
    UNIQUE INDEX `ProductVariant_collectionId_variantCode_key`(`collectionId`, `variantCode`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `SampleVariant` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `sampleId` INTEGER NOT NULL,
    `productVariantId` INTEGER NOT NULL,
    `quantity` INTEGER NOT NULL DEFAULT 1,
    `requestedColor` VARCHAR(191) NULL,
    `requestedSize` VARCHAR(191) NULL,
    `specialRequest` VARCHAR(191) NULL,
    `status` ENUM('REQUESTED', 'RECEIVED', 'IN_DESIGN', 'PATTERN_READY', 'IN_PRODUCTION', 'QUALITY_CHECK', 'COMPLETED', 'REJECTED', 'SHIPPED') NOT NULL DEFAULT 'REQUESTED',
    `completedAt` DATETIME(3) NULL,
    `unitPrice` DOUBLE NULL,
    `totalPrice` DOUBLE NULL,
    `companyId` INTEGER NOT NULL,

    UNIQUE INDEX `SampleVariant_sampleId_productVariantId_key`(`sampleId`, `productVariantId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `OrderItem` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `orderId` INTEGER NOT NULL,
    `productVariantId` INTEGER NOT NULL,
    `quantity` INTEGER NOT NULL,
    `unitPrice` DOUBLE NOT NULL,
    `totalPrice` DOUBLE NOT NULL,
    `discountPercent` DOUBLE NULL,
    `discountAmount` DOUBLE NULL,
    `finalPrice` DOUBLE NOT NULL,
    `itemNote` VARCHAR(191) NULL,
    `companyId` INTEGER NOT NULL,

    UNIQUE INDEX `OrderItem_orderId_productVariantId_key`(`orderId`, `productVariantId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE UNIQUE INDEX `Collection_modelCode_key` ON `Collection`(`modelCode`);

-- AddForeignKey
ALTER TABLE `ProductVariant` ADD CONSTRAINT `ProductVariant_collectionId_fkey` FOREIGN KEY (`collectionId`) REFERENCES `Collection`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ProductVariant` ADD CONSTRAINT `ProductVariant_companyId_fkey` FOREIGN KEY (`companyId`) REFERENCES `Company`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SampleVariant` ADD CONSTRAINT `SampleVariant_sampleId_fkey` FOREIGN KEY (`sampleId`) REFERENCES `Sample`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SampleVariant` ADD CONSTRAINT `SampleVariant_productVariantId_fkey` FOREIGN KEY (`productVariantId`) REFERENCES `ProductVariant`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SampleVariant` ADD CONSTRAINT `SampleVariant_companyId_fkey` FOREIGN KEY (`companyId`) REFERENCES `Company`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `OrderItem` ADD CONSTRAINT `OrderItem_orderId_fkey` FOREIGN KEY (`orderId`) REFERENCES `Order`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `OrderItem` ADD CONSTRAINT `OrderItem_productVariantId_fkey` FOREIGN KEY (`productVariantId`) REFERENCES `ProductVariant`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `OrderItem` ADD CONSTRAINT `OrderItem_companyId_fkey` FOREIGN KEY (`companyId`) REFERENCES `Company`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
