import type { Request, Response } from "express";
import type { IPayslipController } from "./IPayslipController.js";
import type { IPayslipService } from "../services/IPayslipService.js";
import { PDFService, type PayslipPDFData } from "../services/pdfService.js";

export class PayslipController implements IPayslipController {
  constructor(
    private payslipService: IPayslipService,
    private pdfService: PDFService
  ) {}

  async getPayslipById(req: Request, res: Response): Promise<void> {
    try {
      if (!req.params.id) throw new Error("ID manquant");
      const id = parseInt(req.params.id);
      if (isNaN(id)) throw new Error("ID invalide");

      const payslip = await this.payslipService.getPayslipById(id);
      if (!payslip) {
        res.status(404).json({ error: "Bulletin de paie non trouvé" });
        return;
      }

      // TODO: Add company permission check for ADMIN role
      res.json(payslip);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async getPayslipsByPayRun(req: Request, res: Response): Promise<void> {
    try {
      if (!req.params.payRunId) throw new Error("ID du cycle manquant");
      const payRunId = parseInt(req.params.payRunId);
      if (isNaN(payRunId)) throw new Error("ID du cycle invalide");

      // TODO: Add company permission check for ADMIN role
      const payslips = await this.payslipService.getPayslipsByPayRun(payRunId);
      res.json(payslips);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async getPayslipsByEmployee(req: Request, res: Response): Promise<void> {
    try {
      if (!req.params.employeeId) throw new Error("ID de l'employé manquant");
      const employeeId = parseInt(req.params.employeeId);
      if (isNaN(employeeId)) throw new Error("ID de l'employé invalide");

      // TODO: Add company permission check for ADMIN role
      const payslips = await this.payslipService.getPayslipsByEmployee(employeeId);
      res.json(payslips);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async updatePayslip(req: Request, res: Response): Promise<void> {
    try {
      if (!req.params.id) throw new Error("ID manquant");
      const id = parseInt(req.params.id);
      if (isNaN(id)) throw new Error("ID invalide");

      const data = req.body;
      const caller = (req as any).user;

      // TODO: Add company permission check for ADMIN role
      const updatedPayslip = await this.payslipService.updatePayslip(id, data, caller.id);
      res.json({ message: "Bulletin de paie mis à jour", payslip: updatedPayslip });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async exportPayslipPDF(req: Request, res: Response): Promise<void> {
    try {
      if (!req.params.id) throw new Error("ID manquant");
      const id = parseInt(req.params.id);
      if (isNaN(id)) throw new Error("ID invalide");

      const payslip = await this.payslipService.getPayslipById(id);
      if (!payslip) throw new Error("Bulletin de paie non trouvé");

      // TODO: Add company permission check for ADMIN role

      // Pour l'instant, créer un PDF simple avec les données de base
      const pdfData: PayslipPDFData = {
        company: {
          name: "Entreprise Demo",
          address: "Adresse Demo",
          currency: "XOF"
        },
        employee: {
          fullName: `Employé ${payslip.employeeId}`,
          position: "Poste Demo",
          contractType: "FIXED"
        },
        payRun: {
          name: `Cycle ${payslip.payRunId}`,
          period: "01/09/2025 - 30/09/2025",
          startDate: new Date(),
          endDate: new Date()
        },
        grossSalary: payslip.grossSalary,
        deductions: Array.isArray(payslip.deductions) ? payslip.deductions as {label: string, amount: number}[] : [],
        totalDeductions: payslip.totalDeductions,
        netSalary: payslip.netSalary
      };

      const pdfBuffer = await this.pdfService.generatePayslipPDF(pdfData);

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="bulletin-${payslip.id}.pdf"`);
      res.send(pdfBuffer);
    } catch (error: any) {
      console.error('Erreur export PDF:', error);
      res.status(400).json({ error: error.message });
    }
  }

  async exportPayRunPayslipsPDF(req: Request, res: Response): Promise<void> {
    try {
      if (!req.params.payRunId) throw new Error("ID du cycle manquant");
      const payRunId = parseInt(req.params.payRunId);
      if (isNaN(payRunId)) throw new Error("ID du cycle invalide");

      // TODO: Add company permission check for ADMIN role
      // TODO: Implement bulk PDF generation
      res.status(501).json({ error: "Export PDF en lot en cours d'implémentation" });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }
}