import { registerSchema, loginSchema, createUserSchema } from "../validations/auth.js";
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
            res.json({ message: "Connexion réussie", token, user });
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
            const data = createUserSchema.parse(req.body);
            const user = await this.authService.createUserBySuperAdmin(data);
            res.json({ message: "Utilisateur créé", user });
        }
        catch (error) {
            res.status(400).json({ error: error.message });
        }
    }
}
//# sourceMappingURL=authController.js.map