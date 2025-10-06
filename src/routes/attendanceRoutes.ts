import { Router } from "express";
import { AttendanceController } from "../controllers/attendanceController.js";
import { AttendanceService } from "../services/attendanceService.js";
import { authenticate } from "../middlewares/auth.js";
import { requireRole } from "../middlewares/requireRole.js";

const router = Router();

// Initialize service and controller
const attendanceService = new AttendanceService();
const attendanceController = new AttendanceController(attendanceService);

// All routes require authentication
router.use(authenticate);

// Scan QR code (VIGILE only)
router.post(
  "/scan",
  requireRole("VIGILE"),
  (req, res) => attendanceController.scanQRCode(req, res)
);

// Manual check-in for HONORAIRE employees (VIGILE only)
router.post(
  "/manual",
  requireRole("VIGILE"),
  (req, res) => attendanceController.manualCheckIn(req, res)
);

// Get today's attendance (VIGILE only)
router.get(
  "/today",
  requireRole("VIGILE"),
  (req, res) => attendanceController.getTodayAttendance(req, res)
);

// Get employee attendance history
router.get(
  "/employee/:id",
  (req, res) => attendanceController.getEmployeeAttendance(req, res)
);

// Get attendance report (ADMIN and SUPERADMIN)
router.get(
  "/report",
  requireRole(["ADMIN", "SUPERADMIN"]),
  (req, res) => attendanceController.getAttendanceReport(req, res)
);

// Self check-in (authenticated users)
router.post(
  "/checkin",
  (req, res) => attendanceController.selfCheckIn(req, res)
);

// Self check-out (authenticated users)
router.post(
  "/checkout",
  (req, res) => attendanceController.selfCheckOut(req, res)
);

// Start break (authenticated users)
router.post(
  "/break/start",
  (req, res) => attendanceController.startBreak(req, res)
);

// End break (authenticated users)
router.post(
  "/break/end",
  (req, res) => attendanceController.endBreak(req, res)
);

// Get work schedule (authenticated users)
router.get(
  "/schedule",
  (req, res) => attendanceController.getWorkSchedule(req, res)
);

export default router;