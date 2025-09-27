import type { Role } from "@prisma/client";
export interface IJwtUtils {
    generateToken(payload: {
        id: number;
        role: Role;
    }): string;
    verifyToken(token: string): {
        id: number;
        role: Role;
    };
}
//# sourceMappingURL=IJwtUtils.d.ts.map