import type { ICompanyService } from "./ICompanyService.js";
import type { ICompanyRepository } from "../repositories/ICompanyRepository.js";
import type { Company, PeriodType } from "@prisma/client";

export class CompanyService implements ICompanyService {

  constructor(private companyRepository: ICompanyRepository) {
    //
  }

  async createCompany(data: { logo?: string | undefined; address: string; currency: string; periodType: PeriodType }): Promise<Company> {
    const transformedData = {
      ...data,
      logo: data.logo ?? null,
    };
    return this.companyRepository.create(transformedData);
  }

  async getCompanyById(id: number): Promise<Company | null> {
    return this.companyRepository.findById(id);
  }

  async updateCompany(id: number, data: Partial<{ logo?: string | undefined; address?: string | undefined; currency?: string | undefined; periodType?: PeriodType | undefined }>): Promise<Company> {
    const transformedData: { logo?: string | null; address?: string; currency?: string; periodType?: PeriodType } = {};
    if (data.logo !== undefined) transformedData.logo = data.logo ?? null;
    if (data.address !== undefined) transformedData.address = data.address;
    if (data.currency !== undefined) transformedData.currency = data.currency;
    if (data.periodType !== undefined) transformedData.periodType = data.periodType;
    return this.companyRepository.update(id, transformedData);
  }

  async deleteCompany(id: number): Promise<void> {
    await this.companyRepository.delete(id);
  }

  async getAllCompanies(): Promise<Company[]> {
    return this.companyRepository.findAll();
  }
}
