import prisma from "../config/prisma.js";
export class UserRepository {
    async findByEmail(email) {
        return prisma.users.findUnique({ where: { email } });
    }
    async create(data) {
        return prisma.users.create({ data });
    }
}
//# sourceMappingURL=userRepository.js.map