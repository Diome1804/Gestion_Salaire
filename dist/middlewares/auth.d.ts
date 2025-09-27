import type { Request, Response, NextFunction } from "express";
import type { Role } from "@prisma/client";
export declare const authenticate: (req: Request, res: Response, next: NextFunction) => void;
export declare const authorize: (roles: Role[]) => (req: Request, res: Response, next: NextFunction) => void;
//# sourceMappingURL=auth.d.ts.map