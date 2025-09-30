import prisma from "../config/prisma.js";
export class PaymentService {
    paymentRepository;
    payslipRepository;
    pdfService;
    constructor(paymentRepository, payslipRepository, pdfService) {
        this.paymentRepository = paymentRepository;
        this.payslipRepository = payslipRepository;
        this.pdfService = pdfService;
    }
    async getPaymentById(id, userId) {
        const payment = await this.paymentRepository.findById(id);
        if (!payment)
            throw new Error("Paiement non trouvé");
        await this.checkPaymentAccess(payment.payslipId, userId);
        return payment;
    }
    async getPaymentsByPayslip(payslipId, userId) {
        await this.checkPayslipAccess(payslipId, userId);
        return this.paymentRepository.findByPayslip(payslipId);
    }
    async getPaymentsByCompany(companyId, startDate, endDate) {
        return this.paymentRepository.findByCompany(companyId, startDate, endDate);
    }
    async createPayment(data, userId) {
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
    async updatePayment(id, data, userId) {
        const existingPayment = await this.paymentRepository.findById(id);
        if (!existingPayment)
            throw new Error("Paiement non trouvé");
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
    async deletePayment(id, userId) {
        const payment = await this.paymentRepository.findById(id);
        if (!payment)
            throw new Error("Paiement non trouvé");
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
    async generatePaymentReceipt(paymentId, userId) {
        throw new Error("Génération de reçu PDF en cours d'implémentation");
    }
    async generatePaymentList(companyId, startDate, endDate) {
        throw new Error("Génération de liste de paiements PDF en cours d'implémentation");
    }
    async generatePayrollRegister(companyId, payRunId) {
        throw new Error("Génération de registre de paie PDF en cours d'implémentation");
    }
    // Méthodes utilitaires privées
    async checkPayslipAccess(payslipId, userId) {
        const payslip = await this.payslipRepository.findById(payslipId);
        if (!payslip)
            throw new Error("Bulletin non trouvé");
        const user = await prisma.users.findUnique({ where: { id: userId } });
        if (!user)
            throw new Error("Utilisateur non trouvé");
        if (user.role === "CAISSIER" || user.role === "ADMIN") {
            if (!user.companyId)
                throw new Error("Utilisateur non rattaché à une entreprise");
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
    async checkPaymentAccess(payslipId, userId) {
        return this.checkPayslipAccess(payslipId, userId);
    }
    async calculateAndUpdatePayslipStatus(payslipId, totalPaid, netSalary) {
        let newStatus;
        if (totalPaid === 0) {
            newStatus = "PENDING";
        }
        else if (totalPaid >= netSalary) {
            newStatus = "PAID";
        }
        else {
            newStatus = "PARTIAL";
        }
        await this.payslipRepository.updatePaymentStatus(payslipId, newStatus);
        return newStatus;
    }
}
//# sourceMappingURL=paymentService.js.map