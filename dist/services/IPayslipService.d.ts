import type { Payslip as PayslipModel } from "@prisma/client";
export interface IPayslipService {
    getPayslipById(id: number): Promise<PayslipModel | null>;
    getPayslipsByPayRun(payRunId: number): Promise<PayslipModel[]>;
    getPayslipsByEmployee(employeeId: number): Promise<PayslipModel[]>;
    updatePayslip(id: number, data: {
        deductions?: Array<{
            label: string;
            amount: number;
        }>;
        notes?: string;
    }, userId: number): Promise<PayslipModel>;
    calculateNetSalary(grossSalary: number, deductions: Array<{
        label: string;
        amount: number;
    }>): {
        totalDeductions: number;
        netSalary: number;
    };
    canModifyPayslip(payslipId: number): Promise<boolean>;
}
//# sourceMappingURL=IPayslipService.d.ts.map