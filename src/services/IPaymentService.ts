import type { Payment as PaymentModel, PaymentMethod, PayslipStatus } from "@prisma/client";

export interface IPaymentService {
  getPaymentById(id: number, userId: number): Promise<PaymentModel>;
  getPaymentsByPayslip(payslipId: number, userId: number): Promise<PaymentModel[]>;
  getPaymentsByCompany(companyId: number, startDate?: Date, endDate?: Date): Promise<PaymentModel[]>;
  createPayment(data: {
    payslipId: number;
    amount: number;
    paymentMethod: PaymentMethod;
    reference?: string;
    notes?: string;
  }, userId: number): Promise<{ payment: PaymentModel; newStatus: PayslipStatus }>;
  updatePayment(id: number, data: Partial<{
    amount: number;
    paymentMethod: PaymentMethod;
    reference: string;
    notes: string;
  }>, userId: number): Promise<{ payment: PaymentModel; newStatus: PayslipStatus }>;
  deletePayment(id: number, userId: number): Promise<{ newStatus: PayslipStatus }>;
  generatePaymentReceipt(paymentId: number, userId: number): Promise<Buffer>;
  generatePaymentList(companyId: number, startDate: Date, endDate: Date): Promise<Buffer>;
  generatePayrollRegister(companyId: number, payRunId: number): Promise<Buffer>;
}