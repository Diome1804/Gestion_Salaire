import type { Payslip as PayslipModel, PayslipStatus } from "@prisma/client";
export interface IPayslipRepository {
    findById(id: number): Promise<PayslipModel | null>;
    findByPayRun(payRunId: number): Promise<PayslipModel[]>;
    findByEmployee(employeeId: number): Promise<PayslipModel[]>;
    update(id: number, data: Partial<{
        grossSalary: number;
        deductions: any[];
        totalDeductions: number;
        netSalary: number;
        paymentStatus: PayslipStatus;
        notes?: string;
    }>): Promise<PayslipModel>;
    updatePaymentStatus(id: number, status: PayslipStatus): Promise<void>;
    delete(id: number): Promise<void>;
}
//# sourceMappingURL=IPayslipRepository.d.ts.map