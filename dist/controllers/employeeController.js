import { createEmployeeSchema, updateEmployeeSchema } from "../validations/employee.js";
import { v4 as uuidv4 } from 'uuid';
import prisma from "../config/prisma.js";
export class EmployeeController {
    employeeService;
    emailService;
    constructor(employeeService, emailService) {
        this.employeeService = employeeService;
        this.emailService = emailService;
    }
    async createEmployee(req, res) {
        try {
            const data = createEmployeeSchema.parse(req.body);
            const caller = req.user;
            // Validate email is provided
            if (!data.email || !data.email.trim()) {
                res.status(400).json({ error: "L'email est obligatoire pour tous les employés" });
                return;
            }
            // Set companyId for ADMIN
            if (caller.role === "ADMIN") {
                data.companyId = caller.companyId;
            }
            else if (caller.role === "SUPERADMIN") {
                // SUPERADMIN must provide companyId
                if (!data.companyId) {
                    throw new Error("companyId est requis pour SUPERADMIN");
                }
            }
            const employee = await this.employeeService.createEmployee(data);
            // Automatically generate QR code after employee creation
            try {
                const { v4: uuidv4 } = await import('uuid');
                const qrCode = `EMP-${employee.id}-${uuidv4()}`;
                await prisma.employee.update({
                    where: { id: employee.id },
                    data: { qrCode },
                });
                // Send QR code by email
                if (this.emailService) {
                    await this.emailService.sendQRCode(employee, qrCode);
                }
                res.json({
                    message: "Employé créé et code QR envoyé par email",
                    employee: { ...employee, qrCode },
                    qrCodeSent: true
                });
            }
            catch (qrError) {
                console.error('Error generating/sending QR code:', qrError);
                res.json({
                    message: "Employé créé mais erreur lors de l'envoi du code QR",
                    employee,
                    qrCodeSent: false
                });
            }
        }
        catch (error) {
            res.status(400).json({ error: error.message });
        }
    }
    async updateEmployee(req, res) {
        try {
            if (!req.params.id)
                throw new Error("ID manquant");
            const id = parseInt(req.params.id);
            if (isNaN(id))
                throw new Error("ID invalide");
            const data = updateEmployeeSchema.parse(req.body);
            const caller = req.user;
            // Check if employee belongs to caller's company
            const employee = await this.employeeService.getEmployeeById(id);
            if (!employee)
                throw new Error("Employé non trouvé");
            if (caller.role === "ADMIN" && employee.companyId !== caller.companyId) {
                throw new Error("Accès refusé");
            }
            const updated = await this.employeeService.updateEmployee(id, data);
            res.json({ message: "Employé mis à jour", employee: updated });
        }
        catch (error) {
            res.status(400).json({ error: error.message });
        }
    }
    async getAllEmployees(req, res) {
        try {
            const caller = req.user;
            const filters = {};
            if (req.query.companyId)
                filters.companyId = parseInt(req.query.companyId);
            if (req.query.isActive !== undefined)
                filters.isActive = req.query.isActive === 'true';
            if (req.query.position)
                filters.position = req.query.position;
            if (req.query.contractType)
                filters.contractType = req.query.contractType;
            // Restrict to own company for ADMIN
            if (caller.role === "ADMIN") {
                filters.companyId = caller.companyId;
            }
            const employees = await this.employeeService.getAllEmployees(filters);
            res.json(employees);
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
    async getEmployeeById(req, res) {
        try {
            if (!req.params.id)
                throw new Error("ID manquant");
            const id = parseInt(req.params.id);
            if (isNaN(id))
                throw new Error("ID invalide");
            const employee = await this.employeeService.getEmployeeById(id);
            if (!employee) {
                res.status(404).json({ error: "Employé non trouvé" });
                return;
            }
            const caller = req.user;
            if (caller.role === "ADMIN" && employee.companyId !== caller.companyId) {
                res.status(403).json({ error: "Accès refusé" });
                return;
            }
            res.json(employee);
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
    async deleteEmployee(req, res) {
        try {
            if (!req.params.id)
                throw new Error("ID manquant");
            const id = parseInt(req.params.id);
            if (isNaN(id))
                throw new Error("ID invalide");
            const caller = req.user;
            // Only SUPERADMIN can delete
            if (caller.role !== "SUPERADMIN") {
                res.status(403).json({ error: "Accès refusé" });
                return;
            }
            await this.employeeService.deleteEmployee(id);
            res.json({ message: "Employé supprimé" });
        }
        catch (error) {
            res.status(400).json({ error: error.message });
        }
    }
    async activateEmployee(req, res) {
        try {
            if (!req.params.id)
                throw new Error("ID manquant");
            const id = parseInt(req.params.id);
            if (isNaN(id))
                throw new Error("ID invalide");
            const caller = req.user;
            const employee = await this.employeeService.getEmployeeById(id);
            if (!employee)
                throw new Error("Employé non trouvé");
            if (caller.role === "ADMIN" && employee.companyId !== caller.companyId) {
                throw new Error("Accès refusé");
            }
            const updated = await this.employeeService.activateEmployee(id);
            res.json({ message: "Employé activé", employee: updated });
        }
        catch (error) {
            res.status(400).json({ error: error.message });
        }
    }
    async deactivateEmployee(req, res) {
        try {
            if (!req.params.id)
                throw new Error("ID manquant");
            const id = parseInt(req.params.id);
            if (isNaN(id))
                throw new Error("ID invalide");
            const caller = req.user;
            const employee = await this.employeeService.getEmployeeById(id);
            if (!employee)
                throw new Error("Employé non trouvé");
            if (caller.role === "ADMIN" && employee.companyId !== caller.companyId) {
                throw new Error("Accès refusé");
            }
            const updated = await this.employeeService.deactivateEmployee(id);
            res.json({ message: "Employé désactivé", employee: updated });
        }
        catch (error) {
            res.status(400).json({ error: error.message });
        }
    }
    async generateQRCode(req, res) {
        try {
            const { id } = req.params;
            if (!id)
                throw new Error("ID manquant");
            const employeeId = parseInt(id);
            if (isNaN(employeeId))
                throw new Error("ID invalide");
            const employee = await prisma.employee.findUnique({
                where: { id: employeeId },
            });
            if (!employee) {
                res.status(404).json({ message: 'Employé non trouvé' });
                return;
            }
            if (!employee.email) {
                res.status(400).json({
                    message: 'L\'employé doit avoir une adresse email pour recevoir le code QR'
                });
                return;
            }
            // Generate unique QR code
            const qrCode = `EMP-${employee.id}-${uuidv4()}`;
            // Update employee with QR code
            await prisma.employee.update({
                where: { id: employeeId },
                data: { qrCode },
            });
            // Send QR code by email
            if (this.emailService) {
                await this.emailService.sendQRCode(employee, qrCode);
            }
            res.json({
                message: 'Code QR généré et envoyé par email avec succès',
                qrCodeSent: true,
            });
        }
        catch (error) {
            console.error('Error generating QR code:', error);
            res.status(500).json({ message: error.message || 'Erreur lors de la génération du code QR' });
        }
    }
    async getQRCode(req, res) {
        try {
            const { id } = req.params;
            if (!id)
                throw new Error("ID manquant");
            const employeeId = parseInt(id);
            if (isNaN(employeeId))
                throw new Error("ID invalide");
            const employee = await prisma.employee.findUnique({
                where: { id: employeeId },
                select: { qrCode: true },
            });
            if (!employee) {
                res.status(404).json({ message: 'Employé non trouvé' });
                return;
            }
            res.json({ qrCode: employee.qrCode });
        }
        catch (error) {
            res.status(500).json({ message: error.message || 'Erreur lors de la récupération du code QR' });
        }
    }
}
//# sourceMappingURL=employeeController.js.map