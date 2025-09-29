import prisma from "../config/prisma.js";
export class AuthService {
    userRepository;
    hashUtils;
    jwtUtils;
    emailService;
    constructor(userRepository, hashUtils, jwtUtils, emailService) {
        this.userRepository = userRepository;
        this.hashUtils = hashUtils;
        this.jwtUtils = jwtUtils;
        this.emailService = emailService;
    }
    async registerUser(data) {
        const existingUser = await this.userRepository.findByEmail(data.email);
        if (existingUser)
            throw new Error("Email déjà utilisé");
        const hashed = await this.hashUtils.hashPassword(data.password);
        const user = await this.userRepository.create({ ...data, password: hashed });
        return user;
    }
    async loginUser(data) {
        const user = await this.userRepository.findByEmail(data.email);
        if (!user)
            throw new Error("Utilisateur non trouvé");
        const valid = await this.hashUtils.comparePassword(data.password, user.password);
        if (!valid)
            throw new Error("Mot de passe incorrect");
        const token = this.jwtUtils.generateToken({ id: user.id, role: user.role });
        return { token, user };
    }
    async createSuperAdmin(data) {
        const existingSuperAdmin = await prisma.users.findFirst({ where: { role: "SUPERADMIN" } });
        if (existingSuperAdmin)
            throw new Error("Super admin déjà créé");
        const hashed = await this.hashUtils.hashPassword(data.password);
        const user = await this.userRepository.create({ ...data, password: hashed, role: "SUPERADMIN" });
        const token = this.jwtUtils.generateToken({ id: user.id, role: user.role });
        return { token, user };
    }
    generateTempPassword() {
        return Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8);
    }
    async createUserBySuperAdmin(data) {
        const existingUser = await this.userRepository.findByEmail(data.email);
        if (existingUser)
            throw new Error("Email déjà utilisé");
        const tempPassword = this.generateTempPassword();
        const hashed = await this.hashUtils.hashPassword(tempPassword);
        const user = await this.userRepository.create({ ...data, password: hashed, isTempPassword: true });
        // Send email (async to not block user creation)
        const subject = "Vos informations de connexion";
        const html = `
      <h1>Bienvenue dans Gestion Salaire</h1>
      <p>Votre compte a été créé avec succès.</p>
      <p><strong>Email:</strong> ${data.email}</p>
      <p><strong>Mot de passe temporaire:</strong> ${tempPassword}</p>
      <p>Veuillez vous connecter et changer votre mot de passe immédiatement.</p>
      <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/login">Se connecter</a>
    `;
        // Don't await to prevent timeout blocking user creation
        this.emailService.sendEmail(data.email, subject, html).catch(error => {
            console.error('Failed to send email:', error);
        });
        return user;
    }
    async changePassword(userId, newPassword) {
        const hashed = await this.hashUtils.hashPassword(newPassword);
        await this.userRepository.update(userId, { password: hashed, isTempPassword: false });
    }
}
//# sourceMappingURL=authService.js.map