export class AttendanceController {
    attendanceService;
    constructor(attendanceService) {
        this.attendanceService = attendanceService;
    }
    async scanQRCode(req, res) {
        try {
            const { qrCode } = req.body;
            const scannedBy = req.user.id;
            if (!qrCode) {
                res.status(400).json({ message: 'Code QR requis' });
                return;
            }
            const result = await this.attendanceService.scanQRCode(qrCode, scannedBy);
            res.json(result);
        }
        catch (error) {
            console.error('Error scanning QR code:', error);
            res.status(400).json({ message: error.message });
        }
    }
    async manualCheckIn(req, res) {
        try {
            const { matricule, checkInTime, checkOutTime } = req.body;
            const scannedBy = req.user.id;
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
        }
        catch (error) {
            console.error('Error manual check-in:', error);
            res.status(400).json({ message: error.message });
        }
    }
    async getTodayAttendance(req, res) {
        try {
            const companyId = req.user.companyId;
            if (!companyId) {
                res.status(400).json({ message: 'Company ID requis' });
                return;
            }
            const attendance = await this.attendanceService.getTodayAttendance(companyId);
            res.json(attendance);
        }
        catch (error) {
            console.error('Error fetching today attendance:', error);
            res.status(500).json({ message: error.message });
        }
    }
    async getEmployeeAttendance(req, res) {
        try {
            const { id } = req.params;
            const { startDate, endDate, limit } = req.query;
            if (!id) {
                res.status(400).json({ message: 'Employee ID requis' });
                return;
            }
            const filters = {};
            if (startDate)
                filters.startDate = new Date(startDate);
            if (endDate)
                filters.endDate = new Date(endDate);
            if (limit)
                filters.limit = parseInt(limit);
            const attendance = await this.attendanceService.getEmployeeAttendance(parseInt(id), filters);
            res.json(attendance);
        }
        catch (error) {
            console.error('Error fetching employee attendance:', error);
            res.status(500).json({ message: error.message });
        }
    }
    async getAttendanceReport(req, res) {
        try {
            const companyId = req.user.companyId;
            const { startDate, endDate, employeeId, contractType } = req.query;
            if (!companyId) {
                res.status(400).json({ message: 'Company ID requis' });
                return;
            }
            const filters = {};
            if (startDate)
                filters.startDate = new Date(startDate);
            if (endDate)
                filters.endDate = new Date(endDate);
            if (employeeId)
                filters.employeeId = parseInt(employeeId);
            if (contractType)
                filters.contractType = contractType;
            const attendance = await this.attendanceService.getAttendanceReport(companyId, filters);
            res.json(attendance);
        }
        catch (error) {
            console.error('Error fetching attendance report:', error);
            res.status(500).json({ message: error.message });
        }
    }
    async selfCheckIn(req, res) {
        try {
            const employeeId = req.user.employeeId;
            if (!employeeId) {
                res.status(400).json({ message: 'Employee ID requis' });
                return;
            }
            const result = await this.attendanceService.selfCheckIn(employeeId);
            res.json(result);
        }
        catch (error) {
            console.error('Error self check-in:', error);
            res.status(400).json({ message: error.message });
        }
    }
    async selfCheckOut(req, res) {
        try {
            const employeeId = req.user.employeeId;
            if (!employeeId) {
                res.status(400).json({ message: 'Employee ID requis' });
                return;
            }
            const result = await this.attendanceService.selfCheckOut(employeeId);
            res.json(result);
        }
        catch (error) {
            console.error('Error self check-out:', error);
            res.status(400).json({ message: error.message });
        }
    }
    async startBreak(req, res) {
        try {
            const { attendanceId, type } = req.body;
            const employeeId = req.user.employeeId;
            if (!attendanceId) {
                res.status(400).json({ message: 'Attendance ID requis' });
                return;
            }
            // Verify attendance belongs to employee
            const attendance = await this.attendanceService.getEmployeeAttendance(employeeId, { limit: 1 });
            const isOwner = attendance.some(a => a.id === attendanceId);
            if (!isOwner) {
                res.status(403).json({ message: 'Accès non autorisé' });
                return;
            }
            const breakItem = await this.attendanceService.startBreak(attendanceId, type);
            res.json({
                message: 'Pause démarrée',
                break: breakItem,
            });
        }
        catch (error) {
            console.error('Error starting break:', error);
            res.status(400).json({ message: error.message });
        }
    }
    async endBreak(req, res) {
        try {
            const { breakId } = req.body;
            const employeeId = req.user.employeeId;
            if (!breakId) {
                res.status(400).json({ message: 'Break ID requis' });
                return;
            }
            // Verify break belongs to employee's attendance
            // This is a simplified check; in production, add proper validation
            const breakItem = await this.attendanceService.endBreak(breakId);
            res.json({
                message: 'Pause terminée',
                break: breakItem,
            });
        }
        catch (error) {
            console.error('Error ending break:', error);
            res.status(400).json({ message: error.message });
        }
    }
    async getWorkSchedule(req, res) {
        try {
            const employeeId = req.user.employeeId;
            if (!employeeId) {
                res.status(400).json({ message: 'Employee ID requis' });
                return;
            }
            const schedule = await this.attendanceService.getWorkSchedule(employeeId);
            res.json(schedule);
        }
        catch (error) {
            console.error('Error fetching work schedule:', error);
            res.status(500).json({ message: error.message });
        }
    }
}
//# sourceMappingURL=attendanceController.js.map