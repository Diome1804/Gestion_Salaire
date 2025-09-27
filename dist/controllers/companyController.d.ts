import type { Request, Response } from "express";
import type { ICompanyController } from "./ICompanyController.js";
import type { ICompanyService } from "../services/ICompanyService.js";
import type { IFileUploadService } from "../services/IFileUploadService.js";
export declare class CompanyController implements ICompanyController {
    private companyService;
    private fileUploadService;
    constructor(companyService: ICompanyService, fileUploadService: IFileUploadService);
    createCompany(req: Request, res: Response): Promise<void>;
    getCompany(req: Request, res: Response): Promise<void>;
    updateCompany(req: Request, res: Response): Promise<void>;
    deleteCompany(req: Request, res: Response): Promise<void>;
    getAllCompanies(req: Request, res: Response): Promise<void>;
}
//# sourceMappingURL=companyController.d.ts.map