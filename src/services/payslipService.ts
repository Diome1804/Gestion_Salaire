import type { Payslip as PayslipModel, PayslipStatus } from "@prisma/client";
import type { IPayslipService } from "./IPayslipService.js";
import type { IPayslipRepository } from "../repositories/IPayslipRepository.js";
import type { IPayRunService } from "./IPayRunService.js";

export class PayslipService implements IPayslipService {
  constructor(
    private payslipRepository: IPayslipRepository,
    private payRunService: IPayRunService
  ) {}

  async getPayslipById(id: number): Promise<PayslipModel | null> {
    return this.payslipRepository.findById(id);
  }

  async getPayslipsByPayRun(payRunId: number): Promise<PayslipModel[]> {
    return this.payslipRepository.findByPayRun(payRunId);
  }

  async getPayslipsByEmployee(employeeId: number): Promise<PayslipModel[]> {
    return this.payslipRepository.findByEmployee(employeeId);
  }

  async updatePayslip(id: number, data: {
    deductions?: Array<{label: string, amount: number}>;
    notes?: string;
  }, userId: number): Promise<PayslipModel> {
    // Vérifier que le bulletin peut être modifié
    const canModify = await this.canModifyPayslip(id);
    if (!canModify) {
      throw new Error("Ce bulletin ne peut pas être modifié (cycle approuvé ou clôturé)");
    }

    const payslip = await this.payslipRepository.findById(id);
    if (!payslip) {
      throw new Error("Bulletin de paie non trouvé");
    }

    // Calculer les nouvelles valeurs
    const deductions = data.deductions || [];
    const { totalDeductions, netSalary } = this.calculateNetSalary(payslip.grossSalary, deductions);

    // Mettre à jour le bulletin
    const updateData: any = {
      deductions: deductions as any,
      totalDeductions,
      netSalary
    };

    if (data.notes !== undefined) {
      updateData.notes = data.notes;
    }

    const updatedPayslip = await this.payslipRepository.update(id, updateData);

    // TODO: Recalculer les totaux du cycle de paie
    // await this.updatePayRunTotals(payslip.payRunId);

    return updatedPayslip;
  }

  calculateNetSalary(grossSalary: number, deductions: Array<{label: string, amount: number}>): {
    totalDeductions: number;
    netSalary: number;
  } {
    const totalDeductions = deductions.reduce((sum, deduction) => sum + deduction.amount, 0);
    const netSalary = grossSalary - totalDeductions;

    return {
      totalDeductions,
      netSalary: Math.max(0, netSalary) // Éviter les valeurs négatives
    };
  }

  async canModifyPayslip(payslipId: number): Promise<boolean> {
    const payslip = await this.payslipRepository.findById(payslipId);
    if (!payslip) return false;

    const payRun = await this.payRunService.getPayRunById(payslip.payRunId);
    if (!payRun) return false;

    // Seuls les cycles en DRAFT peuvent être modifiés
    return payRun.status === 'DRAFT';
  }
}