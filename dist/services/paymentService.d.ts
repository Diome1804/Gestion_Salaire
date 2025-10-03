import type { Payment as PaymentModel, PaymentMethod, PayslipStatus } from "@prisma/client";
import type { IPaymentService } from "./IPaymentService.js";
import type { IPaymentRepository } from "../repositories/IPaymentRepository.js";
import type { IPayslipRepository } from "../repositories/IPayslipRepository.js";
import type { PDFService } from "./pdfService.js";
import type { IEmailService } from "./IEmailService.js";
export declare class PaymentService implements IPaymentService {
    private paymentRepository;
    private payslipRepository;
    private pdfService;
    private emailService?;
    constructor(paymentRepository: IPaymentRepository, payslipRepository: IPayslipRepository, pdfService: PDFService, emailService?: IEmailService | undefined);
    getPaymentById(id: number, userId: number): Promise<PaymentModel>;
    getPaymentsByPayslip(payslipId: number, userId: number): Promise<PaymentModel[]>;
    getPaymentsByCompany(companyId: number, startDate?: Date, endDate?: Date): Promise<PaymentModel[]>;
    createPayment(data: {
        payslipId: number;
        amount: number;
        paymentMethod: PaymentMethod;
        reference?: string;
        notes?: string;
    }, userId: number): Promise<{
        payment: PaymentModel;
        newStatus: PayslipStatus;
    }>;
    updatePayment(id: number, data: Partial<{
        amount: number;
        paymentMethod: PaymentMethod;
        reference: string;
        notes: string;
    }>, userId: number): Promise<{
        payment: PaymentModel;
        newStatus: PayslipStatus;
    }>;
    deletePayment(id: number, userId: number): Promise<{
        newStatus: PayslipStatus;
    }>;
    generatePaymentReceipt(paymentId: number, userId: number): Promise<Buffer>;
    generatePaymentList(companyId: number, startDate: Date, endDate: Date): Promise<Buffer>;
    generatePayrollRegister(companyId: number, payRunId: number): Promise<Buffer>;
    private checkPayslipAccess;
    private checkPaymentAccess;
    private calculateAndUpdatePayslipStatus;
    private generatePaymentReceiptPDF;
    private generatePaymentListPDF;
    private generatePayrollRegisterPDF;
    private sendPaymentNotification;
}
//# sourceMappingURL=paymentService.d.ts.map