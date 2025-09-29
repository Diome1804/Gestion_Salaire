import type { Request, Response } from "express";
import { registerSchema, loginSchema, createUserSchema, changePasswordSchema } from "../validations/auth.js";
import type { IAuthController } from "./IAuthController.js";
import type { IAuthService } from "../services/IAuthService.js";


export class AuthController implements IAuthController {

  constructor(private authService: IAuthService) {
    //
  }

  async register(req: Request, res: Response): Promise<void> {
    try {
      const data = registerSchema.parse(req.body);
      const user = await this.authService.registerUser(data);
      res.json({ message: "Utilisateur créé", user });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async login(req: Request, res: Response): Promise<void> {
    try {
      const data = loginSchema.parse(req.body);
      const { token, user } = await this.authService.loginUser(data);
      if (user.isTempPassword) {
        res.json({ message: "Connexion réussie, veuillez changer votre mot de passe", token, user, requirePasswordChange: true });
      } else {
        res.json({ message: "Connexion réussie", token, user });
      }
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async createSuperAdmin(req: Request, res: Response): Promise<void> {
    try {
      const data = registerSchema.parse(req.body);
      const { token, user } = await this.authService.createSuperAdmin(data);
      res.json({ message: "Super admin créé", token, user });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async createUser(req: Request, res: Response): Promise<void> {
    try {
      let data = createUserSchema.parse(req.body);
      const caller = (req as any).user;
      if (caller.role === "ADMIN") {
        data.companyId = caller.companyId;
      } else if (caller.role === "SUPERADMIN") {
        // For SUPERADMIN, require companyId for ADMIN and CAISSIER
        if ((data.role === "ADMIN" || data.role === "CAISSIER") && !data.companyId) {
          throw new Error("companyId est requis pour les rôles ADMIN et CAISSIER");
        }
      }
      const user = await this.authService.createUserBySuperAdmin(data as any);
      res.json({ message: "Utilisateur créé et email envoyé", user });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async changePassword(req: Request, res: Response): Promise<void> {
    try {
      const data = changePasswordSchema.parse(req.body);
      const userId = (req as any).user.id;
      await this.authService.changePassword(userId, data.newPassword);
      res.json({ message: "Mot de passe changé avec succès" });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }
}
