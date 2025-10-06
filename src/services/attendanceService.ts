import type { Attendance, WorkSchedule, Break } from "@prisma/client";
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

  async selfCheckIn(employeeId: number): Promise<{
    message: string;
    attendance: Attendance;
  }> {
    // Check if employee exists and is active
    const employee = await prisma.employee.findUnique({
      where: { id: employeeId },
    });

    if (!employee || !employee.isActive) {
      throw new Error('Employé non trouvé ou inactif');
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Check if already checked in today
    const existingAttendance = await prisma.attendance.findFirst({
      where: {
        employeeId,
        date: {
          gte: today,
        },
      },
    });

    if (existingAttendance) {
      throw new Error('Vous avez déjà pointé aujourd\'hui');
    }

    // Create attendance
    const attendance = await prisma.attendance.create({
      data: {
        employeeId,
        date: today,
        checkInTime: new Date(),
        isPresent: true,
      },
    });

    return {
      message: `Bienvenue ${employee.fullName}! Entrée enregistrée.`,
      attendance,
    };
  }

  async selfCheckOut(employeeId: number): Promise<{
    message: string;
    attendance: Attendance;
    hoursWorked: number;
    overtimeHours: number;
  }> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const attendance = await prisma.attendance.findFirst({
      where: {
        employeeId,
        date: {
          gte: today,
        },
      },
      include: {
        breaks: true,
      },
    }) as any;

    if (!attendance || !attendance.checkInTime) {
      throw new Error('Aucune entrée trouvée pour aujourd\'hui');
    }

    if (attendance.checkOutTime) {
      throw new Error('Vous avez déjà quitté aujourd\'hui');
    }

    const checkOutTime = new Date();
    const checkInTime = new Date(attendance.checkInTime);

    // Calculate total break time
    let totalBreakHours = 0;
    for (const breakItem of attendance.breaks) {
      if (breakItem.endTime) {
        totalBreakHours += (new Date(breakItem.endTime).getTime() - new Date(breakItem.startTime).getTime()) / (1000 * 60 * 60);
      }
    }

    const grossHours = (checkOutTime.getTime() - checkInTime.getTime()) / (1000 * 60 * 60);
    const netHoursWorked = grossHours - totalBreakHours;

    // Get work schedule for today
    const dayOfWeek = today.getDay(); // 0 = Sunday
    const schedule = await prisma.workSchedule.findFirst({
      where: {
        employeeId,
        dayOfWeek,
        isActive: true,
      },
    });

    let overtimeHours = 0;
    if (schedule) {
      const startParts = schedule.startTime.split(':');
      const endParts = schedule.endTime.split(':');
      if (startParts.length === 2 && endParts.length === 2) {
        const startHour = parseInt(startParts[0] || '0');
        const startMin = parseInt(startParts[1] || '0');
        const endHour = parseInt(endParts[0] || '0');
        const endMin = parseInt(endParts[1] || '0');
        const scheduledHours = (endHour * 60 + endMin - (startHour * 60 + startMin)) / 60;
        if (netHoursWorked > scheduledHours) {
          overtimeHours = netHoursWorked - scheduledHours;
        }
      }
    }

    // Update attendance
    const updatedAttendance = await prisma.attendance.update({
      where: { id: attendance.id },
      data: {
        checkOutTime,
        hoursWorked: netHoursWorked,
        overtimeHours,
      },
    });

    const employee = await prisma.employee.findUnique({
      where: { id: employeeId },
      select: { fullName: true },
    });

    return {
      message: `Au revoir ${employee?.fullName}! Sortie enregistrée.`,
      attendance: updatedAttendance,
      hoursWorked: parseFloat(netHoursWorked.toFixed(2)),
      overtimeHours: parseFloat(overtimeHours.toFixed(2)),
    };
  }

  async startBreak(attendanceId: number, type: string = 'break'): Promise<Break> {
    // Check if attendance exists and is active (checked in but not out)
    const attendance = await prisma.attendance.findUnique({
      where: { id: attendanceId },
    });

    if (!attendance || !attendance.checkInTime || attendance.checkOutTime) {
      throw new Error('Pointage invalide pour commencer une pause');
    }

    // Check if there's an ongoing break
    const ongoingBreak = await prisma.break.findFirst({
      where: {
        attendanceId,
        endTime: null,
      },
    });

    if (ongoingBreak) {
      throw new Error('Une pause est déjà en cours');
    }

    const breakItem = await prisma.break.create({
      data: {
        attendanceId,
        startTime: new Date(),
        type,
      },
    });

    return breakItem;
  }

  async endBreak(breakId: number): Promise<Break> {
    const breakItem = await prisma.break.findUnique({
      where: { id: breakId },
    });

    if (!breakItem || breakItem.endTime) {
      throw new Error('Pause non trouvée ou déjà terminée');
    }

    const endTime = new Date();
    const duration = (endTime.getTime() - new Date(breakItem.startTime).getTime()) / (1000 * 60 * 60);

    const updatedBreak = await prisma.break.update({
      where: { id: breakId },
      data: {
        endTime,
        duration,
      },
    });

    return updatedBreak;
  }

  async getWorkSchedule(employeeId: number): Promise<WorkSchedule[]> {
    const schedules = await prisma.workSchedule.findMany({
      where: {
        employeeId,
        isActive: true,
      },
      orderBy: {
        dayOfWeek: 'asc',
      },
    });

    return schedules;
  }
}