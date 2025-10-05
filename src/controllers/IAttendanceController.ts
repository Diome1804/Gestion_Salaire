import type { Request, Response } from "express";

export interface IAttendanceController {
  scanQRCode(req: Request, res: Response): Promise<void>;
  manualCheckIn(req: Request, res: Response): Promise<void>;
  getTodayAttendance(req: Request, res: Response): Promise<void>;
  getEmployeeAttendance(req: Request, res: Response): Promise<void>;
  getAttendanceReport(req: Request, res: Response): Promise<void>;
}