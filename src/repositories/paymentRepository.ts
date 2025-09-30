import prisma from "../config/prisma.js";
import type { Payment as PaymentModel, PaymentMethod } from "@prisma/client";
import type { IPaymentRepository } from "./IPaymentRepository.js";

export class PaymentRepository implements IPaymentRepository {
  async findById(id: number): Promise<PaymentModel | null> {
    return prisma.payment.findUnique({
      where: { id },
      include: {
        payslip: {
          include: {
            employee: true,
            payRun: {
              include: {
                company: true
              }
            }
          }
        },
        createdByUser: true
      }
    });
  }

  async findByPayslip(payslipId: number): Promise<PaymentModel[]> {
    return prisma.payment.findMany({
      where: { payslipId },
      include: {
        createdByUser: true
      },
      orderBy: { paidAt: 'desc' }
    });
  }

  async findByCompany(companyId: number, startDate?: Date, endDate?: Date): Promise<PaymentModel[]> {
    const where: any = {
      payslip: {
        payRun: {
          companyId
        }
      }
    };

    if (startDate && endDate) {
      where.paidAt = {
        gte: startDate,
        lte: endDate
      };
    }

    return prisma.payment.findMany({
      where,
      include: {
        payslip: {
          include: {
            employee: true,
            payRun: true
          }
        },
        createdByUser: true
      },
      orderBy: { paidAt: 'desc' }
    });
  }

  async create(data: {
    payslipId: number;
    amount: number;
    paymentMethod: PaymentMethod;
    reference?: string;
    notes?: string;
    createdBy: number;
  }): Promise<PaymentModel> {
    return prisma.payment.create({
      data,
      include: {
        payslip: {
          include: {
            employee: true,
            payRun: {
              include: {
                company: true
              }
            }
          }
        },
        createdByUser: true
      }
    });
  }

  async update(id: number, data: Partial<{
    amount: number;
    paymentMethod: PaymentMethod;
    reference: string;
    notes: string;
  }>): Promise<PaymentModel> {
    return prisma.payment.update({
      where: { id },
      data,
      include: {
        payslip: {
          include: {
            employee: true,
            payRun: {
              include: {
                company: true
              }
            }
          }
        },
        createdByUser: true
      }
    });
  }

  async delete(id: number): Promise<void> {
    await prisma.payment.delete({
      where: { id }
    });
  }
}