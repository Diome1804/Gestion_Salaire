import type { Employee, ContractType } from "@prisma/client";

export interface IEmployeeService {
  createEmployee(data: {
    fullName: string;
    position: string;
    contractType: ContractType;
    rateOrSalary: number;
    bankDetails?: string;
    email?: string;
    matricule?: string;
    companyId: number;
  }): Promise<Employee>;

  updateEmployee(id: number, data: Partial<{
    fullName: string;
    position: string;
    contractType: ContractType;
    rateOrSalary: number;
    bankDetails: string;
    email: string;
    matricule: string;
  }>): Promise<Employee>;

  getAllEmployees(filters?: {
    companyId?: number;
    isActive?: boolean;
    position?: string;
    contractType?: ContractType;
  }): Promise<Employee[]>;

  getEmployeeById(id: number): Promise<Employee | null>;
  deleteEmployee(id: number): Promise<void>;
  activateEmployee(id: number): Promise<Employee>;
  deactivateEmployee(id: number): Promise<Employee>;
}