import type { Attendance } from "@prisma/client";

export interface IAttendanceService {
  scanQRCode(qrCode: string, scannedBy: number): Promise<{
    message: string;
    type: 'checkin' | 'checkout';
    attendance?: Attendance;
    hoursWorked?: number;
  }>;
  
  manualCheckIn(data: {
    matricule: string;
    checkInTime: string;
    checkOutTime: string;
    scannedBy: number;
  }): Promise<Attendance>;
  
  getTodayAttendance(companyId: number): Promise<Attendance[]>;
  
  getEmployeeAttendance(employeeId: number, filters?: {
    startDate?: Date;
    endDate?: Date;
    limit?: number;
  }): Promise<Attendance[]>;
  
  getAttendanceReport(companyId: number, filters?: {
    startDate?: Date;
    endDate?: Date;
    employeeId?: number;
    contractType?: string;
  }): Promise<Attendance[]>;
}