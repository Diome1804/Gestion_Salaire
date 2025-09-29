import type { PayRun as PayRunModel, PayRunStatus, PeriodType } from "@prisma/client";
import type { IPayRunService } from "./IPayRunService.js";
import type { IPayRunRepository } from "../repositories/IPayRunRepository.js";
import type { IEmployeeRepository } from "../repositories/IEmployeeRepository.js";
export declare class PayRunService implements IPayRunService {
    private payRunRepository;
    private employeeRepository;
    constructor(payRunRepository: IPayRunRepository, employeeRepository: IEmployeeRepository);
    createPayRun(data: {
        companyId: number;
        periodType: PeriodType;
        startDate?: Date;
        endDate?: Date;
        createdBy: number;
    }): Promise<PayRunModel>;
    updatePayRun(id: number, data: Partial<{
        name: string;
        status: PayRunStatus;
    }>): Promise<PayRunModel>;
    getPayRunById(id: number): Promise<PayRunModel | null>;
    getAllPayRuns(filters?: {
        companyId?: number;
        status?: PayRunStatus;
        periodType?: PeriodType;
    }): Promise<PayRunModel[]>;
    deletePayRun(id: number): Promise<void>;
    approvePayRun(id: number): Promise<PayRunModel>;
    closePayRun(id: number): Promise<PayRunModel>;
    private calculatePeriodDates;
    private generatePayslipsForPayRun;
    private calculatePayslipData;
    private calculateAttendanceDays;
    private generatePayRunName;
}
//# sourceMappingURL=payRunService.d.ts.map