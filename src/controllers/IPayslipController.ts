import type { Request, Response } from "express";

export interface IPayslipController {
  getPayslipById(req: Request, res: Response): Promise<void>;
  getPayslipsByPayRun(req: Request, res: Response): Promise<void>;
  getPayslipsByEmployee(req: Request, res: Response): Promise<void>;
  getPayslipsByCompany(req: Request, res: Response): Promise<void>;
  updatePayslip(req: Request, res: Response): Promise<void>;
  exportPayslipPDF(req: Request, res: Response): Promise<void>;
  exportPayRunPayslipsPDF(req: Request, res: Response): Promise<void>;
}
