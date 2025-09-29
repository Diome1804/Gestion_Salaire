import type { Users as User, Role } from "@prisma/client";
export interface IUserRepository {
    findByEmail(email: string): Promise<User | null>;
    create(data: {
        name: string;
        email: string;
        password: string;
        role?: Role;
        companyId?: number | null;
        isTempPassword?: boolean;
    }): Promise<User>;
    update(id: number, data: Partial<{
        name: string;
        email: string;
        password: string;
        role: Role;
        companyId: number | null;
        isTempPassword: boolean;
    }>): Promise<User>;
    findAll(): Promise<User[]>;
}
//# sourceMappingURL=IUserRepository.d.ts.map