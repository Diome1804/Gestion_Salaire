import type { Role } from "@prisma/client";
import type { IJwtUtils } from "./IJwtUtils.js";
export declare class JwtUtils implements IJwtUtils {
    generateToken(payload: {
        id: number;
        role: Role;
    }): string;
    verifyToken(token: string): {
        id: number;
        role: Role;
    };
}
//# sourceMappingURL=jwt.d.ts.map