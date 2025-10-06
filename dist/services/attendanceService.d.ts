import type { Attendance, WorkSchedule, Break } from "@prisma/client";
import type { IAttendanceService } from "./IAttendanceService.js";
export declare class AttendanceService implements IAttendanceService {
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
    selfCheckIn(employeeId: number): Promise<{
        message: string;
        attendance: Attendance;
    }>;
    selfCheckOut(employeeId: number): Promise<{
        message: string;
        attendance: Attendance;
        hoursWorked: number;
        overtimeHours: number;
    }>;
    startBreak(attendanceId: number, type?: string): Promise<Break>;
    endBreak(breakId: number): Promise<Break>;
    getWorkSchedule(employeeId: number): Promise<WorkSchedule[]>;
}
//# sourceMappingURL=attendanceService.d.ts.map