import type { Users as User, Role } from "@prisma/client";
import type { IAuthService } from "./IAuthService.js";
import type { IUserRepository } from "../repositories/IUserRepository.js";
import type { IHashUtils } from "../utils/IHashUtils.js";
import type { IJwtUtils } from "../utils/IJwtUtils.js";
import prisma from "../config/prisma.js";

export class AuthService implements IAuthService {
  constructor(
    private userRepository: IUserRepository,
    private hashUtils: IHashUtils,
    private jwtUtils: IJwtUtils
  ) {}

  async registerUser(data: { name: string; email: string; password: string }): Promise<User> {
    const existingUser = await this.userRepository.findByEmail(data.email);
    if (existingUser) throw new Error("Email déjà utilisé");

    const hashed = await this.hashUtils.hashPassword(data.password);
    const user = await this.userRepository.create({ ...data, password: hashed });

    return user;
  }

  async loginUser(data: { email: string; password: string }): Promise<{ token: string; user: User }> {
    const user = await this.userRepository.findByEmail(data.email);
    if (!user) throw new Error("Utilisateur non trouvé");

    const valid = await this.hashUtils.comparePassword(data.password, user.password);
    if (!valid) throw new Error("Mot de passe incorrect");

    const token = this.jwtUtils.generateToken({ id: user.id, role: user.role });
    return { token, user };
  }

  async createSuperAdmin(data: { name: string; email: string; password: string }): Promise<{ token: string; user: User }> {
    const existingSuperAdmin = await prisma.users.findFirst({ where: { role: "SUPERADMIN" } });
    if (existingSuperAdmin) throw new Error("Super admin déjà créé");

    const hashed = await this.hashUtils.hashPassword(data.password);
    const user = await this.userRepository.create({ ...data, password: hashed, role: "SUPERADMIN" as Role });

    const token = this.jwtUtils.generateToken({ id: user.id, role: user.role });
    return { token, user };
  }

  async createUserBySuperAdmin(data: { name: string; email: string; password: string; role: Role; companyId: number }): Promise<User> {
    const existingUser = await this.userRepository.findByEmail(data.email);
    if (existingUser) throw new Error("Email déjà utilisé");

    const hashed = await this.hashUtils.hashPassword(data.password);
    const user = await this.userRepository.create({ ...data, password: hashed });

    return user;
  }
}
