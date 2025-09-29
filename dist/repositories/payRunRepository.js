import prisma from "../config/prisma.js";
export class PayRunRepository {
    async findById(id) {
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
    async create(data) {
        return prisma.payRun.create({ data });
    }
    async update(id, data) {
        return prisma.payRun.update({ where: { id }, data });
    }
    async findAll(filters) {
        const where = {};
        if (filters?.companyId)
            where.companyId = filters.companyId;
        if (filters?.status)
            where.status = filters.status;
        if (filters?.periodType)
            where.periodType = filters.periodType;
        return prisma.payRun.findMany({
            where,
            include: {
                company: true,
                createdByUser: true
            },
            orderBy: { createdAt: 'desc' }
        });
    }
    async delete(id) {
        await prisma.payRun.delete({ where: { id } });
    }
    async findByCompanyAndPeriod(companyId, startDate, endDate) {
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
//# sourceMappingURL=payRunRepository.js.map