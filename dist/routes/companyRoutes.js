import { Router } from "express";
import multer from "multer";
import { companyController } from "../container.js";
import { authenticate, authorize } from "../middlewares/auth.js";
const router = Router();
const upload = multer({ storage: multer.memoryStorage() });
// Routes for company CRUD - only superadmin
router.post("/create", authenticate, authorize(["SUPERADMIN"]), upload.single("logo"), (req, res) => companyController.createCompany(req, res));
router.get("/:id", authenticate, authorize(["SUPERADMIN"]), (req, res) => companyController.getCompany(req, res));
router.put("/:id", authenticate, authorize(["SUPERADMIN"]), upload.single("logo"), (req, res) => companyController.updateCompany(req, res));
router.delete("/:id", authenticate, authorize(["SUPERADMIN"]), (req, res) => companyController.deleteCompany(req, res));
router.get("/", authenticate, authorize(["SUPERADMIN"]), (req, res) => companyController.getAllCompanies(req, res));
export default router;
//# sourceMappingURL=companyRoutes.js.map