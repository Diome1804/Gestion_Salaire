-- AlterTable
ALTER TABLE `Company` ADD COLUMN `dailyRate` DOUBLE NOT NULL DEFAULT 0,
    ADD COLUMN `hourlyRate` DOUBLE NOT NULL DEFAULT 0,
    ADD COLUMN `overtimeRate` DOUBLE NOT NULL DEFAULT 1.5;

-- AlterTable
ALTER TABLE `Employee` ADD COLUMN `customDailyRate` DOUBLE NULL,
    ADD COLUMN `customHourlyRate` DOUBLE NULL,
    ADD COLUMN `customOvertimeRate` DOUBLE NULL;
