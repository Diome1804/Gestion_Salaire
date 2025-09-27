import type { Request, Response } from "express";
import type { ICompanyController } from "./ICompanyController.js";
import type { ICompanyService } from "../services/ICompanyService.js";
export declare class CompanyController implements ICompanyController {
    private companyService;
    constructor(companyService: ICompanyService);
    createCompany(req: Request, res: Response): Promise<void>;
    getCompany(req: Request, res: Response): Promise<void>;
    updateCompany(req: Request, res: Response): Promise<void>;
    deleteCompany(req: Request, res: Response): Promise<void>;
    getAllCompanies(req: Request, res: Response): Promise<void>;
}
//# sourceMappingURL=companyController.d.ts.map