import type { Request, Response } from "express";

export interface IAttendanceController {
  scanQRCode(req: Request, res: Response): Promise<void>;
  manualCheckIn(req: Request, res: Response): Promise<void>;
  selfCheckIn(req: Request, res: Response): Promise<void>;
  selfCheckOut(req: Request, res: Response): Promise<void>;
  startBreak(req: Request, res: Response): Promise<void>;
  endBreak(req: Request, res: Response): Promise<void>;
  getWorkSchedule(req: Request, res: Response): Promise<void>;
  getTodayAttendance(req: Request, res: Response): Promise<void>;
  getEmployeeAttendance(req: Request, res: Response): Promise<void>;
  getAttendanceReport(req: Request, res: Response): Promise<void>;
}