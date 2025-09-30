import type { Payment as PaymentModel, PaymentMethod, PayslipStatus } from "@prisma/client";
import type { IPaymentService } from "./IPaymentService.js";
import type { IPaymentRepository } from "../repositories/IPaymentRepository.js";
import type { IPayslipRepository } from "../repositories/IPayslipRepository.js";
import type { PDFService } from "./pdfService.js";
import prisma from "../config/prisma.js";

export class PaymentService implements IPaymentService {
  constructor(
    private paymentRepository: IPaymentRepository,
    private payslipRepository: IPayslipRepository,
    private pdfService: PDFService
  ) {}

  async getPaymentById(id: number, userId: number): Promise<PaymentModel> {
    const payment = await this.paymentRepository.findById(id);
    if (!payment) throw new Error("Paiement non trouvé");

    await this.checkPaymentAccess(payment.payslipId, userId);
    return payment;
  }

  async getPaymentsByPayslip(payslipId: number, userId: number): Promise<PaymentModel[]> {
    await this.checkPayslipAccess(payslipId, userId);
    return this.paymentRepository.findByPayslip(payslipId);
  }

  async getPaymentsByCompany(companyId: number, startDate?: Date, endDate?: Date): Promise<PaymentModel[]> {
    return this.paymentRepository.findByCompany(companyId, startDate, endDate);
  }

  async createPayment(data: {
    payslipId: number;
    amount: number;
    paymentMethod: PaymentMethod;
    reference?: string;
    notes?: string;
  }, userId: number): Promise<{ payment: PaymentModel; newStatus: PayslipStatus }> {
    const payslip = await this.checkPayslipAccess(data.payslipId, userId);

    // Calculer le total déjà payé
    const existingPayments = await this.paymentRepository.findByPayslip(data.payslipId);
    const totalPaid = existingPayments.reduce((sum, payment) => sum + payment.amount, 0);
    const remainingAmount = payslip.netSalary - totalPaid;

    if (data.amount > remainingAmount) {
      throw new Error(`Montant trop élevé. Reste à payer: ${remainingAmount}`);
    }

    // Créer le paiement
    const payment = await this.paymentRepository.create({
      ...data,
      createdBy: userId
    });

    // Mettre à jour le statut du bulletin
    const newStatus = await this.calculateAndUpdatePayslipStatus(data.payslipId, totalPaid + data.amount, payslip.netSalary);

    return { payment, newStatus };
  }

  async updatePayment(id: number, data: Partial<{
    amount: number;
    paymentMethod: PaymentMethod;
    reference: string;
    notes: string;
  }>, userId: number): Promise<{ payment: PaymentModel; newStatus: PayslipStatus }> {
    const existingPayment = await this.paymentRepository.findById(id);
    if (!existingPayment) throw new Error("Paiement non trouvé");

    await this.checkPaymentAccess(existingPayment.payslipId, userId);

    const payment = await this.paymentRepository.update(id, data);

    // Recalculer le statut si le montant a changé
    if (data.amount !== undefined) {
      const payslip = await this.payslipRepository.findById(existingPayment.payslipId);
      if (payslip) {
        const allPayments = await this.paymentRepository.findByPayslip(existingPayment.payslipId);
        const totalPaid = allPayments.reduce((sum, p) => sum + p.amount, 0);
        await this.calculateAndUpdatePayslipStatus(existingPayment.payslipId, totalPaid, payslip.netSalary);
      }
    }

    const payslip = await this.payslipRepository.findById(payment.payslipId);
    return { payment, newStatus: payslip?.paymentStatus || "PENDING" };
  }

  async deletePayment(id: number, userId: number): Promise<{ newStatus: PayslipStatus }> {
    const payment = await this.paymentRepository.findById(id);
    if (!payment) throw new Error("Paiement non trouvé");

    await this.checkPaymentAccess(payment.payslipId, userId);

    const payslipId = payment.payslipId;

    // Supprimer le paiement
    await this.paymentRepository.delete(id);

    // Recalculer le statut
    const payslip = await this.payslipRepository.findById(payslipId);
    if (payslip) {
      const remainingPayments = await this.paymentRepository.findByPayslip(payslipId);
      const totalPaid = remainingPayments.reduce((sum, p) => sum + p.amount, 0);
      const newStatus = await this.calculateAndUpdatePayslipStatus(payslipId, totalPaid, payslip.netSalary);
      return { newStatus };
    }

    return { newStatus: "PENDING" };
  }

  async generatePaymentReceipt(paymentId: number, userId: number): Promise<Buffer> {
    throw new Error("Génération de reçu PDF en cours d'implémentation");
  }

  async generatePaymentList(companyId: number, startDate: Date, endDate: Date): Promise<Buffer> {
    throw new Error("Génération de liste de paiements PDF en cours d'implémentation");
  }

  async generatePayrollRegister(companyId: number, payRunId: number): Promise<Buffer> {
    throw new Error("Génération de registre de paie PDF en cours d'implémentation");
  }

  // Méthodes utilitaires privées
  private async checkPayslipAccess(payslipId: number, userId: number) {
    const payslip = await this.payslipRepository.findById(payslipId);
    if (!payslip) throw new Error("Bulletin non trouvé");

    const user = await prisma.users.findUnique({ where: { id: userId } });
    if (!user) throw new Error("Utilisateur non trouvé");

    if (user.role === "CAISSIER" || user.role === "ADMIN") {
      if (!user.companyId) throw new Error("Utilisateur non rattaché à une entreprise");

      // Récupérer l'ID de l'entreprise du cycle de paie
      const payRun = await prisma.payRun.findUnique({
        where: { id: payslip.payRunId },
        select: { companyId: true }
      });

      if (!payRun || payRun.companyId !== user.companyId) {
        throw new Error("Accès refusé");
      }
    }

    return payslip;
  }

  private async checkPaymentAccess(payslipId: number, userId: number) {
    return this.checkPayslipAccess(payslipId, userId);
  }

  private async calculateAndUpdatePayslipStatus(payslipId: number, totalPaid: number, netSalary: number): Promise<PayslipStatus> {
    let newStatus: PayslipStatus;

    if (totalPaid === 0) {
      newStatus = "PENDING";
    } else if (totalPaid >= netSalary) {
      newStatus = "PAID";
    } else {
      newStatus = "PARTIAL";
    }

    await this.payslipRepository.updatePaymentStatus(payslipId, newStatus);
    return newStatus;
  }
}