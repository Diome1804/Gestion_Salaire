import prisma from "../config/prisma.js";
export class PayslipRepository {
    async findById(id) {
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
    async findByPayRun(payRunId) {
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
    async findByEmployee(employeeId) {
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
    async update(id, data) {
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
    async delete(id) {
        await prisma.payslip.delete({ where: { id } });
    }
}
//# sourceMappingURL=payslipRepository.js.map