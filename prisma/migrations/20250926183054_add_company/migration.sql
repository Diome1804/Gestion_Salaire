-- AlterTable
ALTER TABLE `Users` ADD COLUMN `companyId` INTEGER NULL;

-- CreateTable
CREATE TABLE `Company` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `logo` VARCHAR(191) NULL,
    `address` VARCHAR(191) NOT NULL,
    `currency` VARCHAR(191) NOT NULL,
    `periodType` ENUM('MONTHLY', 'WEEKLY', 'DAILY') NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Users` ADD CONSTRAINT `Users_companyId_fkey` FOREIGN KEY (`companyId`) REFERENCES `Company`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
