import type { Request, Response } from "express";
import type { IPayslipController } from "./IPayslipController.js";
import type { IPayslipService } from "../services/IPayslipService.js";
import { PDFService } from "../services/pdfService.js";
export declare class PayslipController implements IPayslipController {
    private payslipService;
    private pdfService;
    constructor(payslipService: IPayslipService, pdfService: PDFService);
    getPayslipById(req: Request, res: Response): Promise<void>;
    getPayslipsByPayRun(req: Request, res: Response): Promise<void>;
    getPayslipsByEmployee(req: Request, res: Response): Promise<void>;
    getPayslipsByCompany(req: Request, res: Response): Promise<void>;
    updatePayslip(req: Request, res: Response): Promise<void>;
    exportPayslipPDF(req: Request, res: Response): Promise<void>;
    exportPayRunPayslipsPDF(req: Request, res: Response): Promise<void>;
}
//# sourceMappingURL=payslipController.d.ts.map