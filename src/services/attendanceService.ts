import type { Attendance } from "@prisma/client";
import type { IAttendanceService } from "./IAttendanceService.js";
import prisma from "../config/prisma.js";

export class AttendanceService implements IAttendanceService {
  async scanQRCode(qrCode: string, scannedBy: number): Promise<{
    message: string;
    type: 'checkin' | 'checkout';
    attendance?: Attendance;
    hoursWorked?: number;
  }> {
    // Find employee by QR code
    const employee = await prisma.employee.findUnique({
      where: { qrCode },
    });

    if (!employee) {
      throw new Error('Code QR invalide ou employé non trouvé');
    }

    if (!employee.isActive) {
      throw new Error('Cet employé est inactif');
    }

    // Get today's date at midnight
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Check if already checked in today
    const existingAttendance = await prisma.attendance.findFirst({
      where: {
        employeeId: employee.id,
        date: {
          gte: today,
        },
      },
    });

    const now = new Date();

    if (existingAttendance) {
      // If already checked in but not checked out, do checkout
      if (existingAttendance.checkInTime && !existingAttendance.checkOutTime) {
        const checkInTime = new Date(existingAttendance.checkInTime);
        const hoursWorked = (now.getTime() - checkInTime.getTime()) / (1000 * 60 * 60);

        const updated = await prisma.attendance.update({
          where: { id: existingAttendance.id },
          data: {
            checkOutTime: now,
            hoursWorked,
          },
        });

        return {
          message: `Au revoir ${employee.fullName}! Sortie enregistrée.`,
          type: 'checkout',
          attendance: updated,
          hoursWorked: parseFloat(hoursWorked.toFixed(2)),
        };
      } else {
        throw new Error('Employé déjà pointé aujourd\'hui');
      }
    }

    // Create new attendance (check-in)
    const attendance = await prisma.attendance.create({
      data: {
        employeeId: employee.id,
        date: today,
        checkInTime: now,
        isPresent: true,
        scannedBy,
      },
    });

    return {
      message: `Bienvenue ${employee.fullName}! Entrée enregistrée.`,
      type: 'checkin',
      attendance,
    };
  }

  async manualCheckIn(data: {
    matricule: string;
    checkInTime: string;
    checkOutTime: string;
    scannedBy: number;
  }): Promise<Attendance> {
    // Find employee by matricule
    const employee = await prisma.employee.findUnique({
      where: { matricule: data.matricule },
    });

    if (!employee) {
      throw new Error('Matricule invalide ou employé non trouvé');
    }

    if (employee.contractType !== 'HONORAIRE') {
      throw new Error('Le pointage manuel est réservé aux employés HONORAIRE');
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Parse times
    const checkInTime = new Date(`${today.toISOString().split('T')[0]}T${data.checkInTime}`);
    const checkOutTime = new Date(`${today.toISOString().split('T')[0]}T${data.checkOutTime}`);
    
    // Calculate hours worked
    const hoursWorked = (checkOutTime.getTime() - checkInTime.getTime()) / (1000 * 60 * 60);

    if (hoursWorked <= 0) {
      throw new Error('L\'heure de sortie doit être après l\'heure d\'entrée');
    }

    // Create attendance
    const attendance = await prisma.attendance.create({
      data: {
        employeeId: employee.id,
        date: today,
        checkInTime,
        checkOutTime,
        hoursWorked,
        isPresent: true,
        scannedBy: data.scannedBy,
      },
    });

    return attendance;
  }

  async getTodayAttendance(companyId: number): Promise<Attendance[]> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const attendance = await prisma.attendance.findMany({
      where: {
        date: {
          gte: today,
        },
        employee: {
          companyId,
        },
      },
      include: {
        employee: {
          select: {
            id: true,
            fullName: true,
            position: true,
            contractType: true,
          },
        },
      },
      orderBy: {
        checkInTime: 'desc',
      },
    });

    return attendance as any;
  }

  async getEmployeeAttendance(employeeId: number, filters?: {
    startDate?: Date;
    endDate?: Date;
    limit?: number;
  }): Promise<Attendance[]> {
    const where: any = {
      employeeId,
    };

    if (filters?.startDate || filters?.endDate) {
      where.date = {};
      if (filters.startDate) where.date.gte = filters.startDate;
      if (filters.endDate) where.date.lte = filters.endDate;
    }

    const attendance = await prisma.attendance.findMany({
      where,
      orderBy: {
        date: 'desc',
      },
      take: filters?.limit || 30,
    });

    return attendance;
  }

  async getAttendanceReport(companyId: number, filters?: {
    startDate?: Date;
    endDate?: Date;
    employeeId?: number;
    contractType?: string;
  }): Promise<Attendance[]> {
    const where: any = {
      employee: {
        companyId,
      },
    };

    if (filters?.startDate || filters?.endDate) {
      where.date = {};
      if (filters.startDate) where.date.gte = filters.startDate;
      if (filters.endDate) where.date.lte = filters.endDate;
    }

    if (filters?.employeeId) {
      where.employeeId = filters.employeeId;
    }

    if (filters?.contractType) {
      where.employee.contractType = filters.contractType;
    }

    const attendance = await prisma.attendance.findMany({
      where,
      include: {
        employee: {
          select: {
            id: true,
            fullName: true,
            position: true,
            contractType: true,
          },
        },
      },
      orderBy: {
        date: 'desc',
      },
    });

    return attendance as any;
  }
}