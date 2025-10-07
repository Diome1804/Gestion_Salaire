import { createEmployeeSchema, updateEmployeeSchema } from "../validations/employee.js";
import { v4 as uuidv4 } from 'uuid';
import prisma from "../config/prisma.js";
import { SalaryCalculatorService } from "../services/salaryCalculatorService.js";
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
                // Generate QR code data URL for frontend display
                const QRCode = (await import('qrcode')).default;
                const qrCodeImage = await QRCode.toDataURL(qrCode);
                res.json({
                    message: "Employé créé avec succès",
                    employee: { ...employee, qrCode },
                    qrCode: {
                        text: qrCode,
                        imageData: qrCodeImage
                    }
                });
            }
            catch (qrError) {
                console.error('Error generating QR code:', qrError);
                // Fallback: return employee without QR code
                res.json({
                    message: "Employé créé mais erreur lors de la génération du code QR",
                    employee,
                    qrCode: null
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
            // Generate QR code data URL for frontend display
            const QRCode = (await import('qrcode')).default;
            const qrCodeImage = await QRCode.toDataURL(qrCode);
            res.json({
                message: 'Code QR généré avec succès',
                qrCode: {
                    text: qrCode,
                    imageData: qrCodeImage
                }
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
    async getQRCodeWithImage(req, res) {
        try {
            const { id } = req.params;
            if (!id)
                throw new Error("ID manquant");
            const employeeId = parseInt(id);
            if (isNaN(employeeId))
                throw new Error("ID invalide");
            const employee = await prisma.employee.findUnique({
                where: { id: employeeId },
                select: { id: true, fullName: true, qrCode: true },
            });
            if (!employee) {
                res.status(404).json({ message: 'Employé non trouvé' });
                return;
            }
            if (!employee.qrCode) {
                res.status(404).json({ message: 'Aucun code QR trouvé pour cet employé' });
                return;
            }
            // Generate QR code data URL for frontend display
            const QRCode = (await import('qrcode')).default;
            const qrCodeImage = await QRCode.toDataURL(employee.qrCode);
            res.json({
                employee: {
                    id: employee.id,
                    fullName: employee.fullName,
                    qrCode: employee.qrCode
                },
                qrCode: {
                    text: employee.qrCode,
                    imageData: qrCodeImage
                }
            });
        }
        catch (error) {
            res.status(500).json({ message: error.message || 'Erreur lors de la récupération du code QR' });
        }
    }
    async updateEmployeeRates(req, res) {
        try {
            const caller = req.user;
            if (!req.params.id) {
                res.status(400).json({ error: "ID manquant" });
                return;
            }
            const employeeId = parseInt(req.params.id);
            // Vérifier que l'utilisateur est admin de l'entreprise de cet employé ou SUPERADMIN
            const employee = await this.employeeService.getEmployeeById(employeeId);
            if (!employee) {
                res.status(404).json({ error: "Employé non trouvé" });
                return;
            }
            if (caller.role !== 'SUPERADMIN' && caller.companyId !== employee.companyId) {
                res.status(403).json({ error: "Accès refusé" });
                return;
            }
            const { hourlyRate, dailyRate, overtimeRate } = req.body;
            // Validation des données
            if (hourlyRate !== undefined && (typeof hourlyRate !== 'number' || hourlyRate < 0)) {
                res.status(400).json({ error: "Le tarif horaire doit être un nombre positif" });
                return;
            }
            if (dailyRate !== undefined && (typeof dailyRate !== 'number' || dailyRate < 0)) {
                res.status(400).json({ error: "Le tarif journalier doit être un nombre positif" });
                return;
            }
            if (overtimeRate !== undefined && (typeof overtimeRate !== 'number' || overtimeRate < 1)) {
                res.status(400).json({ error: "Le taux d'heures supplémentaires doit être supérieur ou égal à 1" });
                return;
            }
            const salaryCalculator = new SalaryCalculatorService();
            await salaryCalculator.updateEmployeeRates(employeeId, {
                hourlyRate,
                dailyRate,
                overtimeRate
            });
            res.json({ message: "Tarifs de l'employé mis à jour avec succès" });
        }
        catch (error) {
            res.status(400).json({ error: error.message });
        }
    }
    async getEmployeeRates(req, res) {
        try {
            const caller = req.user;
            if (!req.params.id) {
                res.status(400).json({ error: "ID manquant" });
                return;
            }
            const employeeId = parseInt(req.params.id);
            // Vérifier que l'utilisateur est admin de l'entreprise de cet employé ou SUPERADMIN
            const employee = await this.employeeService.getEmployeeById(employeeId);
            if (!employee) {
                res.status(404).json({ error: "Employé non trouvé" });
                return;
            }
            if (caller.role !== 'SUPERADMIN' && caller.companyId !== employee.companyId) {
                res.status(403).json({ error: "Accès refusé" });
                return;
            }
            const salaryCalculator = new SalaryCalculatorService();
            const rates = await salaryCalculator.getAllRates(employeeId);
            res.json({
                employee: {
                    id: employee.id,
                    fullName: employee.fullName
                },
                rates
            });
        }
        catch (error) {
            res.status(400).json({ error: error.message });
        }
    }
}
//# sourceMappingURL=employeeController.js.map