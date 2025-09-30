import type { Request, Response } from "express";
import type { IPaymentController } from "./IPaymentController.js";
import type { IPaymentService } from "../services/IPaymentService.js";

export class PaymentController implements IPaymentController {
  constructor(private paymentService: IPaymentService) {}

  async getPaymentById(req: Request, res: Response): Promise<void> {
    try {
      if (!req.params.id) {
        res.status(400).json({ error: "ID manquant" });
        return;
      }
      const id = parseInt(req.params.id);
      const userId = (req as any).user.id;

      const payment = await this.paymentService.getPaymentById(id, userId);
      res.json(payment);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async getPaymentsByPayslip(req: Request, res: Response): Promise<void> {
    try {
      if (!req.params.payslipId) {
        res.status(400).json({ error: "ID du bulletin manquant" });
        return;
      }
      const payslipId = parseInt(req.params.payslipId);
      const userId = (req as any).user.id;

      const payments = await this.paymentService.getPaymentsByPayslip(payslipId, userId);
      res.json(payments);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async getPaymentsByCompany(req: Request, res: Response): Promise<void> {
    try {
      if (!req.params.companyId) {
        res.status(400).json({ error: "ID de l'entreprise manquant" });
        return;
      }
      const companyId = parseInt(req.params.companyId);
      const startDate = req.query.startDate ? new Date(req.query.startDate as string) : undefined;
      const endDate = req.query.endDate ? new Date(req.query.endDate as string) : undefined;

      const payments = await this.paymentService.getPaymentsByCompany(companyId, startDate, endDate);
      res.json(payments);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async createPayment(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user.id;
      const { payment, newStatus } = await this.paymentService.createPayment(req.body, userId);

      res.json({
        message: "Paiement enregistré avec succès",
        payment,
        newPayslipStatus: newStatus
      });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async updatePayment(req: Request, res: Response): Promise<void> {
    try {
      if (!req.params.id) {
        res.status(400).json({ error: "ID manquant" });
        return;
      }
      const id = parseInt(req.params.id);
      const userId = (req as any).user.id;

      const { payment, newStatus } = await this.paymentService.updatePayment(id, req.body, userId);

      res.json({
        message: "Paiement modifié avec succès",
        payment,
        newPayslipStatus: newStatus
      });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async deletePayment(req: Request, res: Response): Promise<void> {
    try {
      if (!req.params.id) {
        res.status(400).json({ error: "ID manquant" });
        return;
      }
      const id = parseInt(req.params.id);
      const userId = (req as any).user.id;

      const { newStatus } = await this.paymentService.deletePayment(id, userId);

      res.json({
        message: "Paiement supprimé avec succès",
        newPayslipStatus: newStatus
      });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async generatePaymentReceipt(req: Request, res: Response): Promise<void> {
    try {
      if (!req.params.paymentId) {
        res.status(400).json({ error: "ID du paiement manquant" });
        return;
      }
      const paymentId = parseInt(req.params.paymentId);
      const userId = (req as any).user.id;

      const pdfBuffer = await this.paymentService.generatePaymentReceipt(paymentId, userId);

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="recu-paiement-${paymentId}.pdf"`);
      res.send(pdfBuffer);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async generatePaymentList(req: Request, res: Response): Promise<void> {
    try {
      if (!req.params.companyId || !req.query.startDate || !req.query.endDate) {
        res.status(400).json({ error: "Paramètres manquants" });
        return;
      }
      const companyId = parseInt(req.params.companyId);
      const startDate = new Date(req.query.startDate as string);
      const endDate = new Date(req.query.endDate as string);

      const pdfBuffer = await this.paymentService.generatePaymentList(companyId, startDate, endDate);

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="liste-paiements-${companyId}.pdf"`);
      res.send(pdfBuffer);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async generatePayrollRegister(req: Request, res: Response): Promise<void> {
    try {
      if (!req.params.companyId || !req.params.payRunId) {
        res.status(400).json({ error: "Paramètres manquants" });
        return;
      }
      const companyId = parseInt(req.params.companyId);
      const payRunId = parseInt(req.params.payRunId);

      const pdfBuffer = await this.paymentService.generatePayrollRegister(companyId, payRunId);

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="registre-paie-${payRunId}.pdf"`);
      res.send(pdfBuffer);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }
}