import type { Role } from "@prisma/client";
export interface IJwtUtils {
    generateToken(payload: {
        id: number;
        role: Role;
    }): string;
}
//# sourceMappingURL=IJwtUtils.d.ts.map