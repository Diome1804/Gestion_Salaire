import type { PayRun as PayRunModel, PayRunStatus, PeriodType } from "@prisma/client";

export interface IPayRunRepository {
  findById(id: number): Promise<PayRunModel | null>;
  create(data: {
    companyId: number;
    name: string;
    periodType: PeriodType;
    startDate: Date;
    endDate: Date;
    createdBy: number;
  }): Promise<PayRunModel>;
  update(id: number, data: Partial<{
    name: string;
    status: PayRunStatus;
    totalGross: number;
    totalDeductions: number;
    totalNet: number;
    approvedAt: Date;
    closedAt: Date;
  }>): Promise<PayRunModel>;
  findAll(filters?: {
    companyId?: number;
    status?: PayRunStatus;
    periodType?: PeriodType;
  }): Promise<PayRunModel[]>;
  delete(id: number): Promise<void>;
  findByCompanyAndPeriod(companyId: number, startDate: Date, endDate: Date): Promise<PayRunModel | null>;
}