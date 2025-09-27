import type { ICompanyRepository } from "./ICompanyRepository.js";
import prisma from "../config/prisma.js";
import type { Company, PeriodType } from "@prisma/client";

export class CompanyRepository implements ICompanyRepository {
  
  async create(data: { logo?: string | null; address: string; currency: string; periodType: PeriodType }): Promise<Company> {
    return prisma.company.create({ data });
  }

  async findById(id: number): Promise<Company | null> {
    return prisma.company.findUnique({ where: { id } });
  }

  async update(id: number, data: { logo?: string | null; address?: string; currency?: string; periodType?: PeriodType }): Promise<Company> {
    return prisma.company.update({ where: { id }, data });
  }

  async delete(id: number): Promise<void> {
    await prisma.company.delete({ where: { id } });
  }

  async findAll(): Promise<Company[]> {
    return prisma.company.findMany();
  }
}
