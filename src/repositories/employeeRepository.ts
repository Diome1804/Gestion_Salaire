import prisma from "../config/prisma.js";
import type { Employee as EmployeeModel, ContractType } from "@prisma/client";
import type { IEmployeeRepository } from "./IEmployeeRepository.js";

export class EmployeeRepository implements IEmployeeRepository {

  async findById(id: number): Promise<EmployeeModel | null> {
    return prisma.employee.findUnique({ where: { id } });
  }

  async create(data: {
    fullName: string;
    position: string;
    contractType: ContractType;
    rateOrSalary: number;
    bankDetails?: string;
    companyId: number;
  }): Promise<EmployeeModel> {
    return prisma.employee.create({ data });
  }

  async update(id: number, data: Partial<{
    fullName: string;
    position: string;
    contractType: ContractType;
    rateOrSalary: number;
    bankDetails: string;
    isActive: boolean;
  }>): Promise<EmployeeModel> {
    return prisma.employee.update({ where: { id }, data });
  }

  async findAll(filters?: {
    companyId?: number;
    isActive?: boolean;
    position?: string;
    contractType?: ContractType;
  }): Promise<EmployeeModel[]> {
    const where: any = {};
    if (filters?.companyId) where.companyId = filters.companyId;
    if (filters?.isActive !== undefined) where.isActive = filters.isActive;
    if (filters?.position) where.position = { contains: filters.position };
    if (filters?.contractType) where.contractType = filters.contractType;
    return prisma.employee.findMany({ where, include: { company: true } });
  }

  async delete(id: number): Promise<void> {
    await prisma.employee.delete({ where: { id } });
  }

  async activate(id: number): Promise<EmployeeModel> {
    return prisma.employee.update({ where: { id }, data: { isActive: true } });
  }

  async deactivate(id: number): Promise<EmployeeModel> {
    return prisma.employee.update({ where: { id }, data: { isActive: false } });
  }
}
