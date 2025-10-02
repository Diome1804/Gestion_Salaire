import type { Payslip as PayslipModel, PayslipStatus } from "@prisma/client";
import type { IPayslipRepository } from "./IPayslipRepository.js";
export declare class PayslipRepository implements IPayslipRepository {
    findById(id: number): Promise<PayslipModel | null>;
    findByPayRun(payRunId: number): Promise<PayslipModel[]>;
    findByEmployee(employeeId: number): Promise<PayslipModel[]>;
    findByCompany(companyId: number): Promise<PayslipModel[]>;
    update(id: number, data: Partial<{
        grossSalary: number;
        deductions: any[];
        totalDeductions: number;
        netSalary: number;
        paymentStatus: PayslipStatus;
    }>): Promise<PayslipModel>;
    delete(id: number): Promise<void>;
    updatePaymentStatus(id: number, status: PayslipStatus): Promise<void>;
}
//# sourceMappingURL=payslipRepository.d.ts.map