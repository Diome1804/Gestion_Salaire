import type { Employee as EmployeeModel, ContractType } from "@prisma/client";
export interface IEmployeeService {
    createEmployee(data: {
        fullName: string;
        position: string;
        contractType: ContractType;
        rateOrSalary: number;
        bankDetails?: string;
        companyId: number;
    }): Promise<EmployeeModel>;
    updateEmployee(id: number, data: Partial<{
        fullName: string;
        position: string;
        contractType: ContractType;
        rateOrSalary: number;
        bankDetails: string;
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
//# sourceMappingURL=IEmployeeService.d.ts.map