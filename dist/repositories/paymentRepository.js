import prisma from "../config/prisma.js";
export class PaymentRepository {
    async findById(id) {
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
    async findByPayslip(payslipId) {
        return prisma.payment.findMany({
            where: { payslipId },
            include: {
                createdByUser: true
            },
            orderBy: { paidAt: 'desc' }
        });
    }
    async findByCompany(companyId, startDate, endDate) {
        const where = {
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
    async create(data) {
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
    async update(id, data) {
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
    async delete(id) {
        await prisma.payment.delete({
            where: { id }
        });
    }
}
//# sourceMappingURL=paymentRepository.js.map