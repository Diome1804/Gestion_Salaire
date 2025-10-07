import type { Request, Response } from "express";

export interface ICompanyController {
  createCompany(req: Request, res: Response): Promise<void>;
  getCompany(req: Request, res: Response): Promise<void>;
  updateCompany(req: Request, res: Response): Promise<void>;
  deleteCompany(req: Request, res: Response): Promise<void>;
  getAllCompanies(req: Request, res: Response): Promise<void>;
  toggleImpersonationPermission(req: Request, res: Response): Promise<void>;
  updateCompanyRates(req: Request, res: Response): Promise<void>;
  getCompanyRates(req: Request, res: Response): Promise<void>;
}
