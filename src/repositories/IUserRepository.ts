import type { Users as User, Role } from "@prisma/client";

export interface IUserRepository {
  findByEmail(email: string): Promise<User | null>;
  create(data: { name: string; email: string; password: string; role?: Role }): Promise<User>;
}
