import type { Users as User, Role } from "@prisma/client";
import type { IAuthService } from "./IAuthService.js";
import type { IUserRepository } from "../repositories/IUserRepository.js";
import type { IHashUtils } from "../utils/IHashUtils.js";
import type { IJwtUtils } from "../utils/IJwtUtils.js";
import type { IEmailService } from "./IEmailService.js";
export declare class AuthService implements IAuthService {
    private userRepository;
    private hashUtils;
    private jwtUtils;
    private emailService;
    constructor(userRepository: IUserRepository, hashUtils: IHashUtils, jwtUtils: IJwtUtils, emailService: IEmailService);
    registerUser(data: {
        name: string;
        email: string;
        password: string;
    }): Promise<User>;
    loginUser(data: {
        email: string;
        password: string;
    }): Promise<{
        token: string;
        user: User;
    }>;
    createSuperAdmin(data: {
        name: string;
        email: string;
        password: string;
    }): Promise<{
        token: string;
        user: User;
    }>;
    private generateTempPassword;
    createUserBySuperAdmin(data: {
        name: string;
        prenom?: string;
        email: string;
        role: Role;
        companyId: number | null;
    }): Promise<User>;
    changePassword(userId: number, newPassword: string): Promise<void>;
    getAllUsers(): Promise<User[]>;
    deleteUser(userId: number): Promise<void>;
    getCompanyById(companyId: number): Promise<{
        name: string;
        id: number;
        createdAt: Date;
        logo: string | null;
        address: string;
        currency: string;
        periodType: import("@prisma/client").$Enums.PeriodType;
        allowImpersonation: boolean;
        hourlyRate: number;
        dailyRate: number;
        overtimeRate: number;
    } | null>;
    createImpersonationToken(superAdminId: number, companyId: number): Promise<string>;
}
//# sourceMappingURL=authService.d.ts.map