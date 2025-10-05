import type { Company as CompanyModel, PeriodType } from "@prisma/client";

export interface ICompanyService {
  createCompany(data: { name: string; logo?: string | undefined; address: string; currency: string; periodType: PeriodType }): Promise<CompanyModel>;
  getCompanyById(id: number): Promise<CompanyModel | null>;
  updateCompany(id: number, data: Partial<{ name?: string | undefined; logo?: string | undefined; address?: string | undefined; currency?: string | undefined; periodType?: PeriodType | undefined; allowImpersonation?: boolean | undefined }>): Promise<CompanyModel>;
  deleteCompany(id: number): Promise<void>;
  getAllCompanies(): Promise<CompanyModel[]>;
}
