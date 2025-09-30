import { Router } from "express";
import { payslipController } from "../container.js";
import { authenticate, authorize } from "../middlewares/auth.js";
const router = Router();
// Routes for payslip management - ADMIN and SUPERADMIN
router.get("/payrun/:payRunId", authenticate, authorize(["SUPERADMIN", "ADMIN"]), (req, res) => payslipController.getPayslipsByPayRun(req, res));
router.get("/employee/:employeeId", authenticate, authorize(["SUPERADMIN", "ADMIN"]), (req, res) => payslipController.getPayslipsByEmployee(req, res));
router.get("/:id", authenticate, authorize(["SUPERADMIN", "ADMIN"]), (req, res) => payslipController.getPayslipById(req, res));
router.put("/:id", authenticate, authorize(["SUPERADMIN", "ADMIN"]), (req, res) => payslipController.updatePayslip(req, res));
// PDF export r/info?id=1outes (to be implemented)
router.get("/:id/pdf", authenticate, authorize(["SUPERADMIN", "ADMIN"]), (req, res) => payslipController.exportPayslipPDF(req, res));
router.get("/payrun/:payRunId/pdf", authenticate, authorize(["SUPERADMIN", "ADMIN"]), (req, res) => payslipController.exportPayRunPayslipsPDF(req, res));
export default router;
//# sourceMappingURL=payslipRoutes.js.map