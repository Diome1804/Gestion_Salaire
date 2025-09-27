import prisma from "../config/prisma.js";
export class CompanyRepository {
    async create(data) {
        return prisma.company.create({ data });
    }
    async findById(id) {
        return prisma.company.findUnique({ where: { id } });
    }
    async update(id, data) {
        return prisma.company.update({ where: { id }, data });
    }
    async delete(id) {
        await prisma.company.delete({ where: { id } });
    }
    async findAll() {
        return prisma.company.findMany();
    }
}
//# sourceMappingURL=companyRepository.js.map