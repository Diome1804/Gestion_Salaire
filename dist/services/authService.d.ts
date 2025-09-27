import type { Users as User, Role } from "@prisma/client";
import type { IAuthService } from "./IAuthService.js";
import type { IUserRepository } from "../repositories/IUserRepository.js";
import type { IHashUtils } from "../utils/IHashUtils.js";
import type { IJwtUtils } from "../utils/IJwtUtils.js";
export declare class AuthService implements IAuthService {
    private userRepository;
    private hashUtils;
    private jwtUtils;
    constructor(userRepository: IUserRepository, hashUtils: IHashUtils, jwtUtils: IJwtUtils);
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
    createUserBySuperAdmin(data: {
        name: string;
        email: string;
        password: string;
        role: Role;
        companyId: number;
    }): Promise<User>;
}
//# sourceMappingURL=authService.d.ts.map