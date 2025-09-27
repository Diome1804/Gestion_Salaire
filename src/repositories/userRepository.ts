import prisma from "../config/prisma.js";
import type { Users as User, Role } from "@prisma/client";
import type { IUserRepository } from "./IUserRepository.js";

export class UserRepository implements IUserRepository {
  
  async findByEmail(email: string): Promise<User | null> {
    return prisma.users.findUnique({ where: { email } });
  }

  async create(data: { name: string; email: string; password: string; role?: Role }): Promise<User> {
    return prisma.users.create({ data });
  }
}
