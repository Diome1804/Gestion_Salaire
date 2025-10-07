import prisma from "../config/prisma.js";
export class SalaryCalculatorService {
    /**
     * Récupère les tarifs effectifs pour un employé
     * Priorité : tarifs personnalisés de l'employé > tarifs de l'entreprise
     */
    async getEffectiveRates(employeeId) {
        const employee = await prisma.employee.findUnique({
            where: { id: employeeId },
            include: { company: true }
        });
        if (!employee) {
            throw new Error('Employé non trouvé');
        }
        return {
            hourlyRate: employee.customHourlyRate || employee.company.hourlyRate,
            dailyRate: employee.customDailyRate || employee.company.dailyRate,
            overtimeRate: employee.customOvertimeRate || employee.company.overtimeRate
        };
    }
    /**
     * Calcule le salaire pour une période donnée
     */
    async calculateSalary(employeeId, startDate, endDate) {
        const rates = await this.getEffectiveRates(employeeId);
        const attendances = await prisma.attendance.findMany({
            where: {
                employeeId,
                date: { gte: startDate, lte: endDate }
            }
        });
        let totalSalary = 0;
        for (const attendance of attendances) {
            if (attendance.hoursWorked > 0) {
                const regularHours = Math.min(attendance.hoursWorked, 8); // 8h = journée normale
                const overtimeHours = Math.max(attendance.hoursWorked - 8, 0);
                totalSalary += (regularHours * rates.hourlyRate) + (overtimeHours * rates.hourlyRate * rates.overtimeRate);
            }
        }
        return totalSalary;
    }
    /**
     * Calcule la ventilation salariale pour une journée spécifique
     */
    calculateDailySalaryBreakdown(hoursWorked, rates) {
        const regularHours = Math.min(hoursWorked, 8);
        const overtimeHours = Math.max(hoursWorked - 8, 0);
        const regularSalary = regularHours * rates.hourlyRate;
        const overtimeSalary = overtimeHours * rates.hourlyRate * rates.overtimeRate;
        const totalSalary = regularSalary + overtimeSalary;
        return {
            regularHours,
            overtimeHours,
            regularSalary,
            overtimeSalary,
            totalSalary
        };
    }
    /**
     * Met à jour les tarifs d'une entreprise
     */
    async updateCompanyRates(companyId, rates) {
        await prisma.company.update({
            where: { id: companyId },
            data: {
                ...(rates.hourlyRate !== undefined && { hourlyRate: rates.hourlyRate }),
                ...(rates.dailyRate !== undefined && { dailyRate: rates.dailyRate }),
                ...(rates.overtimeRate !== undefined && { overtimeRate: rates.overtimeRate })
            }
        });
    }
    /**
     * Met à jour les tarifs personnalisés d'un employé
     */
    async updateEmployeeRates(employeeId, rates) {
        await prisma.employee.update({
            where: { id: employeeId },
            data: {
                ...(rates.hourlyRate !== undefined && { customHourlyRate: rates.hourlyRate }),
                ...(rates.dailyRate !== undefined && { customDailyRate: rates.dailyRate }),
                ...(rates.overtimeRate !== undefined && { customOvertimeRate: rates.overtimeRate })
            }
        });
    }
    /**
     * Récupère tous les tarifs (entreprise + employé) pour un employé
     */
    async getAllRates(employeeId) {
        const employee = await prisma.employee.findUnique({
            where: { id: employeeId },
            include: { company: true }
        });
        if (!employee) {
            throw new Error('Employé non trouvé');
        }
        const companyRates = {
            hourlyRate: employee.company.hourlyRate,
            dailyRate: employee.company.dailyRate,
            overtimeRate: employee.company.overtimeRate
        };
        const employeeRates = {
            ...(employee.customHourlyRate !== null && { hourlyRate: employee.customHourlyRate }),
            ...(employee.customDailyRate !== null && { dailyRate: employee.customDailyRate }),
            ...(employee.customOvertimeRate !== null && { overtimeRate: employee.customOvertimeRate })
        };
        const effectiveRates = {
            hourlyRate: employee.customHourlyRate || employee.company.hourlyRate,
            dailyRate: employee.customDailyRate || employee.company.dailyRate,
            overtimeRate: employee.customOvertimeRate || employee.company.overtimeRate
        };
        return {
            companyRates,
            employeeRates,
            effectiveRates
        };
    }
}
//# sourceMappingURL=salaryCalculatorService.js.map