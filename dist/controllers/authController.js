import { registerSchema, loginSchema, createUserSchema, changePasswordSchema } from "../validations/auth.js";
export class AuthController {
    authService;
    constructor(authService) {
        this.authService = authService;
        //
    }
    async register(req, res) {
        try {
            const data = registerSchema.parse(req.body);
            const user = await this.authService.registerUser(data);
            res.json({ message: "Utilisateur créé", user });
        }
        catch (error) {
            res.status(400).json({ error: error.message });
        }
    }
    async login(req, res) {
        try {
            const data = loginSchema.parse(req.body);
            const { token, user } = await this.authService.loginUser(data);
            if (user.isTempPassword) {
                res.json({ message: "Connexion réussie, veuillez changer votre mot de passe", token, user, requirePasswordChange: true });
            }
            else {
                res.json({ message: "Connexion réussie", token, user });
            }
        }
        catch (error) {
            res.status(400).json({ error: error.message });
        }
    }
    async createSuperAdmin(req, res) {
        try {
            const data = registerSchema.parse(req.body);
            const { token, user } = await this.authService.createSuperAdmin(data);
            res.json({ message: "Super admin créé", token, user });
        }
        catch (error) {
            res.status(400).json({ error: error.message });
        }
    }
    async createUser(req, res) {
        try {
            let data = createUserSchema.parse(req.body);
            const caller = req.user;
            console.log('CreateUser - Caller:', { role: caller.role, companyId: caller.companyId });
            console.log('CreateUser - Request data:', data);
            if (caller.role === "ADMIN") {
                data.companyId = caller.companyId;
                console.log('CreateUser - Set companyId to caller companyId:', data.companyId);
            }
            else if (caller.role === "SUPERADMIN") {
                // For SUPERADMIN, require companyId for ADMIN and CAISSIER
                if ((data.role === "ADMIN" || data.role === "CAISSIER") && !data.companyId) {
                    throw new Error("companyId est requis pour les rôles ADMIN et CAISSIER");
                }
            }
            const user = await this.authService.createUserBySuperAdmin(data);
            res.json({ message: "Utilisateur créé et email envoyé", user });
        }
        catch (error) {
            res.status(400).json({ error: error.message });
        }
    }
    async changePassword(req, res) {
        try {
            const data = changePasswordSchema.parse(req.body);
            const userId = req.user.id;
            await this.authService.changePassword(userId, data.newPassword);
            res.json({ message: "Mot de passe changé avec succès" });
        }
        catch (error) {
            res.status(400).json({ error: error.message });
        }
    }
}
//# sourceMappingURL=authController.js.map