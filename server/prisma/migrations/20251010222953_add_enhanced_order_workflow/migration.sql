-- CreateTable
CREATE TABLE `OrderStageTracking` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `orderId` INTEGER NOT NULL,
    `stage` ENUM('INQUIRY', 'QUOTATION', 'NEGOTIATION', 'APPROVAL', 'PRODUCTION_PLANNING', 'PRODUCTION', 'QUALITY_CONTROL', 'PACKAGING', 'SHIPPING', 'COMPLETION') NOT NULL,
    `status` ENUM('NOT_STARTED', 'IN_PROGRESS', 'WAITING_APPROVAL', 'APPROVED', 'REJECTED', 'COMPLETED', 'CANCELLED', 'ON_HOLD') NOT NULL DEFAULT 'NOT_STARTED',
    `plannedStartDate` DATETIME(3) NULL,
    `plannedEndDate` DATETIME(3) NULL,
    `actualStartDate` DATETIME(3) NULL,
    `actualEndDate` DATETIME(3) NULL,
    `assignedToId` INTEGER NULL,
    `notes` VARCHAR(191) NULL,
    `priority` INTEGER NOT NULL DEFAULT 5,
    `companyId` INTEGER NOT NULL,

    INDEX `OrderStageTracking_status_plannedEndDate_idx`(`status`, `plannedEndDate`),
    UNIQUE INDEX `OrderStageTracking_orderId_stage_key`(`orderId`, `stage`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `OrderApproval` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `orderId` INTEGER NOT NULL,
    `stageTrackingId` INTEGER NULL,
    `approvalType` ENUM('CUSTOMER_APPROVAL', 'MANUFACTURER_APPROVAL', 'PRICE_APPROVAL', 'DESIGN_APPROVAL', 'SAMPLE_APPROVAL', 'PRODUCTION_APPROVAL', 'QUALITY_APPROVAL', 'SHIPPING_APPROVAL') NOT NULL,
    `status` ENUM('NOT_STARTED', 'IN_PROGRESS', 'WAITING_APPROVAL', 'APPROVED', 'REJECTED', 'COMPLETED', 'CANCELLED', 'ON_HOLD') NOT NULL DEFAULT 'WAITING_APPROVAL',
    `requesterUserId` INTEGER NOT NULL,
    `approverUserId` INTEGER NULL,
    `requestMessage` VARCHAR(191) NULL,
    `responseMessage` VARCHAR(191) NULL,
    `requestedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `respondedAt` DATETIME(3) NULL,
    `deadline` DATETIME(3) NULL,
    `metadata` JSON NULL,
    `companyId` INTEGER NOT NULL,

    INDEX `OrderApproval_status_deadline_idx`(`status`, `deadline`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `OrderNotification` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `readAt` DATETIME(3) NULL,
    `orderId` INTEGER NOT NULL,
    `type` ENUM('ORDER_CREATED', 'STATUS_CHANGED', 'APPROVAL_REQUIRED', 'APPROVAL_GIVEN', 'REJECTION_GIVEN', 'DEADLINE_APPROACHING', 'DEADLINE_PASSED', 'MESSAGE_RECEIVED', 'PAYMENT_REQUIRED', 'PRODUCTION_STARTED', 'QUALITY_ISSUE', 'SHIPPING_UPDATE') NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `message` VARCHAR(191) NOT NULL,
    `recipientUserId` INTEGER NOT NULL,
    `isRead` BOOLEAN NOT NULL DEFAULT false,
    `priority` INTEGER NOT NULL DEFAULT 5,
    `metadata` JSON NULL,
    `companyId` INTEGER NOT NULL,

    INDEX `OrderNotification_recipientUserId_isRead_createdAt_idx`(`recipientUserId`, `isRead`, `createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `OrderDeadline` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `orderId` INTEGER NOT NULL,
    `deadlineType` VARCHAR(191) NOT NULL,
    `deadlineDate` DATETIME(3) NOT NULL,
    `description` VARCHAR(191) NOT NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `isCompleted` BOOLEAN NOT NULL DEFAULT false,
    `completedAt` DATETIME(3) NULL,
    `warningDays` INTEGER NOT NULL DEFAULT 3,
    `isWarningTriggered` BOOLEAN NOT NULL DEFAULT false,
    `warningTriggeredAt` DATETIME(3) NULL,
    `companyId` INTEGER NOT NULL,

    INDEX `OrderDeadline_deadlineDate_isActive_isCompleted_idx`(`deadlineDate`, `isActive`, `isCompleted`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `OrderStageTracking` ADD CONSTRAINT `OrderStageTracking_orderId_fkey` FOREIGN KEY (`orderId`) REFERENCES `Order`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `OrderStageTracking` ADD CONSTRAINT `OrderStageTracking_assignedToId_fkey` FOREIGN KEY (`assignedToId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `OrderStageTracking` ADD CONSTRAINT `OrderStageTracking_companyId_fkey` FOREIGN KEY (`companyId`) REFERENCES `Company`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `OrderApproval` ADD CONSTRAINT `OrderApproval_orderId_fkey` FOREIGN KEY (`orderId`) REFERENCES `Order`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `OrderApproval` ADD CONSTRAINT `OrderApproval_stageTrackingId_fkey` FOREIGN KEY (`stageTrackingId`) REFERENCES `OrderStageTracking`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `OrderApproval` ADD CONSTRAINT `OrderApproval_requesterUserId_fkey` FOREIGN KEY (`requesterUserId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `OrderApproval` ADD CONSTRAINT `OrderApproval_approverUserId_fkey` FOREIGN KEY (`approverUserId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `OrderApproval` ADD CONSTRAINT `OrderApproval_companyId_fkey` FOREIGN KEY (`companyId`) REFERENCES `Company`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `OrderNotification` ADD CONSTRAINT `OrderNotification_orderId_fkey` FOREIGN KEY (`orderId`) REFERENCES `Order`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `OrderNotification` ADD CONSTRAINT `OrderNotification_recipientUserId_fkey` FOREIGN KEY (`recipientUserId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `OrderNotification` ADD CONSTRAINT `OrderNotification_companyId_fkey` FOREIGN KEY (`companyId`) REFERENCES `Company`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `OrderDeadline` ADD CONSTRAINT `OrderDeadline_orderId_fkey` FOREIGN KEY (`orderId`) REFERENCES `Order`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `OrderDeadline` ADD CONSTRAINT `OrderDeadline_companyId_fkey` FOREIGN KEY (`companyId`) REFERENCES `Company`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
