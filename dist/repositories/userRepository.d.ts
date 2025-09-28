import type { Users as User, Role } from "@prisma/client";
import type { IUserRepository } from "./IUserRepository.js";
export declare class UserRepository implements IUserRepository {
    findByEmail(email: string): Promise<User | null>;
    create(data: {
        name: string;
        email: string;
        password: string;
        role?: Role;
        companyId?: number;
        isTempPassword?: boolean;
    }): Promise<User>;
    update(id: number, data: Partial<{
        name: string;
        email: string;
        password: string;
        role: Role;
        companyId: number;
        isTempPassword: boolean;
    }>): Promise<User>;
}
//# sourceMappingURL=userRepository.d.ts.map