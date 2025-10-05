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
    async getAllUsers(req, res) {
        try {
            const users = await this.authService.getAllUsers();
            res.json(users);
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
    async deleteUser(req, res) {
        try {
            const id = req.params.id;
            if (!id) {
                res.status(400).json({ error: "ID utilisateur manquant" });
                return;
            }
            const userId = parseInt(id);
            if (isNaN(userId)) {
                res.status(400).json({ error: "ID utilisateur invalide" });
                return;
            }
            await this.authService.deleteUser(userId);
            res.json({ message: "Utilisateur supprimé avec succès" });
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
    async impersonateCompany(req, res) {
        try {
            const caller = req.user;
            // Vérifier que l'utilisateur est SUPERADMIN
            if (caller.role !== 'SUPERADMIN') {
                res.status(403).json({ error: "Accès refusé - SUPERADMIN requis" });
                return;
            }
            const companyId = req.body.companyId;
            if (!companyId) {
                res.status(400).json({ error: "companyId manquant" });
                return;
            }
            const companyIdNum = parseInt(companyId);
            if (isNaN(companyIdNum)) {
                res.status(400).json({ error: "companyId invalide" });
                return;
            }
            // Vérifier que l'entreprise autorise l'impersonnation
            const company = await this.authService.getCompanyById(companyIdNum);
            if (!company) {
                res.status(404).json({ error: "Entreprise non trouvée" });
                return;
            }
            if (!company.allowImpersonation) {
                res.status(403).json({ error: "L'impersonnation n'est pas autorisée pour cette entreprise" });
                return;
            }
            // Créer un token d'impersonnation
            const impersonationToken = await this.authService.createImpersonationToken(caller.id, companyIdNum);
            res.json({
                message: "Mode impersonnation activé",
                impersonationToken,
                company: {
                    id: company.id,
                    name: company.name,
                    allowImpersonation: company.allowImpersonation
                }
            });
        }
        catch (error) {
            res.status(400).json({ error: error.message });
        }
    }
    async stopImpersonation(req, res) {
        try {
            const caller = req.user;
            // Vérifier que l'utilisateur est SUPERADMIN
            if (caller.role !== 'SUPERADMIN') {
                res.status(403).json({ error: "Accès refusé - SUPERADMIN requis" });
                return;
            }
            // Le token normal du SUPERADMIN sera utilisé pour revenir à l'état normal
            res.json({ message: "Mode impersonnation désactivé" });
        }
        catch (error) {
            res.status(400).json({ error: error.message });
        }
    }
}
//# sourceMappingURL=authController.js.map