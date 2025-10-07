import type { Request, Response } from "express";

export interface IEmployeeController {
  createEmployee(req: Request, res: Response): Promise<void>;
  updateEmployee(req: Request, res: Response): Promise<void>;
  getAllEmployees(req: Request, res: Response): Promise<void>;
  getEmployeeById(req: Request, res: Response): Promise<void>;
  deleteEmployee(req: Request, res: Response): Promise<void>;
  activateEmployee(req: Request, res: Response): Promise<void>;
  deactivateEmployee(req: Request, res: Response): Promise<void>;
  generateQRCode(req: Request, res: Response): Promise<void>;
  getQRCode(req: Request, res: Response): Promise<void>;
  getQRCodeWithImage(req: Request, res: Response): Promise<void>;
  updateEmployeeRates(req: Request, res: Response): Promise<void>;
  getEmployeeRates(req: Request, res: Response): Promise<void>;
}
