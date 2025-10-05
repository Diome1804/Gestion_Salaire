import type { Users as User, Role } from "@prisma/client";
import type { IAuthService } from "./IAuthService.js";
import type { IUserRepository } from "../repositories/IUserRepository.js";
import type { IHashUtils } from "../utils/IHashUtils.js";
import type { IJwtUtils } from "../utils/IJwtUtils.js";
import type { IEmailService } from "./IEmailService.js";
import prisma from "../config/prisma.js";

export class AuthService implements IAuthService {
  constructor(
    private userRepository: IUserRepository,
    private hashUtils: IHashUtils,
    private jwtUtils: IJwtUtils,
    private emailService: IEmailService
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

  private generateTempPassword(): string {
    return Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8);
  }

  async createUserBySuperAdmin(data: { name: string; prenom?: string; email: string; role: Role; companyId: number | null }): Promise<User> {
    const existingUser = await this.userRepository.findByEmail(data.email);
    if (existingUser) throw new Error("Email déjà utilisé");

    const tempPassword = this.generateTempPassword();
    const hashed = await this.hashUtils.hashPassword(tempPassword);
    const user = await this.userRepository.create({ ...data, password: hashed, isTempPassword: true });

    // Send appropriate email based on role
    try {
      if (data.role === 'VIGILE') {
        // Send vigile-specific email with login URL
        await this.emailService.sendVigileCredentials(user, tempPassword);
      } else {
        // Send standard email for ADMIN/CAISSIER
        const subject = "Vos informations de connexion";
        const loginUrl = data.role === 'VIGILE' 
          ? `${process.env.FRONTEND_URL || 'http://localhost:5173'}/vigile/login`
          : `${process.env.FRONTEND_URL || 'http://localhost:5173'}/login`;
        
        const html = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #2563eb;">Bienvenue dans Gestion Salaire</h1>
            <p>Votre compte a été créé avec succès.</p>
            <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <p><strong>Email:</strong> ${data.email}</p>
              <p><strong>Mot de passe temporaire:</strong> <code style="background-color: #e5e7eb; padding: 4px 8px; border-radius: 4px;">${tempPassword}</code></p>
              <p><strong>Rôle:</strong> ${data.role}</p>
            </div>
            <p>Veuillez vous connecter et changer votre mot de passe immédiatement.</p>
            <a href="${loginUrl}" style="display: inline-block; background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; margin: 20px 0;">Se connecter</a>
            <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;" />
            <p style="color: #6b7280; font-size: 12px;">
              Cet email a été envoyé automatiquement par le système de gestion des salaires.
            </p>
          </div>
        `;
        await this.emailService.sendEmail(data.email, subject, html);
      }
      console.log(`Email sent successfully to ${data.email} for role ${data.role}`);
    } catch (error) {
      console.error('Failed to send email:', error);
      // Don't throw error to prevent user creation from failing
    }

    return user;
  }

  async changePassword(userId: number, newPassword: string): Promise<void> {
    const hashed = await this.hashUtils.hashPassword(newPassword);
    await this.userRepository.update(userId, { password: hashed, isTempPassword: false });
  }

  async getAllUsers(): Promise<User[]> {
    return await this.userRepository.findAll();
  }

  async deleteUser(userId: number): Promise<void> {
    await this.userRepository.delete(userId);
  }

  async getCompanyById(companyId: number) {
    return await prisma.company.findUnique({
      where: { id: companyId }
    });
  }

  async createImpersonationToken(superAdminId: number, companyId: number): Promise<string> {
    // Create a JWT token with impersonation claims
    const payload = {
      id: superAdminId,
      role: "SUPERADMIN" as Role,
      impersonatingCompanyId: companyId
    };
    return this.jwtUtils.generateToken(payload);
  }
}
