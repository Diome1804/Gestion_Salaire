import type { Employee as EmployeeModel, ContractType } from "@prisma/client";
import type { IEmployeeRepository } from "./IEmployeeRepository.js";
export declare class EmployeeRepository implements IEmployeeRepository {
    findById(id: number): Promise<EmployeeModel | null>;
    findByUserId(userId: number): Promise<EmployeeModel | null>;
    create(data: {
        userId: number;
        fullName: string;
        position: string;
        contractType: ContractType;
        rateOrSalary: number;
        bankDetails?: string;
        companyId: number;
    }): Promise<EmployeeModel>;
    update(id: number, data: Partial<{
        fullName: string;
        position: string;
        contractType: ContractType;
        rateOrSalary: number;
        bankDetails: string;
        isActive: boolean;
    }>): Promise<EmployeeModel>;
    findAll(filters?: {
        companyId?: number;
        isActive?: boolean;
        position?: string;
        contractType?: ContractType;
    }): Promise<EmployeeModel[]>;
    delete(id: number): Promise<void>;
    activate(id: number): Promise<EmployeeModel>;
    deactivate(id: number): Promise<EmployeeModel>;
}
//# sourceMappingURL=employeeRepository.d.ts.map