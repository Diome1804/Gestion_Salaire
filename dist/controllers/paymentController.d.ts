import type { Request, Response } from "express";
import type { IPaymentController } from "./IPaymentController.js";
import type { IPaymentService } from "../services/IPaymentService.js";
export declare class PaymentController implements IPaymentController {
    private paymentService;
    constructor(paymentService: IPaymentService);
    getPaymentById(req: Request, res: Response): Promise<void>;
    getPaymentsByPayslip(req: Request, res: Response): Promise<void>;
    getPaymentsByCompany(req: Request, res: Response): Promise<void>;
    createPayment(req: Request, res: Response): Promise<void>;
    updatePayment(req: Request, res: Response): Promise<void>;
    deletePayment(req: Request, res: Response): Promise<void>;
    generatePaymentReceipt(req: Request, res: Response): Promise<void>;
    generatePaymentList(req: Request, res: Response): Promise<void>;
    generatePayrollRegister(req: Request, res: Response): Promise<void>;
}
//# sourceMappingURL=paymentController.d.ts.map