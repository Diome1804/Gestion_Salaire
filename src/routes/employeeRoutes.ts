import { Router } from "express";
import { employeeController } from "../container.js";
import { authenticate, authorize } from "../middlewares/auth.js";

const router = Router();

// All routes require authentication
router.use(authenticate);

// Create employee - SUPERADMIN or ADMIN
router.post("/", authorize(["SUPERADMIN", "ADMIN"]), employeeController.createEmployee.bind(employeeController));

// Get all employees with filters - SUPERADMIN or ADMIN
router.get("/", authorize(["SUPERADMIN", "ADMIN"]), employeeController.getAllEmployees.bind(employeeController));

// Get employee by ID - SUPERADMIN or ADMIN of the company
router.get("/:id", authorize(["SUPERADMIN", "ADMIN"]), employeeController.getEmployeeById.bind(employeeController));

// Update employee - SUPERADMIN or ADMIN of the company
router.put("/:id", authorize(["SUPERADMIN", "ADMIN"]), employeeController.updateEmployee.bind(employeeController));

// Activate employee - SUPERADMIN or ADMIN of the company
router.patch("/:id/activate", authorize(["SUPERADMIN", "ADMIN"]), employeeController.activateEmployee.bind(employeeController));

// Deactivate employee - SUPERADMIN or ADMIN of the company
router.patch("/:id/deactivate", authorize(["SUPERADMIN", "ADMIN"]), employeeController.deactivateEmployee.bind(employeeController));

// Delete employee - SUPERADMIN only
router.delete("/:id", authorize(["SUPERADMIN"]), employeeController.deleteEmployee.bind(employeeController));

export default router;
