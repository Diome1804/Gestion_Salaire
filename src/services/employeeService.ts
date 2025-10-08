import type { Employee as EmployeeModel, ContractType } from "@prisma/client";
import type { IEmployeeService } from "./IEmployeeService.js";
import type { IEmployeeRepository } from "../repositories/IEmployeeRepository.js";
import prisma from "../config/prisma.js";

export class EmployeeService implements IEmployeeService {
  constructor(private employeeRepository: IEmployeeRepository) {}

  async createEmployee(data: {
    fullName: string;
    position: string;
    contractType: ContractType;
    rateOrSalary: number;
    bankDetails?: string;
    email: string;
    matricule?: string;
    companyId: number;
  }): Promise<EmployeeModel> {
    // Validate email is provided
    if (!data.email || !data.email.trim()) {
      throw new Error("L'email est obligatoire pour tous les employés");
    }
    
    // For HONORAIRE employees, force rate to 1000 FCFA per day
    // For DAILY employees, force rate to 3000 FCFA per day
    if (data.contractType === 'HONORAIRE') {
      data.rateOrSalary = 1000;
    } else if (data.contractType === 'DAILY') {
      data.rateOrSalary = 3000;
    }
    
    return this.employeeRepository.create(data);
  }

  async updateEmployee(id: number, data: Partial<{
    fullName: string;
    position: string;
    contractType: ContractType;
    rateOrSalary: number;
    bankDetails: string;
    email: string;
    matricule: string;
  }>): Promise<EmployeeModel> {
    const employee = await this.employeeRepository.findById(id);
    if (!employee) throw new Error("Employé non trouvé");

    // For HONORAIRE employees, force rate to 1000 FCFA per day
    // For DAILY employees, force rate to 3000 FCFA per day
    if (data.contractType === 'HONORAIRE') {
      data.rateOrSalary = 1000;
    } else if (data.contractType === 'DAILY') {
      data.rateOrSalary = 3000;
    }

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