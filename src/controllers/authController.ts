import type { Request, Response } from "express";
import { registerSchema, loginSchema, createUserSchema } from "../validations/auth.js";
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
      res.json({ message: "Connexion réussie", token, user });
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
      const data = createUserSchema.parse(req.body);
      const user = await this.authService.createUserBySuperAdmin(data);
      res.json({ message: "Utilisateur créé", user });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }
}
