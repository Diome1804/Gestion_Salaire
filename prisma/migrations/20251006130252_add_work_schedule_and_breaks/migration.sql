-- DropForeignKey
ALTER TABLE `Users` DROP FOREIGN KEY `Users_companyId_fkey`;

-- DropIndex
DROP INDEX `Users_companyId_fkey` ON `Users`;

-- AlterTable
ALTER TABLE `Company` ADD COLUMN `allowImpersonation` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `name` VARCHAR(191) NOT NULL DEFAULT '';

-- AlterTable
ALTER TABLE `Users` ADD COLUMN `isTempPassword` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `prenom` VARCHAR(191) NULL,
    MODIFY `role` ENUM('SUPERADMIN', 'ADMIN', 'CAISSIER', 'VIGILE') NOT NULL DEFAULT 'SUPERADMIN';

-- CreateTable
CREATE TABLE `Employee` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `fullName` VARCHAR(191) NOT NULL,
    `position` VARCHAR(191) NOT NULL,
    `contractType` ENUM('DAILY', 'FIXED', 'FREELANCE', 'HONORAIRE') NOT NULL,
    `rateOrSalary` DOUBLE NOT NULL,
    `bankDetails` VARCHAR(191) NULL,
    `email` VARCHAR(191) NULL,
    `qrCode` VARCHAR(191) NULL,
    `matricule` VARCHAR(191) NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `companyId` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `Employee_qrCode_key`(`qrCode`),
    UNIQUE INDEX `Employee_matricule_key`(`matricule`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PayRun` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `companyId` INTEGER NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `periodType` ENUM('MONTHLY', 'WEEKLY', 'DAILY') NOT NULL,
    `startDate` DATETIME(3) NOT NULL,
    `endDate` DATETIME(3) NOT NULL,
    `status` ENUM('DRAFT', 'APPROVED', 'CLOSED') NOT NULL DEFAULT 'DRAFT',
    `totalGross` DOUBLE NOT NULL DEFAULT 0,
    `totalDeductions` DOUBLE NOT NULL DEFAULT 0,
    `totalNet` DOUBLE NOT NULL DEFAULT 0,
    `createdBy` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `approvedAt` DATETIME(3) NULL,
    `closedAt` DATETIME(3) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Payslip` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `payRunId` INTEGER NOT NULL,
    `employeeId` INTEGER NOT NULL,
    `grossSalary` DOUBLE NOT NULL,
    `deductions` JSON NOT NULL,
    `totalDeductions` DOUBLE NOT NULL DEFAULT 0,
    `netSalary` DOUBLE NOT NULL,
    `paymentStatus` ENUM('PENDING', 'PARTIAL', 'PAID') NOT NULL DEFAULT 'PENDING',
    `notes` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Payment` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `payslipId` INTEGER NOT NULL,
    `amount` DOUBLE NOT NULL,
    `paymentMethod` ENUM('CASH', 'BANK_TRANSFER', 'ORANGE_MONEY', 'WAVE', 'OTHER') NOT NULL,
    `reference` VARCHAR(191) NULL,
    `notes` VARCHAR(191) NULL,
    `paidAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `createdBy` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Attendance` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `employeeId` INTEGER NOT NULL,
    `payRunId` INTEGER NULL,
    `date` DATETIME(3) NOT NULL,
    `checkInTime` DATETIME(3) NULL,
    `checkOutTime` DATETIME(3) NULL,
    `hoursWorked` DOUBLE NOT NULL DEFAULT 0,
    `overtimeHours` DOUBLE NOT NULL DEFAULT 0,
    `isPresent` BOOLEAN NOT NULL DEFAULT false,
    `scannedBy` INTEGER NULL,
    `notes` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `WorkSchedule` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `employeeId` INTEGER NOT NULL,
    `dayOfWeek` INTEGER NOT NULL,
    `startTime` VARCHAR(191) NOT NULL,
    `endTime` VARCHAR(191) NOT NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Break` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `attendanceId` INTEGER NOT NULL,
    `startTime` DATETIME(3) NOT NULL,
    `endTime` DATETIME(3) NULL,
    `type` VARCHAR(191) NOT NULL DEFAULT 'break',
    `duration` DOUBLE NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Users` ADD CONSTRAINT `Users_companyId_fkey` FOREIGN KEY (`companyId`) REFERENCES `Company`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Employee` ADD CONSTRAINT `Employee_companyId_fkey` FOREIGN KEY (`companyId`) REFERENCES `Company`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PayRun` ADD CONSTRAINT `PayRun_companyId_fkey` FOREIGN KEY (`companyId`) REFERENCES `Company`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PayRun` ADD CONSTRAINT `PayRun_createdBy_fkey` FOREIGN KEY (`createdBy`) REFERENCES `Users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Payslip` ADD CONSTRAINT `Payslip_payRunId_fkey` FOREIGN KEY (`payRunId`) REFERENCES `PayRun`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Payslip` ADD CONSTRAINT `Payslip_employeeId_fkey` FOREIGN KEY (`employeeId`) REFERENCES `Employee`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Payment` ADD CONSTRAINT `Payment_payslipId_fkey` FOREIGN KEY (`payslipId`) REFERENCES `Payslip`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Payment` ADD CONSTRAINT `Payment_createdBy_fkey` FOREIGN KEY (`createdBy`) REFERENCES `Users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Attendance` ADD CONSTRAINT `Attendance_employeeId_fkey` FOREIGN KEY (`employeeId`) REFERENCES `Employee`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Attendance` ADD CONSTRAINT `Attendance_payRunId_fkey` FOREIGN KEY (`payRunId`) REFERENCES `PayRun`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Attendance` ADD CONSTRAINT `Attendance_scannedBy_fkey` FOREIGN KEY (`scannedBy`) REFERENCES `Users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `WorkSchedule` ADD CONSTRAINT `WorkSchedule_employeeId_fkey` FOREIGN KEY (`employeeId`) REFERENCES `Employee`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Break` ADD CONSTRAINT `Break_attendanceId_fkey` FOREIGN KEY (`attendanceId`) REFERENCES `Attendance`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
