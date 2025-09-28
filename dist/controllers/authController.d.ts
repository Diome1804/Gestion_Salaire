import type { Request, Response } from "express";
import type { IAuthController } from "./IAuthController.js";
import type { IAuthService } from "../services/IAuthService.js";
export declare class AuthController implements IAuthController {
    private authService;
    constructor(authService: IAuthService);
    register(req: Request, res: Response): Promise<void>;
    login(req: Request, res: Response): Promise<void>;
    createSuperAdmin(req: Request, res: Response): Promise<void>;
    createUser(req: Request, res: Response): Promise<void>;
    changePassword(req: Request, res: Response): Promise<void>;
}
//# sourceMappingURL=authController.d.ts.map