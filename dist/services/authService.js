import prisma from "../config/prisma.js";
export class AuthService {
    userRepository;
    hashUtils;
    jwtUtils;
    constructor(userRepository, hashUtils, jwtUtils) {
        this.userRepository = userRepository;
        this.hashUtils = hashUtils;
        this.jwtUtils = jwtUtils;
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
    async createUserBySuperAdmin(data) {
        const existingUser = await this.userRepository.findByEmail(data.email);
        if (existingUser)
            throw new Error("Email déjà utilisé");
        const hashed = await this.hashUtils.hashPassword(data.password);
        const user = await this.userRepository.create({ ...data, password: hashed });
        return user;
    }
}
//# sourceMappingURL=authService.js.map