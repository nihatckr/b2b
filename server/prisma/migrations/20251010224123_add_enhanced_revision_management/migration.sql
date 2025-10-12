-- CreateTable
CREATE TABLE `RevisionRequest` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `revisionNumber` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NOT NULL,
    `urgency` INTEGER NOT NULL DEFAULT 5,
    `revisionType` ENUM('DATE_CHANGE', 'QUANTITY_CHANGE', 'STAGE_UPDATE', 'QUALITY_ISSUE', 'OTHER') NOT NULL,
    `category` VARCHAR(191) NULL,
    `estimatedDays` INTEGER NULL,
    `costImpact` DOUBLE NULL,
    `qualityImpact` VARCHAR(191) NULL,
    `deliveryImpact` DATETIME(3) NULL,
    `status` ENUM('NOT_STARTED', 'IN_PROGRESS', 'WAITING_APPROVAL', 'APPROVED', 'REJECTED', 'COMPLETED', 'CANCELLED', 'ON_HOLD') NOT NULL DEFAULT 'WAITING_APPROVAL',
    `approvalLevel` INTEGER NOT NULL DEFAULT 1,
    `totalApprovalLevels` INTEGER NOT NULL DEFAULT 3,
    `attachments` JSON NULL,
    `impactedStages` JSON NULL,
    `orderId` INTEGER NULL,
    `sampleId` INTEGER NULL,
    `productionTrackingId` INTEGER NULL,
    `requestedById` INTEGER NOT NULL,
    `assignedToId` INTEGER NULL,
    `companyId` INTEGER NOT NULL,

    UNIQUE INDEX `RevisionRequest_revisionNumber_key`(`revisionNumber`),
    INDEX `RevisionRequest_status_urgency_idx`(`status`, `urgency`),
    INDEX `RevisionRequest_revisionType_createdAt_idx`(`revisionType`, `createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `RevisionApproval` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `approvalLevel` INTEGER NOT NULL,
    `approvalType` VARCHAR(191) NOT NULL,
    `status` ENUM('NOT_STARTED', 'IN_PROGRESS', 'WAITING_APPROVAL', 'APPROVED', 'REJECTED', 'COMPLETED', 'CANCELLED', 'ON_HOLD') NOT NULL DEFAULT 'WAITING_APPROVAL',
    `approverId` INTEGER NOT NULL,
    `approvedAt` DATETIME(3) NULL,
    `decision` VARCHAR(191) NULL,
    `comments` VARCHAR(191) NULL,
    `conditions` VARCHAR(191) NULL,
    `revisionRequestId` INTEGER NOT NULL,
    `companyId` INTEGER NOT NULL,

    INDEX `RevisionApproval_status_approvalLevel_idx`(`status`, `approvalLevel`),
    UNIQUE INDEX `RevisionApproval_revisionRequestId_approvalLevel_approvalTyp_key`(`revisionRequestId`, `approvalLevel`, `approvalType`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `RevisionImpact` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `impactType` VARCHAR(191) NOT NULL,
    `impactLevel` INTEGER NOT NULL,
    `description` VARCHAR(191) NOT NULL,
    `beforeValue` VARCHAR(191) NULL,
    `afterValue` VARCHAR(191) NULL,
    `mitigationPlan` VARCHAR(191) NULL,
    `mitigationCost` DOUBLE NULL,
    `revisionRequestId` INTEGER NOT NULL,
    `companyId` INTEGER NOT NULL,

    INDEX `RevisionImpact_impactType_impactLevel_idx`(`impactType`, `impactLevel`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `RevisionTimeline` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `eventType` VARCHAR(191) NOT NULL,
    `eventDescription` VARCHAR(191) NOT NULL,
    `eventDate` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `performedById` INTEGER NOT NULL,
    `notes` VARCHAR(191) NULL,
    `revisionRequestId` INTEGER NOT NULL,
    `companyId` INTEGER NOT NULL,

    INDEX `RevisionTimeline_revisionRequestId_eventDate_idx`(`revisionRequestId`, `eventDate`),
    INDEX `RevisionTimeline_eventType_eventDate_idx`(`eventType`, `eventDate`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `RevisionRequest` ADD CONSTRAINT `RevisionRequest_orderId_fkey` FOREIGN KEY (`orderId`) REFERENCES `Order`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `RevisionRequest` ADD CONSTRAINT `RevisionRequest_sampleId_fkey` FOREIGN KEY (`sampleId`) REFERENCES `Sample`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `RevisionRequest` ADD CONSTRAINT `RevisionRequest_productionTrackingId_fkey` FOREIGN KEY (`productionTrackingId`) REFERENCES `ProductionTracking`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `RevisionRequest` ADD CONSTRAINT `RevisionRequest_requestedById_fkey` FOREIGN KEY (`requestedById`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `RevisionRequest` ADD CONSTRAINT `RevisionRequest_assignedToId_fkey` FOREIGN KEY (`assignedToId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `RevisionRequest` ADD CONSTRAINT `RevisionRequest_companyId_fkey` FOREIGN KEY (`companyId`) REFERENCES `Company`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `RevisionApproval` ADD CONSTRAINT `RevisionApproval_approverId_fkey` FOREIGN KEY (`approverId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `RevisionApproval` ADD CONSTRAINT `RevisionApproval_revisionRequestId_fkey` FOREIGN KEY (`revisionRequestId`) REFERENCES `RevisionRequest`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `RevisionApproval` ADD CONSTRAINT `RevisionApproval_companyId_fkey` FOREIGN KEY (`companyId`) REFERENCES `Company`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `RevisionImpact` ADD CONSTRAINT `RevisionImpact_revisionRequestId_fkey` FOREIGN KEY (`revisionRequestId`) REFERENCES `RevisionRequest`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `RevisionImpact` ADD CONSTRAINT `RevisionImpact_companyId_fkey` FOREIGN KEY (`companyId`) REFERENCES `Company`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `RevisionTimeline` ADD CONSTRAINT `RevisionTimeline_performedById_fkey` FOREIGN KEY (`performedById`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `RevisionTimeline` ADD CONSTRAINT `RevisionTimeline_revisionRequestId_fkey` FOREIGN KEY (`revisionRequestId`) REFERENCES `RevisionRequest`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `RevisionTimeline` ADD CONSTRAINT `RevisionTimeline_companyId_fkey` FOREIGN KEY (`companyId`) REFERENCES `Company`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
