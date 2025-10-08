import type { PayRun as PayRunModel, PayRunStatus, PeriodType } from "@prisma/client";
import type { IPayRunService } from "./IPayRunService.js";
import type { IPayRunRepository } from "../repositories/IPayRunRepository.js";
import type { IEmployeeRepository } from "../repositories/IEmployeeRepository.js";
import prisma from "../config/prisma.js";

export class PayRunService implements IPayRunService {
  constructor(
    private payRunRepository: IPayRunRepository,
    private employeeRepository: IEmployeeRepository
  ) {}

  async createPayRun(data: {
    companyId: number;
    periodType: PeriodType;
    startDate?: Date;
    endDate?: Date;
    createdBy: number;
  }): Promise<PayRunModel> {
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

  async updatePayRun(id: number, data: Partial<{
    name: string;
    status: PayRunStatus;
  }>): Promise<PayRunModel> {
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

    const updateData: any = { ...data };

    // Set timestamps for status changes
    if (data.status === 'APPROVED') {
      updateData.approvedAt = new Date();
    } else if (data.status === 'CLOSED') {
      updateData.closedAt = new Date();
    }

    return this.payRunRepository.update(id, updateData);
  }

  async getPayRunById(id: number): Promise<PayRunModel | null> {
    return this.payRunRepository.findById(id);
  }

  async getAllPayRuns(filters?: {
    companyId?: number;
    status?: PayRunStatus;
    periodType?: PeriodType;
  }): Promise<PayRunModel[]> {
    return this.payRunRepository.findAll(filters);
  }

  async deletePayRun(id: number): Promise<void> {
    const payRun = await this.payRunRepository.findById(id);
    if (!payRun) {
      throw new Error("Cycle de paie non trouvé");
    }

    if (payRun.status !== 'DRAFT') {
      throw new Error("Seul un brouillon peut être supprimé");
    }

    await this.payRunRepository.delete(id);
  }

  async approvePayRun(id: number): Promise<PayRunModel> {
    return this.updatePayRun(id, { status: 'APPROVED' });
  }

  async closePayRun(id: number): Promise<PayRunModel> {
    return this.updatePayRun(id, { status: 'CLOSED' });
  }

  private calculatePeriodDates(periodType: PeriodType, startDate?: Date): { startDate: Date; endDate: Date } {
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

  private async generatePayslipsForPayRun(
    payRunId: number,
    companyId: number,
    startDate: Date,
    endDate: Date,
    periodType: PeriodType
  ): Promise<void> {
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

  private async calculatePayslipData(employee: any, startDate: Date, endDate: Date, periodType: PeriodType): Promise<{
    gross: number;
    deductions: any[];
    totalDeductions: number;
    net: number;
  }> {
    let gross = 0;

    // Calculate gross based on contract type
    switch (employee.contractType) {
      case 'FIXED':
        gross = employee.rateOrSalary;
        break;

      case 'DAILY':
        // For daily workers: 3000 FCFA per day worked
        const attendanceDays = await this.calculateAttendanceDays(employee.id, startDate, endDate);
        gross = 3000 * attendanceDays;
        break;

      case 'FREELANCE':
        gross = employee.rateOrSalary;
        break;

      case 'HONORAIRE':
        // For HONORAIRE workers: 1000 FCFA per day worked
        const honoraireDays = await this.calculateAttendanceDays(employee.id, startDate, endDate);
        gross = 1000 * honoraireDays;
        break;

      default:
        gross = 0;
    }

    // For now, no deductions - this can be extended with business rules
    const deductions: any[] = [];
    const totalDeductions = 0;
    const net = gross - totalDeductions;

    return {
      gross,
      deductions,
      totalDeductions,
      net
    };
  }

  private async calculateAttendanceDays(employeeId: number, startDate: Date, endDate: Date): Promise<number> {
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

  private generatePayRunName(periodType: PeriodType, startDate: Date, endDate: Date): string {
    const options: Intl.DateTimeFormatOptions = {
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