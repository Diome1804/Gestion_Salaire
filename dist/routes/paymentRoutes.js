import { Router } from "express";
import { paymentController } from "../container.js";
import { authenticate, authorize } from "../middlewares/auth.js";
const router = Router();
// Routes pour la gestion des paiements - CAISSIER et ADMIN
router.get("/payslip/:payslipId", authenticate, authorize(["CAISSIER", "ADMIN"]), (req, res) => paymentController.getPaymentsByPayslip(req, res));
router.get("/company/:companyId", authenticate, authorize(["CAISSIER", "ADMIN"]), (req, res) => paymentController.getPaymentsByCompany(req, res));
router.get("/:id", authenticate, authorize(["CAISSIER", "ADMIN"]), (req, res) => paymentController.getPaymentById(req, res));
// Création et modification de paiements - CAISSIER seulement
router.post("/", authenticate, authorize(["CAISSIER"]), (req, res) => paymentController.createPayment(req, res));
router.put("/:id", authenticate, authorize(["CAISSIER"]), (req, res) => paymentController.updatePayment(req, res));
router.delete("/:id", authenticate, authorize(["CAISSIER"]), (req, res) => paymentController.deletePayment(req, res));
// Export PDF - CAISSIER et ADMIN
router.get("/:paymentId/receipt", authenticate, authorize(["CAISSIER", "ADMIN"]), (req, res) => paymentController.generatePaymentReceipt(req, res));
router.get("/company/:companyId/list", authenticate, authorize(["CAISSIER", "ADMIN"]), (req, res) => paymentController.generatePaymentList(req, res));
router.get("/company/:companyId/payrun/:payRunId/register", authenticate, authorize(["CAISSIER", "ADMIN"]), (req, res) => paymentController.generatePayrollRegister(req, res));
export default router;
//# sourceMappingURL=paymentRoutes.js.map