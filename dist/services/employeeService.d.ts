import type { Employee as EmployeeModel, ContractType } from "@prisma/client";
import type { IEmployeeService } from "./IEmployeeService.js";
import type { IEmployeeRepository } from "../repositories/IEmployeeRepository.js";
export declare class EmployeeService implements IEmployeeService {
    private employeeRepository;
    constructor(employeeRepository: IEmployeeRepository);
    createEmployee(data: {
        fullName: string;
        position: string;
        contractType: ContractType;
        rateOrSalary: number;
        bankDetails?: string;
        email: string;
        matricule?: string;
        companyId: number;
    }): Promise<EmployeeModel>;
    updateEmployee(id: number, data: Partial<{
        fullName: string;
        position: string;
        contractType: ContractType;
        rateOrSalary: number;
        bankDetails: string;
        email: string;
        matricule: string;
    }>): Promise<EmployeeModel>;
    getAllEmployees(filters?: {
        companyId?: number;
        isActive?: boolean;
        position?: string;
        contractType?: ContractType;
    }): Promise<EmployeeModel[]>;
    getEmployeeById(id: number): Promise<EmployeeModel | null>;
    deleteEmployee(id: number): Promise<void>;
    activateEmployee(id: number): Promise<EmployeeModel>;
    deactivateEmployee(id: number): Promise<EmployeeModel>;
}
//# sourceMappingURL=employeeService.d.ts.map