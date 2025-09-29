import type { Request, Response } from "express";
import type { IEmployeeController } from "./IEmployeeController.js";
import type { IEmployeeService } from "../services/IEmployeeService.js";
export declare class EmployeeController implements IEmployeeController {
    private employeeService;
    constructor(employeeService: IEmployeeService);
    createEmployee(req: Request, res: Response): Promise<void>;
    updateEmployee(req: Request, res: Response): Promise<void>;
    getAllEmployees(req: Request, res: Response): Promise<void>;
    getEmployeeById(req: Request, res: Response): Promise<void>;
    deleteEmployee(req: Request, res: Response): Promise<void>;
    activateEmployee(req: Request, res: Response): Promise<void>;
    deactivateEmployee(req: Request, res: Response): Promise<void>;
}
//# sourceMappingURL=employeeController.d.ts.map