-- AlterTable
ALTER TABLE `Order` ADD COLUMN `currency` ENUM('USD', 'EUR', 'TRY', 'GBP') NOT NULL DEFAULT 'USD',
    ADD COLUMN `incoterm` ENUM('EXW', 'FCA', 'CPT', 'CIP', 'DAP', 'DPU', 'DDP', 'FAS', 'FOB', 'CFR', 'CIF') NULL,
    ADD COLUMN `targetDeadline` DATETIME(3) NULL;
