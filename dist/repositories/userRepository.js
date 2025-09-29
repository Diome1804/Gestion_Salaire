import prisma from "../config/prisma.js";
export class UserRepository {
    async findByEmail(email) {
        return prisma.users.findUnique({ where: { email } });
    }
    async create(data) {
        return prisma.users.create({ data });
    }
    async update(id, data) {
        return prisma.users.update({ where: { id }, data });
    }
    async findAll() {
        return prisma.users.findMany({
            include: {
                company: true
            }
        });
    }
}
//# sourceMappingURL=userRepository.js.map