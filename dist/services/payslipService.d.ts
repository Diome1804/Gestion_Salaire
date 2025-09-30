import type { Payslip as PayslipModel } from "@prisma/client";
import type { IPayslipService } from "./IPayslipService.js";
import type { IPayslipRepository } from "../repositories/IPayslipRepository.js";
import type { IPayRunService } from "./IPayRunService.js";
export declare class PayslipService implements IPayslipService {
    private payslipRepository;
    private payRunService;
    constructor(payslipRepository: IPayslipRepository, payRunService: IPayRunService);
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
//# sourceMappingURL=payslipService.d.ts.map