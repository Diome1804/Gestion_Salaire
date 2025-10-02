import prisma from "../config/prisma.js";
import type { Payslip as PayslipModel, PayslipStatus } from "@prisma/client";
import type { IPayslipRepository } from "./IPayslipRepository.js";

export class PayslipRepository implements IPayslipRepository {

  async findById(id: number): Promise<PayslipModel | null> {
    return prisma.payslip.findUnique({
      where: { id },
      include: {
        payRun: {
          include: {
            company: true
          }
        },
        employee: {
          include: {
            company: true
          }
        },
        payments: true
      }
    });
  }

  async findByPayRun(payRunId: number): Promise<PayslipModel[]> {
    return prisma.payslip.findMany({
      where: { payRunId },
      include: {
        employee: {
          include: {
            company: true
          }
        },
        payments: true
      },
      orderBy: { employee: { fullName: 'asc' } }
    });
  }

  async findByEmployee(employeeId: number): Promise<PayslipModel[]> {
    return prisma.payslip.findMany({
      where: { employeeId },
      include: {
        payRun: {
          include: {
            company: true
          }
        },
        payments: true
      },
      orderBy: { payRun: { createdAt: 'desc' } }
    });
  }

  async findByCompany(companyId: number): Promise<PayslipModel[]> {
    return prisma.payslip.findMany({
      where: {
        employee: {
          companyId: companyId
        }
      },
      include: {
        payRun: {
          include: {
            company: true
          }
        },
        employee: {
          include: {
            company: true
          }
        },
        payments: true
      },
      orderBy: [
        { payRun: { createdAt: 'desc' } },
        { employee: { fullName: 'asc' } }
      ]
    });
  }

  async update(id: number, data: Partial<{
    grossSalary: number;
    deductions: any[];
    totalDeductions: number;
    netSalary: number;
    paymentStatus: PayslipStatus;
  }>): Promise<PayslipModel> {
    return prisma.payslip.update({
      where: { id },
      data: {
        ...data,
        updatedAt: new Date()
      },
      include: {
        payRun: {
          include: {
            company: true
          }
        },
        employee: {
          include: {
            company: true
          }
        },
        payments: true
      }
    });
  }

  async delete(id: number): Promise<void> {
    await prisma.payslip.delete({ where: { id } });
  }

  async updatePaymentStatus(id: number, status: PayslipStatus): Promise<void> {
    await prisma.payslip.update({
      where: { id },
      data: {
        paymentStatus: status,
        updatedAt: new Date()
      }
    });
  }
}