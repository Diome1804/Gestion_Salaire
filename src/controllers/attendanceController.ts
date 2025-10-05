import type { Request, Response } from "express";
import type { IAttendanceController } from "./IAttendanceController.js";
import type { IAttendanceService } from "../services/IAttendanceService.js";

export class AttendanceController implements IAttendanceController {
  constructor(private attendanceService: IAttendanceService) {}

  async scanQRCode(req: Request, res: Response): Promise<void> {
    try {
      const { qrCode } = req.body;
      const scannedBy = (req as any).user.id;

      if (!qrCode) {
        res.status(400).json({ message: 'Code QR requis' });
        return;
      }

      const result = await this.attendanceService.scanQRCode(qrCode, scannedBy);
      res.json(result);
    } catch (error: any) {
      console.error('Error scanning QR code:', error);
      res.status(400).json({ message: error.message });
    }
  }

  async manualCheckIn(req: Request, res: Response): Promise<void> {
    try {
      const { matricule, checkInTime, checkOutTime } = req.body;
      const scannedBy = (req as any).user.id;

      if (!matricule || !checkInTime || !checkOutTime) {
        res.status(400).json({ message: 'Matricule, heure d\'entrée et heure de sortie requis' });
        return;
      }

      const attendance = await this.attendanceService.manualCheckIn({
        matricule,
        checkInTime,
        checkOutTime,
        scannedBy,
      });

      res.json({
        message: 'Pointage manuel enregistré avec succès',
        attendance,
      });
    } catch (error: any) {
      console.error('Error manual check-in:', error);
      res.status(400).json({ message: error.message });
    }
  }

  async getTodayAttendance(req: Request, res: Response): Promise<void> {
    try {
      const companyId = (req as any).user.companyId;

      if (!companyId) {
        res.status(400).json({ message: 'Company ID requis' });
        return;
      }

      const attendance = await this.attendanceService.getTodayAttendance(companyId);
      res.json(attendance);
    } catch (error: any) {
      console.error('Error fetching today attendance:', error);
      res.status(500).json({ message: error.message });
    }
  }

  async getEmployeeAttendance(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { startDate, endDate, limit } = req.query;

      if (!id) {
        res.status(400).json({ message: 'Employee ID requis' });
        return;
      }

      const filters: any = {};
      if (startDate) filters.startDate = new Date(startDate as string);
      if (endDate) filters.endDate = new Date(endDate as string);
      if (limit) filters.limit = parseInt(limit as string);

      const attendance = await this.attendanceService.getEmployeeAttendance(
        parseInt(id),
        filters
      );

      res.json(attendance);
    } catch (error: any) {
      console.error('Error fetching employee attendance:', error);
      res.status(500).json({ message: error.message });
    }
  }

  async getAttendanceReport(req: Request, res: Response): Promise<void> {
    try {
      const companyId = (req as any).user.companyId;
      const { startDate, endDate, employeeId, contractType } = req.query;

      if (!companyId) {
        res.status(400).json({ message: 'Company ID requis' });
        return;
      }

      const filters: any = {};
      if (startDate) filters.startDate = new Date(startDate as string);
      if (endDate) filters.endDate = new Date(endDate as string);
      if (employeeId) filters.employeeId = parseInt(employeeId as string);
      if (contractType) filters.contractType = contractType as string;

      const attendance = await this.attendanceService.getAttendanceReport(
        companyId,
        filters
      );

      res.json(attendance);
    } catch (error: any) {
      console.error('Error fetching attendance report:', error);
      res.status(500).json({ message: error.message });
    }
  }
}