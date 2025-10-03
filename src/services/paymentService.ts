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
    // Récupérer les données du paiement
    const payment = await this.paymentRepository.findById(paymentId);
    if (!payment) throw new Error("Paiement non trouvé");

    await this.checkPaymentAccess(payment.payslipId, userId);

    // Récupérer les données du bulletin et de l'employé
    const payslip = await this.payslipRepository.findById(payment.payslipId) as any;
    if (!payslip) throw new Error("Bulletin non trouvé");
    if (!payslip.employee) throw new Error("Employé non trouvé");
    if (!payslip.payRun) throw new Error("Cycle de paie non trouvé");

    // Créer les données pour le PDF du reçu
    const receiptData = {
      company: {
        name: payslip.payRun.company.name,
        address: payslip.payRun.company.address,
        currency: 'XAF' // Devise par défaut
      },
      employee: {
        fullName: payslip.employee.fullName,
        position: payslip.employee.position || 'N/A',
        contractType: payslip.employee.contractType || 'N/A'
      },
      payRun: {
        name: payslip.payRun.name,
        period: `${payslip.payRun.startDate.toLocaleDateString()} - ${payslip.payRun.endDate.toLocaleDateString()}`,
        startDate: payslip.payRun.startDate,
        endDate: payslip.payRun.endDate
      },
      payment: {
        id: payment.id,
        amount: payment.amount,
        paymentMethod: payment.paymentMethod,
        reference: payment.reference,
        paidAt: payment.paidAt
      },
      netSalary: payslip.netSalary
    };

    // Générer le PDF du reçu
    return this.generatePaymentReceiptPDF(receiptData);
  }

  async generatePaymentList(companyId: number, startDate: Date, endDate: Date): Promise<Buffer> {
    // Récupérer tous les paiements de la période
    const payments = await this.paymentRepository.findByCompany(companyId, startDate, endDate);

    // Récupérer les informations de l'entreprise
    const company = await prisma.company.findUnique({
      where: { id: companyId }
    });
    if (!company) throw new Error("Entreprise non trouvée");

    // Créer les données pour le PDF de liste
    const listData = {
      company: {
        name: company.name,
        address: company.address,
        currency: 'XAF'
      },
      period: {
        startDate,
        endDate
      },
      payments: await Promise.all(payments.map(async (payment) => {
        const payslip = await this.payslipRepository.findById(payment.payslipId) as any;
        const payRun = payslip ? await prisma.payRun.findUnique({
          where: { id: payslip.payRunId }
        }) : null;

        return {
          id: payment.id,
          employeeName: payslip?.employee?.fullName || 'N/A',
          amount: payment.amount,
          paymentMethod: payment.paymentMethod,
          reference: payment.reference,
          paidAt: payment.paidAt,
          payRunName: payRun?.name || 'N/A'
        };
      }))
    };

    // Générer le PDF de liste
    return this.generatePaymentListPDF(listData);
  }

  async generatePayrollRegister(companyId: number, payRunId: number): Promise<Buffer> {
    // Récupérer le cycle de paie
    const payRun = await prisma.payRun.findUnique({
      where: { id: payRunId },
      include: { company: true }
    });
    if (!payRun) throw new Error("Cycle de paie non trouvé");
    if (payRun.companyId !== companyId) throw new Error("Accès refusé");

    // Récupérer tous les bulletins du cycle
    const payslips = await this.payslipRepository.findByPayRun(payRunId);

    // Créer les données pour le registre
    const registerData = {
      company: {
        name: payRun.company.name,
        address: payRun.company.address,
        currency: 'XAF'
      },
      payRun: {
        name: payRun.name,
        period: `${payRun.startDate.toLocaleDateString()} - ${payRun.endDate.toLocaleDateString()}`,
        startDate: payRun.startDate,
        endDate: payRun.endDate
      },
      payslips: await Promise.all(payslips.map(async (payslip) => {
        // Calculer le total payé pour ce bulletin
        const payments = await this.paymentRepository.findByPayslip(payslip.id);
        const totalPaid = payments.reduce((sum, payment) => sum + payment.amount, 0);

        return {
          employeeName: (payslip as any).employee.fullName,
          position: (payslip as any).employee.position || 'N/A',
          grossSalary: payslip.grossSalary,
          netSalary: payslip.netSalary,
          totalPaid,
          remainingAmount: payslip.netSalary - totalPaid,
          paymentStatus: payslip.paymentStatus
        };
      }))
    };

    // Générer le PDF du registre
    return this.generatePayrollRegisterPDF(registerData);
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

  // Méthodes privées pour générer les PDFs
  private async generatePaymentReceiptPDF(data: any): Promise<Buffer> {
    const { PDFDocument, rgb, StandardFonts } = await import('pdf-lib');

    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage();
    const { width, height } = page.getSize();

    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    const fontSize = 12;
    let yPosition = height - 50;

    // Fonction utilitaire pour dessiner du texte
    const drawText = (text: string, x: number, y: number, options: any = {}) => {
      page.drawText(text, { x, y, size: fontSize, font, ...options });
    };

    const drawBoldText = (text: string, x: number, y: number, options: any = {}) => {
      page.drawText(text, { x, y, size: fontSize, font: boldFont, ...options });
    };

    // En-tête
    drawBoldText('REÇU DE PAIEMENT', width / 2 - 70, yPosition, { size: 18 });
    yPosition -= 40;

    // Informations entreprise
    drawBoldText('Informations Entreprise', 50, yPosition);
    yPosition -= 20;
    drawText(`Nom: ${data.company.name}`, 50, yPosition);
    yPosition -= 15;
    drawText(`Adresse: ${data.company.address}`, 50, yPosition);
    yPosition -= 30;

    // Informations employé
    drawBoldText('Informations Employé', 50, yPosition);
    yPosition -= 20;
    drawText(`Nom: ${data.employee.fullName}`, 50, yPosition);
    yPosition -= 15;
    drawText(`Poste: ${data.employee.position}`, 50, yPosition);
    yPosition -= 15;
    drawText(`Type de contrat: ${data.employee.contractType}`, 50, yPosition);
    yPosition -= 30;

    // Informations paiement
    drawBoldText('Informations de Paiement', 50, yPosition);
    yPosition -= 20;
    drawText(`ID Paiement: ${data.payment.id}`, 50, yPosition);
    yPosition -= 15;
    drawText(`Montant payé: ${data.payment.amount} ${data.company.currency}`, 50, yPosition);
    yPosition -= 15;
    drawText(`Méthode de paiement: ${data.payment.paymentMethod}`, 50, yPosition);
    yPosition -= 15;
    if (data.payment.reference) {
      drawText(`Référence: ${data.payment.reference}`, 50, yPosition);
      yPosition -= 15;
    }
    drawText(`Date de paiement: ${data.payment.paidAt.toLocaleDateString()}`, 50, yPosition);
    yPosition -= 30;

    // Informations cycle de paie
    drawBoldText('Cycle de Paie', 50, yPosition);
    yPosition -= 20;
    drawText(`Nom: ${data.payRun.name}`, 50, yPosition);
    yPosition -= 15;
    drawText(`Période: ${data.payRun.period}`, 50, yPosition);
    yPosition -= 15;
    drawText(`Salaire net: ${data.netSalary} ${data.company.currency}`, 50, yPosition);
    yPosition -= 40;

    // Pied de page
    yPosition = 50;
    drawText('Ce reçu de paiement est généré automatiquement par le système de gestion salariale.', 50, yPosition, { size: 10 });
    yPosition -= 15;
    drawText(`Date de génération: ${new Date().toLocaleDateString()}`, 50, yPosition, { size: 10 });

    const pdfBytes = await pdfDoc.save();
    return Buffer.from(pdfBytes);
  }

  private async generatePaymentListPDF(data: any): Promise<Buffer> {
    const { PDFDocument, rgb, StandardFonts } = await import('pdf-lib');

    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage();
    const { width, height } = page.getSize();

    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    const fontSize = 10;
    let yPosition = height - 50;

    // Fonction utilitaire pour dessiner du texte
    const drawText = (text: string, x: number, y: number, options: any = {}) => {
      page.drawText(text, { x, y, size: fontSize, font, ...options });
    };

    const drawBoldText = (text: string, x: number, y: number, options: any = {}) => {
      page.drawText(text, { x, y, size: fontSize, font: boldFont, ...options });
    };

    // En-tête
    drawBoldText('LISTE DES PAIEMENTS', width / 2 - 80, yPosition, { size: 16 });
    yPosition -= 30;
    drawText(`Entreprise: ${data.company.name}`, 50, yPosition);
    yPosition -= 15;
    drawText(`Période: ${data.period.startDate.toLocaleDateString()} - ${data.period.endDate.toLocaleDateString()}`, 50, yPosition);
    yPosition -= 30;

    // Tableau des paiements
    const tableX = 50;
    const colWidths = [60, 120, 80, 80, 100, 80];
    const headers = ['ID', 'Employé', 'Montant', 'Méthode', 'Référence', 'Date'];

    // En-têtes du tableau
    headers.forEach((header, index) => {
      let x = tableX;
      for (let i = 0; i < index; i++) x += colWidths[i];
      drawBoldText(header, x, yPosition);
    });
    yPosition -= 15;

    // Ligne séparatrice
    page.drawLine({
      start: { x: tableX, y: yPosition + 10 },
      end: { x: tableX + colWidths.reduce((a, b) => a + b, 0), y: yPosition + 10 },
      thickness: 1,
      color: rgb(0, 0, 0),
    });
    yPosition -= 10;

    // Données des paiements
    data.payments.forEach((payment: any) => {
      let x = tableX;
      const values = [
        payment.id.toString(),
        payment.employeeName,
        `${payment.amount} ${data.company.currency}`,
        payment.paymentMethod,
        payment.reference || '-',
        payment.paidAt.toLocaleDateString()
      ];

      values.forEach((value, index) => {
        drawText(value, x, yPosition);
        x += colWidths[index];
      });
      yPosition -= 15;
    });

    // Pied de page
    yPosition = 50;
    drawText('Liste des paiements générée automatiquement par le système de gestion salariale.', 50, yPosition, { size: 8 });
    yPosition -= 12;
    drawText(`Date de génération: ${new Date().toLocaleDateString()}`, 50, yPosition, { size: 8 });

    const pdfBytes = await pdfDoc.save();
    return Buffer.from(pdfBytes);
  }

  private async generatePayrollRegisterPDF(data: any): Promise<Buffer> {
    const { PDFDocument, rgb, StandardFonts } = await import('pdf-lib');

    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage();
    const { width, height } = page.getSize();

    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    const fontSize = 9;
    let yPosition = height - 50;

    // Fonction utilitaire pour dessiner du texte
    const drawText = (text: string, x: number, y: number, options: any = {}) => {
      page.drawText(text, { x, y, size: fontSize, font, ...options });
    };

    const drawBoldText = (text: string, x: number, y: number, options: any = {}) => {
      page.drawText(text, { x, y, size: fontSize, font: boldFont, ...options });
    };

    // En-tête
    drawBoldText('REGISTRE DE PAIE', width / 2 - 70, yPosition, { size: 16 });
    yPosition -= 30;
    drawText(`Entreprise: ${data.company.name}`, 50, yPosition);
    yPosition -= 15;
    drawText(`Cycle de paie: ${data.payRun.name}`, 50, yPosition);
    yPosition -= 15;
    drawText(`Période: ${data.payRun.period}`, 50, yPosition);
    yPosition -= 30;

    // Tableau du registre
    const tableX = 30;
    const colWidths = [80, 60, 60, 60, 60, 60, 50];
    const headers = ['Employé', 'Poste', 'Salaire Brut', 'Salaire Net', 'Payé', 'Restant', 'Statut'];

    // En-têtes du tableau
    headers.forEach((header, index) => {
      let x = tableX;
      for (let i = 0; i < index; i++) x += colWidths[i];
      drawBoldText(header, x, yPosition);
    });
    yPosition -= 15;

    // Ligne séparatrice
    page.drawLine({
      start: { x: tableX, y: yPosition + 10 },
      end: { x: tableX + colWidths.reduce((a, b) => a + b, 0), y: yPosition + 10 },
      thickness: 1,
      color: rgb(0, 0, 0),
    });
    yPosition -= 10;

    // Données des bulletins
    data.payslips.forEach((payslip: any) => {
      let x = tableX;
      const values = [
        payslip.employeeName,
        payslip.position,
        `${payslip.grossSalary} ${data.company.currency}`,
        `${payslip.netSalary} ${data.company.currency}`,
        `${payslip.totalPaid} ${data.company.currency}`,
        `${payslip.remainingAmount} ${data.company.currency}`,
        payslip.paymentStatus
      ];

      values.forEach((value, index) => {
        drawText(value, x, yPosition);
        x += colWidths[index];
      });
      yPosition -= 12;
    });

    // Pied de page
    yPosition = 50;
    drawText('Registre de paie généré automatiquement par le système de gestion salariale.', 30, yPosition, { size: 8 });
    yPosition -= 12;
    drawText(`Date de génération: ${new Date().toLocaleDateString()}`, 30, yPosition, { size: 8 });

    const pdfBytes = await pdfDoc.save();
    return Buffer.from(pdfBytes);
  }
}
