import type { Company, PeriodType } from "@prisma/client";

export interface ICompanyRepository {
  create(data: { name: string; logo?: string | null; address: string; currency: string; periodType: PeriodType }): Promise<Company>;
  findById(id: number): Promise<Company | null>;
  update(id: number, data: { name?: string; logo?: string | null; address?: string; currency?: string; periodType?: PeriodType; allowImpersonation?: boolean }): Promise<Company>;
  delete(id: number): Promise<void>;
  findAll(): Promise<Company[]>;
}
