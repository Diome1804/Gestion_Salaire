import type { Request, Response } from "express";
import { createEmployeeSchema, updateEmployeeSchema } from "../validations/employee.js";
import type { IEmployeeController } from "./IEmployeeController.js";
import type { IEmployeeService } from "../services/IEmployeeService.js";

export class EmployeeController implements IEmployeeController {

  constructor(private employeeService: IEmployeeService) {}

  async createEmployee(req: Request, res: Response): Promise<void> {
    try {
      const data = createEmployeeSchema.parse(req.body);
      const caller = (req as any).user;
      // Set companyId for ADMIN
      if (caller.role === "ADMIN") {
        data.companyId = caller.companyId;
      } else if (caller.role === "SUPERADMIN") {
        // SUPERADMIN must provide companyId
        if (!data.companyId) {
          throw new Error("companyId est requis pour SUPERADMIN");
        }
      }
      const employee = await this.employeeService.createEmployee(data as any);
      res.json({ message: "Employé créé", employee });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async updateEmployee(req: Request, res: Response): Promise<void> {
    try {
      if (!req.params.id) throw new Error("ID manquant");
      const id = parseInt(req.params.id);
      if (isNaN(id)) throw new Error("ID invalide");
      const data = updateEmployeeSchema.parse(req.body);
      const caller = (req as any).user;
      // Check if employee belongs to caller's company
      const employee = await this.employeeService.getEmployeeById(id);
      if (!employee) throw new Error("Employé non trouvé");
      if (caller.role === "ADMIN" && employee.companyId !== caller.companyId) {
        throw new Error("Accès refusé");
      }
      const updated = await this.employeeService.updateEmployee(id, data as any);
      res.json({ message: "Employé mis à jour", employee: updated });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async getAllEmployees(req: Request, res: Response): Promise<void> {
    try {
      const caller = (req as any).user;
      const filters: any = {};
      if (req.query.companyId) filters.companyId = parseInt(req.query.companyId as string);
      if (req.query.isActive !== undefined) filters.isActive = req.query.isActive === 'true';
      if (req.query.position) filters.position = req.query.position as string;
      if (req.query.contractType) filters.contractType = req.query.contractType as string;
      // Restrict to own company for ADMIN
      if (caller.role === "ADMIN") {
        filters.companyId = caller.companyId;
      }
      const employees = await this.employeeService.getAllEmployees(filters);
      res.json(employees);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  async getEmployeeById(req: Request, res: Response): Promise<void> {
    try {
      if (!req.params.id) throw new Error("ID manquant");
      const id = parseInt(req.params.id);
      if (isNaN(id)) throw new Error("ID invalide");
      const employee = await this.employeeService.getEmployeeById(id);
      if (!employee) {
        res.status(404).json({ error: "Employé non trouvé" });
        return;
      }
      const caller = (req as any).user;
      if (caller.role === "ADMIN" && employee.companyId !== caller.companyId) {
        res.status(403).json({ error: "Accès refusé" });
        return;
      }
      res.json(employee);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  async deleteEmployee(req: Request, res: Response): Promise<void> {
    try {
      if (!req.params.id) throw new Error("ID manquant");
      const id = parseInt(req.params.id);
      if (isNaN(id)) throw new Error("ID invalide");
      const caller = (req as any).user;
      // Only SUPERADMIN can delete
      if (caller.role !== "SUPERADMIN") {
        res.status(403).json({ error: "Accès refusé" });
        return;
      }
      await this.employeeService.deleteEmployee(id);
      res.json({ message: "Employé supprimé" });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async activateEmployee(req: Request, res: Response): Promise<void> {
    try {
      if (!req.params.id) throw new Error("ID manquant");
      const id = parseInt(req.params.id);
      if (isNaN(id)) throw new Error("ID invalide");
      const caller = (req as any).user;
      const employee = await this.employeeService.getEmployeeById(id);
      if (!employee) throw new Error("Employé non trouvé");
      if (caller.role === "ADMIN" && employee.companyId !== caller.companyId) {
        throw new Error("Accès refusé");
      }
      const updated = await this.employeeService.activateEmployee(id);
      res.json({ message: "Employé activé", employee: updated });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async deactivateEmployee(req: Request, res: Response): Promise<void> {
    try {
      if (!req.params.id) throw new Error("ID manquant");
      const id = parseInt(req.params.id);
      if (isNaN(id)) throw new Error("ID invalide");
      const caller = (req as any).user;
      const employee = await this.employeeService.getEmployeeById(id);
      if (!employee) throw new Error("Employé non trouvé");
      if (caller.role === "ADMIN" && employee.companyId !== caller.companyId) {
        throw new Error("Accès refusé");
      }
      const updated = await this.employeeService.deactivateEmployee(id);
      res.json({ message: "Employé désactivé", employee: updated });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }
}
