import type { Employee as EmployeeModel, ContractType } from "@prisma/client";
import type { IEmployeeService } from "./IEmployeeService.js";
import type { IEmployeeRepository } from "../repositories/IEmployeeRepository.js";
import prisma from "../config/prisma.js";

export class EmployeeService implements IEmployeeService {
  constructor(private employeeRepository: IEmployeeRepository) {}

  async createEmployee(data: {
    userId: number;
    fullName: string;
    position: string;
    contractType: ContractType;
    rateOrSalary: number;
    bankDetails?: string;
    companyId: number;
  }): Promise<EmployeeModel> {
    // Check if user exists and belongs to the company
    const user = await prisma.users.findUnique({ where: { id: data.userId } });
    if (!user) throw new Error("Utilisateur non trouvé");
    if (user.companyId !== data.companyId) throw new Error("L'utilisateur n'appartient pas à cette entreprise");

    // Check if employee already exists for this user
    const existing = await this.employeeRepository.findByUserId(data.userId);
    if (existing) throw new Error("Employé déjà créé pour cet utilisateur");

    return this.employeeRepository.create(data);
  }

  async updateEmployee(id: number, data: Partial<{
    fullName: string;
    position: string;
    contractType: ContractType;
    rateOrSalary: number;
    bankDetails: string;
  }>): Promise<EmployeeModel> {
    const employee = await this.employeeRepository.findById(id);
    if (!employee) throw new Error("Employé non trouvé");

    return this.employeeRepository.update(id, data);
  }

  async getAllEmployees(filters?: {
    companyId?: number;
    isActive?: boolean;
    position?: string;
    contractType?: ContractType;
  }): Promise<EmployeeModel[]> {
    return this.employeeRepository.findAll(filters);
  }

  async getEmployeeById(id: number): Promise<EmployeeModel | null> {
    return this.employeeRepository.findById(id);
  }

  async deleteEmployee(id: number): Promise<void> {
    const employee = await this.employeeRepository.findById(id);
    if (!employee) throw new Error("Employé non trouvé");

    await this.employeeRepository.delete(id);
  }

  async activateEmployee(id: number): Promise<EmployeeModel> {
    const employee = await this.employeeRepository.findById(id);
    if (!employee) throw new Error("Employé non trouvé");

    return this.employeeRepository.activate(id);
  }

  async deactivateEmployee(id: number): Promise<EmployeeModel> {
    const employee = await this.employeeRepository.findById(id);
    if (!employee) throw new Error("Employé non trouvé");

    return this.employeeRepository.deactivate(id);
  }
}
