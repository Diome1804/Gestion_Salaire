import type { Payment as PaymentModel, PaymentMethod } from "@prisma/client";

export interface IPaymentRepository {
  findById(id: number): Promise<PaymentModel | null>;
  findByPayslip(payslipId: number): Promise<PaymentModel[]>;
  findByCompany(companyId: number, startDate?: Date, endDate?: Date): Promise<PaymentModel[]>;
  create(data: {
    payslipId: number;
    amount: number;
    paymentMethod: PaymentMethod;
    reference?: string;
    notes?: string;
    createdBy: number;
  }): Promise<PaymentModel>;
  update(id: number, data: Partial<{
    amount: number;
    paymentMethod: PaymentMethod;
    reference: string;
    notes: string;
  }>): Promise<PaymentModel>;
  delete(id: number): Promise<void>;
}