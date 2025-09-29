import prisma from "../config/prisma.js";
export class PayRunService {
    payRunRepository;
    employeeRepository;
    constructor(payRunRepository, employeeRepository) {
        this.payRunRepository = payRunRepository;
        this.employeeRepository = employeeRepository;
    }
    async createPayRun(data) {
        // Calculate dates if not provided
        const { startDate, endDate } = this.calculatePeriodDates(data.periodType, data.startDate);
        // Generate name
        const name = this.generatePayRunName(data.periodType, startDate, endDate);
        // Check if payrun already exists for this period
        const existing = await this.payRunRepository.findByCompanyAndPeriod(data.companyId, startDate, endDate);
        if (existing) {
            throw new Error("Un cycle de paie existe déjà pour cette période");
        }
        // Create the payrun
        const payRun = await this.payRunRepository.create({
            companyId: data.companyId,
            name,
            periodType: data.periodType,
            startDate,
            endDate,
            createdBy: data.createdBy
        });
        // Generate payslips for all active employees
        await this.generatePayslipsForPayRun(payRun.id, data.companyId, startDate, endDate, data.periodType);
        return payRun;
    }
    async updatePayRun(id, data) {
        const payRun = await this.payRunRepository.findById(id);
        if (!payRun) {
            throw new Error("Cycle de paie non trouvé");
        }
        // Business rules for status changes
        if (data.status) {
            if (payRun.status === 'CLOSED') {
                throw new Error("Impossible de modifier un cycle clôturé");
            }
            if (data.status === 'APPROVED' && payRun.status !== 'DRAFT') {
                throw new Error("Seul un brouillon peut être approuvé");
            }
            if (data.status === 'CLOSED' && payRun.status !== 'APPROVED') {
                throw new Error("Seul un cycle approuvé peut être clôturé");
            }
        }
        const updateData = { ...data };
        // Set timestamps for status changes
        if (data.status === 'APPROVED') {
            updateData.approvedAt = new Date();
        }
        else if (data.status === 'CLOSED') {
            updateData.closedAt = new Date();
        }
        return this.payRunRepository.update(id, updateData);
    }
    async getPayRunById(id) {
        return this.payRunRepository.findById(id);
    }
    async getAllPayRuns(filters) {
        return this.payRunRepository.findAll(filters);
    }
    async deletePayRun(id) {
        const payRun = await this.payRunRepository.findById(id);
        if (!payRun) {
            throw new Error("Cycle de paie non trouvé");
        }
        if (payRun.status !== 'DRAFT') {
            throw new Error("Seul un brouillon peut être supprimé");
        }
        await this.payRunRepository.delete(id);
    }
    async approvePayRun(id) {
        return this.updatePayRun(id, { status: 'APPROVED' });
    }
    async closePayRun(id) {
        return this.updatePayRun(id, { status: 'CLOSED' });
    }
    calculatePeriodDates(periodType, startDate) {
        const now = startDate || new Date();
        switch (periodType) {
            case 'MONTHLY': {
                const start = new Date(now.getFullYear(), now.getMonth(), 1);
                const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
                return { startDate: start, endDate: end };
            }
            case 'WEEKLY': {
                const start = new Date(now);
                start.setDate(now.getDate() - now.getDay() + 1); // Monday
                const end = new Date(start);
                end.setDate(start.getDate() + 6); // Sunday
                return { startDate: start, endDate: end };
            }
            case 'DAILY': {
                const start = new Date(now);
                start.setHours(0, 0, 0, 0);
                const end = new Date(start);
                end.setHours(23, 59, 59, 999);
                return { startDate: start, endDate: end };
            }
            default:
                throw new Error("Type de période non supporté");
        }
    }
    async generatePayslipsForPayRun(payRunId, companyId, startDate, endDate, periodType) {
        // Get all active employees for the company
        const employees = await this.employeeRepository.findAll({
            companyId,
            isActive: true
        });
        let totalGross = 0;
        let totalDeductions = 0;
        let totalNet = 0;
        // Generate payslip for each employee
        for (const employee of employees) {
            const payslipData = await this.calculatePayslipData(employee, startDate, endDate, periodType);
            // Create payslip
            await prisma.payslip.create({
                data: {
                    payRunId,
                    employeeId: employee.id,
                    grossSalary: payslipData.gross,
                    deductions: payslipData.deductions,
                    totalDeductions: payslipData.totalDeductions,
                    netSalary: payslipData.net
                }
            });
            // Accumulate totals
            totalGross += payslipData.gross;
            totalDeductions += payslipData.totalDeductions;
            totalNet += payslipData.net;
        }
        // Update payrun totals
        await this.payRunRepository.update(payRunId, {
            totalGross,
            totalDeductions,
            totalNet
        });
    }
    async calculatePayslipData(employee, startDate, endDate, periodType) {
        let gross = 0;
        // Calculate gross based on contract type
        switch (employee.contractType) {
            case 'FIXED':
                gross = employee.rateOrSalary;
                break;
            case 'DAILY':
                // For daily workers, calculate based on attendance
                const attendanceDays = await this.calculateAttendanceDays(employee.id, startDate, endDate);
                gross = employee.rateOrSalary * attendanceDays;
                break;
            case 'FREELANCE':
                gross = employee.rateOrSalary;
                break;
            default:
                gross = 0;
        }
        // For now, no deductions - this can be extended with business rules
        const deductions = [];
        const totalDeductions = 0;
        const net = gross - totalDeductions;
        return {
            gross,
            deductions,
            totalDeductions,
            net
        };
    }
    async calculateAttendanceDays(employeeId, startDate, endDate) {
        // For daily workers, count present days in the period
        // This is a simplified version - in reality, you'd check attendance records
        const attendances = await prisma.attendance.findMany({
            where: {
                employeeId,
                date: {
                    gte: startDate,
                    lte: endDate
                },
                isPresent: true
            }
        });
        return attendances.length;
    }
    generatePayRunName(periodType, startDate, endDate) {
        const options = {
            year: 'numeric',
            month: 'long'
        };
        switch (periodType) {
            case 'MONTHLY':
                return `Paie ${startDate.toLocaleDateString('fr-FR', { year: 'numeric', month: 'long' })}`;
            case 'WEEKLY':
                return `Semaine ${startDate.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })} - ${endDate.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })}`;
            case 'DAILY':
                return `Journée ${startDate.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}`;
            default:
                return `Cycle ${periodType}`;
        }
    }
}
//# sourceMappingURL=payRunService.js.map