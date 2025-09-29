import type { Request, Response } from "express";
export interface IAuthController {
    register(req: Request, res: Response): Promise<void>;
    login(req: Request, res: Response): Promise<void>;
    createSuperAdmin(req: Request, res: Response): Promise<void>;
    createUser(req: Request, res: Response): Promise<void>;
    getAllUsers(req: Request, res: Response): Promise<void>;
}
//# sourceMappingURL=IAuthController.d.ts.map