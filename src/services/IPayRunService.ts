import type { PayRun as PayRunModel, PayRunStatus, PeriodType } from "@prisma/client";

export interface IPayRunService {
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
}