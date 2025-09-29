import prisma from "../config/prisma.js";
import type { Users as User, Role } from "@prisma/client";
import type { IUserRepository } from "./IUserRepository.js";

export class UserRepository implements IUserRepository {
  
  async findByEmail(email: string): Promise<User | null> {
    return prisma.users.findUnique({ where: { email } });
  }

  async create(data: { name: string; email: string; password: string; role?: Role; companyId?: number | null; isTempPassword?: boolean }): Promise<User> {
    return prisma.users.create({ data });
  }

  async update(id: number, data: Partial<{ name: string; email: string; password: string; role: Role; companyId: number | null; isTempPassword: boolean }>): Promise<User> {
    return prisma.users.update({ where: { id }, data });
  }

  async findAll(): Promise<User[]> {
    return prisma.users.findMany({
      include: {
        company: true
      }
    });
  }
}
