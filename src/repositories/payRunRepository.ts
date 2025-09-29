import prisma from "../config/prisma.js";
import type { PayRun as PayRunModel, PayRunStatus, PeriodType } from "@prisma/client";
import type { IPayRunRepository } from "./IPayRunRepository.js";

export class PayRunRepository implements IPayRunRepository {

  async findById(id: number): Promise<PayRunModel | null> {
    return prisma.payRun.findUnique({
      where: { id },
      include: {
        company: true,
        createdByUser: true,
        payslips: {
          include: {
            employee: true,
            payments: true
          }
        },
        attendances: {
          include: {
            employee: true
          }
        }
      }
    });
  }

  async create(data: {
    companyId: number;
    name: string;
    periodType: PeriodType;
    startDate: Date;
    endDate: Date;
    createdBy: number;
  }): Promise<PayRunModel> {
    return prisma.payRun.create({ data });
  }

  async update(id: number, data: Partial<{
    name: string;
    status: PayRunStatus;
    totalGross: number;
    totalDeductions: number;
    totalNet: number;
    approvedAt: Date;
    closedAt: Date;
  }>): Promise<PayRunModel> {
    return prisma.payRun.update({ where: { id }, data });
  }

  async findAll(filters?: {
    companyId?: number;
    status?: PayRunStatus;
    periodType?: PeriodType;
  }): Promise<PayRunModel[]> {
    const where: any = {};
    if (filters?.companyId) where.companyId = filters.companyId;
    if (filters?.status) where.status = filters.status;
    if (filters?.periodType) where.periodType = filters.periodType;

    return prisma.payRun.findMany({
      where,
      include: {
        company: true,
        createdByUser: true
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  async delete(id: number): Promise<void> {
    await prisma.payRun.delete({ where: { id } });
  }

  async findByCompanyAndPeriod(companyId: number, startDate: Date, endDate: Date): Promise<PayRunModel | null> {
    return prisma.payRun.findFirst({
      where: {
        companyId,
        OR: [
          {
            AND: [
              { startDate: { lte: startDate } },
              { endDate: { gte: startDate } }
            ]
          },
          {
            AND: [
              { startDate: { lte: endDate } },
              { endDate: { gte: endDate } }
            ]
          },
          {
            AND: [
              { startDate: { gte: startDate } },
              { endDate: { lte: endDate } }
            ]
          }
        ]
      }
    });
  }
}