import type { Request, Response } from "express";
import type { IPayRunController } from "./IPayRunController.js";
import type { IPayRunService } from "../services/IPayRunService.js";
import type { IPayslipService } from "../services/IPayslipService.js";
import type { IEmailService } from "../services/IEmailService.js";

export class PayRunController implements IPayRunController {
  constructor(private payRunService: IPayRunService, private payslipService: IPayslipService, private emailService: IEmailService) {}

  async createPayRun(req: Request, res: Response): Promise<void> {
    try {
      const caller = (req as any).user;
      const data = {
        companyId: caller.role === "ADMIN" ? caller.companyId! : req.body.companyId,
        periodType: req.body.periodType,
        startDate: req.body.startDate ? new Date(req.body.startDate) : undefined,
        endDate: req.body.endDate ? new Date(req.body.endDate) : undefined,
        createdBy: caller.id
      };

      const payRun = await this.payRunService.createPayRun(data as any);

      // Send email notifications to employees (async)
      this.sendPayslipNotifications(payRun.id).catch(error => {
        console.error('Failed to send payslip notifications:', error);
      });

      res.status(201).json({ message: "Cycle de paie créé", payRun });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async getAllPayRuns(req: Request, res: Response): Promise<void> {
    try {
      const caller = (req as any).user;
      const filters: any = {};

      if (req.query.companyId) filters.companyId = parseInt(req.query.companyId as string);
      if (req.query.status) filters.status = req.query.status;
      if (req.query.periodType) filters.periodType = req.query.periodType;

      // Restrict to own company for ADMIN
      if (caller.role === "ADMIN") {
        filters.companyId = caller.companyId;
      }

      const payRuns = await this.payRunService.getAllPayRuns(filters);
      res.json(payRuns);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  async getPayRunById(req: Request, res: Response): Promise<void> {
    try {
      if (!req.params.id) throw new Error("ID manquant");
      const id = parseInt(req.params.id);
      if (isNaN(id)) throw new Error("ID invalide");

      const payRun = await this.payRunService.getPayRunById(id);
      if (!payRun) {
        res.status(404).json({ error: "Cycle de paie non trouvé" });
        return;
      }

      const caller = (req as any).user;
      if (caller.role === "ADMIN" && payRun.companyId !== caller.companyId) {
        res.status(403).json({ error: "Accès refusé" });
        return;
      }

      res.json(payRun);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  async updatePayRun(req: Request, res: Response): Promise<void> {
    try {
      if (!req.params.id) throw new Error("ID manquant");
      const id = parseInt(req.params.id);
      if (isNaN(id)) throw new Error("ID invalide");

      const caller = (req as any).user;
      const payRun = await this.payRunService.getPayRunById(id);
      if (!payRun) throw new Error("Cycle de paie non trouvé");

      if (caller.role === "ADMIN" && payRun.companyId !== caller.companyId) {
        throw new Error("Accès refusé");
      }

      const updateData = req.body;
      const updated = await this.payRunService.updatePayRun(id, updateData);
      res.json({ message: "Cycle de paie mis à jour", payRun: updated });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async approvePayRun(req: Request, res: Response): Promise<void> {
    try {
      if (!req.params.id) throw new Error("ID manquant");
      const id = parseInt(req.params.id);
      if (isNaN(id)) throw new Error("ID invalide");

      const caller = (req as any).user;
      const payRun = await this.payRunService.getPayRunById(id);
      if (!payRun) throw new Error("Cycle de paie non trouvé");

      if (caller.role === "ADMIN" && payRun.companyId !== caller.companyId) {
        throw new Error("Accès refusé");
      }

      const approved = await this.payRunService.approvePayRun(id);
      res.json({ message: "Cycle de paie approuvé", payRun: approved });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async closePayRun(req: Request, res: Response): Promise<void> {
    try {
      if (!req.params.id) throw new Error("ID manquant");
      const id = parseInt(req.params.id);
      if (isNaN(id)) throw new Error("ID invalide");

      const caller = (req as any).user;
      const payRun = await this.payRunService.getPayRunById(id);
      if (!payRun) throw new Error("Cycle de paie non trouvé");

      if (caller.role === "ADMIN" && payRun.companyId !== caller.companyId) {
        throw new Error("Accès refusé");
      }

      const closed = await this.payRunService.closePayRun(id);
      res.json({ message: "Cycle de paie clôturé", payRun: closed });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async deletePayRun(req: Request, res: Response): Promise<void> {
    try {
      if (!req.params.id) throw new Error("ID manquant");
      const id = parseInt(req.params.id);
      if (isNaN(id)) throw new Error("ID invalide");

      const caller = (req as any).user;
      const payRun = await this.payRunService.getPayRunById(id);
      if (!payRun) throw new Error("Cycle de paie non trouvé");

      if (caller.role === "ADMIN" && payRun.companyId !== caller.companyId) {
        throw new Error("Accès refusé");
      }

      // Only SUPERADMIN can delete
      if (caller.role !== "SUPERADMIN") {
        res.status(403).json({ error: "Accès refusé" });
        return;
      }

      await this.payRunService.deletePayRun(id);
      res.json({ message: "Cycle de paie supprimé" });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  private async sendPayslipNotifications(payRunId: number): Promise<void> {
    try {
      // Get payslips for this payrun with employee and company data
      const payslips = await this.payslipService.getPayslipsByPayRun(payRunId) as any[];

      for (const payslip of payslips) {
        if (payslip.employee?.email) {
          const subject = `Votre bulletin de paie - ${payslip.payRun?.name}`;
          const html = `
            <h1>Bulletin de Paie Disponible</h1>
            <p>Bonjour ${payslip.employee.fullName},</p>
            <p>Votre bulletin de paie pour la période ${payslip.payRun?.period || payslip.payRun?.name} est maintenant disponible.</p>
            <p><strong>Entreprise:</strong> ${payslip.payRun?.company?.name}</p>
            <p><strong>Salaire brut:</strong> ${new Intl.NumberFormat('fr-FR', { style: 'currency', currency: payslip.payRun?.company?.currency || 'XOF' }).format(payslip.grossSalary)}</p>
            <p><strong>Salaire net:</strong> ${new Intl.NumberFormat('fr-FR', { style: 'currency', currency: payslip.payRun?.company?.currency || 'XOF' }).format(payslip.netSalary)}</p>
            <p>Vous pouvez consulter et télécharger votre bulletin depuis votre espace employé.</p>
            <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}">Accéder à mon compte</a>
          `;

          await this.emailService.sendEmail(payslip.employee.email, subject, html);
        }
      }
    } catch (error: any) {
      console.error('Error sending payslip notifications:', error);
      throw error;
    }
  }
}
