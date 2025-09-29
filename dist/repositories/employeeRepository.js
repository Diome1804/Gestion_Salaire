import prisma from "../config/prisma.js";
export class EmployeeRepository {
    async findById(id) {
        return prisma.employee.findUnique({ where: { id } });
    }
    async create(data) {
        return prisma.employee.create({ data });
    }
    async update(id, data) {
        return prisma.employee.update({ where: { id }, data });
    }
    async findAll(filters) {
        const where = {};
        if (filters?.companyId)
            where.companyId = filters.companyId;
        if (filters?.isActive !== undefined)
            where.isActive = filters.isActive;
        if (filters?.position)
            where.position = { contains: filters.position };
        if (filters?.contractType)
            where.contractType = filters.contractType;
        return prisma.employee.findMany({ where, include: { company: true } });
    }
    async delete(id) {
        await prisma.employee.delete({ where: { id } });
    }
    async activate(id) {
        return prisma.employee.update({ where: { id }, data: { isActive: true } });
    }
    async deactivate(id) {
        return prisma.employee.update({ where: { id }, data: { isActive: false } });
    }
}
//# sourceMappingURL=employeeRepository.js.map