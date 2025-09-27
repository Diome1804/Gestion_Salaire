import type { Users as User, Role } from "@prisma/client";
export interface IAuthService {
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
//# sourceMappingURL=IAuthService.d.ts.map