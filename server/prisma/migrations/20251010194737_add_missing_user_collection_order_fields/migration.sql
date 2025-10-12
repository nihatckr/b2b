-- AlterTable
ALTER TABLE `Collection` ADD COLUMN `priceRange` VARCHAR(191) NULL,
    ADD COLUMN `season` VARCHAR(191) NULL,
    ADD COLUMN `year` INTEGER NULL;

-- AlterTable
ALTER TABLE `Order` ADD COLUMN `actualDelivery` DATETIME(3) NULL,
    ADD COLUMN `advancePayment` DOUBLE NULL,
    ADD COLUMN `estimatedDelivery` DATETIME(3) NULL,
    ADD COLUMN `remainingBalance` DOUBLE NULL;

-- AlterTable
ALTER TABLE `User` ADD COLUMN `businessLicense` VARCHAR(191) NULL,
    ADD COLUMN `firstName` VARCHAR(191) NULL,
    ADD COLUMN `isActive` BOOLEAN NOT NULL DEFAULT true,
    ADD COLUMN `lastName` VARCHAR(191) NULL,
    ADD COLUMN `phone` VARCHAR(191) NULL,
    ADD COLUMN `profilePicture` VARCHAR(191) NULL,
    ADD COLUMN `taxNumber` VARCHAR(191) NULL,
    ADD COLUMN `username` VARCHAR(191) NULL;
