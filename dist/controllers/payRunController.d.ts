import type { Request, Response } from "express";
import type { IPayRunController } from "./IPayRunController.js";
import type { IPayRunService } from "../services/IPayRunService.js";
import type { IPayslipService } from "../services/IPayslipService.js";
import type { IEmailService } from "../services/IEmailService.js";
export declare class PayRunController implements IPayRunController {
    private payRunService;
    private payslipService;
    private emailService;
    constructor(payRunService: IPayRunService, payslipService: IPayslipService, emailService: IEmailService);
    createPayRun(req: Request, res: Response): Promise<void>;
    getAllPayRuns(req: Request, res: Response): Promise<void>;
    getPayRunById(req: Request, res: Response): Promise<void>;
    updatePayRun(req: Request, res: Response): Promise<void>;
    approvePayRun(req: Request, res: Response): Promise<void>;
    closePayRun(req: Request, res: Response): Promise<void>;
    deletePayRun(req: Request, res: Response): Promise<void>;
    private sendPayslipNotifications;
}
//# sourceMappingURL=payRunController.d.ts.map