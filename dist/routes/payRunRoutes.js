import { Router } from "express";
import { payRunController } from "../container.js";
import { authenticate, authorize } from "../middlewares/auth.js";
const router = Router();
// All routes require authentication
router.use(authenticate);
// Create payrun - SUPERADMIN or ADMIN
router.post("/", authorize(["SUPERADMIN", "ADMIN"]), payRunController.createPayRun.bind(payRunController));
// Get all payruns with filters - SUPERADMIN or ADMIN
router.get("/", authorize(["SUPERADMIN", "ADMIN"]), payRunController.getAllPayRuns.bind(payRunController));
// Get payrun by ID - SUPERADMIN or ADMIN of the company
router.get("/:id", authorize(["SUPERADMIN", "ADMIN"]), payRunController.getPayRunById.bind(payRunController));
// Update payrun - SUPERADMIN or ADMIN of the company
router.put("/:id", authorize(["SUPERADMIN", "ADMIN"]), payRunController.updatePayRun.bind(payRunController));
// Approve payrun - SUPERADMIN or ADMIN of the company
router.patch("/:id/approve", authorize(["SUPERADMIN", "ADMIN"]), payRunController.approvePayRun.bind(payRunController));
// Close payrun - SUPERADMIN or ADMIN of the company
router.patch("/:id/close", authorize(["SUPERADMIN", "ADMIN"]), payRunController.closePayRun.bind(payRunController));
// Delete payrun - SUPERADMIN only
router.delete("/:id", authorize(["SUPERADMIN"]), payRunController.deletePayRun.bind(payRunController));
export default router;
//# sourceMappingURL=payRunRoutes.js.map