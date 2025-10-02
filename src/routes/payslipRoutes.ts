import { Router } from "express";
import { payslipController } from "../container.js";
import { authenticate, authorize } from "../middlewares/auth.js";

const router = Router();

// Routes for payslip management - ADMIN, CAISSIER and SUPERADMIN
router.get("/company/:companyId", authenticate, authorize(["SUPERADMIN", "ADMIN", "CAISSIER"]), (req, res) => payslipController.getPayslipsByCompany(req, res));
router.get("/payrun/:payRunId", authenticate, authorize(["SUPERADMIN", "ADMIN"]), (req, res) => payslipController.getPayslipsByPayRun(req, res));
router.get("/employee/:employeeId", authenticate, authorize(["SUPERADMIN", "ADMIN"]), (req, res) => payslipController.getPayslipsByEmployee(req, res));
router.get("/:id", authenticate, authorize(["SUPERADMIN", "ADMIN"]), (req, res) => payslipController.getPayslipById(req, res));
router.put("/:id", authenticate, authorize(["SUPERADMIN", "ADMIN"]), (req, res) => payslipController.updatePayslip(req, res));


router.get("/:id/pdf", authenticate, authorize(["SUPERADMIN", "ADMIN"]), (req, res) => payslipController.exportPayslipPDF(req, res));
router.get("/payrun/:payRunId/pdf", authenticate, authorize(["SUPERADMIN", "ADMIN"]), (req, res) => payslipController.exportPayRunPayslipsPDF(req, res));

export default router;

