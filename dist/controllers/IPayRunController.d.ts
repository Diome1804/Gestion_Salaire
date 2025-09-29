import type { Request, Response } from "express";
export interface IPayRunController {
    createPayRun(req: Request, res: Response): Promise<void>;
    getAllPayRuns(req: Request, res: Response): Promise<void>;
    getPayRunById(req: Request, res: Response): Promise<void>;
    updatePayRun(req: Request, res: Response): Promise<void>;
    approvePayRun(req: Request, res: Response): Promise<void>;
    closePayRun(req: Request, res: Response): Promise<void>;
    deletePayRun(req: Request, res: Response): Promise<void>;
}
//# sourceMappingURL=IPayRunController.d.ts.map