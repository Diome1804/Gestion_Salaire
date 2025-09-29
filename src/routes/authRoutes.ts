import { Router } from "express";
import { authController } from "../container.js";
import { authenticate, authorize } from "../middlewares/auth.js";

const router = Router();

router.post("/register", authController.register.bind(authController));
router.post("/login", authController.login.bind(authController));
//createSuperAdmin
router.post("/create-superadmin", authController.createSuperAdmin.bind(authController));
router.post("/create-user", authenticate, authorize(["SUPERADMIN", "ADMIN"]), authController.createUser.bind(authController));
router.get("/users", authenticate, authorize(["SUPERADMIN"]), authController.getAllUsers.bind(authController));
router.post("/change-password", authenticate, authController.changePassword.bind(authController));

export default router;
