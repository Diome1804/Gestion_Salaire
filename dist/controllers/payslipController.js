import { PDFService } from "../services/pdfService.js";
export class PayslipController {
    payslipService;
    pdfService;
    constructor(payslipService, pdfService) {
        this.payslipService = payslipService;
        this.pdfService = pdfService;
    }
    async getPayslipById(req, res) {
        try {
            if (!req.params.id)
                throw new Error("ID manquant");
            const id = parseInt(req.params.id);
            if (isNaN(id))
                throw new Error("ID invalide");
            const payslip = await this.payslipService.getPayslipById(id);
            if (!payslip) {
                res.status(404).json({ error: "Bulletin de paie non trouvé" });
                return;
            }
            // TODO: Add company permission check for ADMIN role
            res.json(payslip);
        }
        catch (error) {
            res.status(400).json({ error: error.message });
        }
    }
    async getPayslipsByPayRun(req, res) {
        try {
            if (!req.params.payRunId)
                throw new Error("ID du cycle manquant");
            const payRunId = parseInt(req.params.payRunId);
            if (isNaN(payRunId))
                throw new Error("ID du cycle invalide");
            // TODO: Add company permission check for ADMIN role
            const payslips = await this.payslipService.getPayslipsByPayRun(payRunId);
            res.json(payslips);
        }
        catch (error) {
            res.status(400).json({ error: error.message });
        }
    }
    async getPayslipsByEmployee(req, res) {
        try {
            if (!req.params.employeeId)
                throw new Error("ID de l'employé manquant");
            const employeeId = parseInt(req.params.employeeId);
            if (isNaN(employeeId))
                throw new Error("ID de l'employé invalide");
            // TODO: Add company permission check for ADMIN role
            const payslips = await this.payslipService.getPayslipsByEmployee(employeeId);
            res.json(payslips);
        }
        catch (error) {
            res.status(400).json({ error: error.message });
        }
    }
    async getPayslipsByCompany(req, res) {
        try {
            if (!req.params.companyId)
                throw new Error("ID de l'entreprise manquant");
            const companyId = parseInt(req.params.companyId);
            if (isNaN(companyId))
                throw new Error("ID de l'entreprise invalide");
            const user = req.user;
            console.log('getPayslipsByCompany - User:', user);
            console.log('getPayslipsByCompany - Requested companyId:', companyId);
            if (user.role === "ADMIN" || user.role === "CAISSIER") {
                console.log('getPayslipsByCompany - Checking company access for role:', user.role);
                console.log('getPayslipsByCompany - User companyId:', user.companyId);
                if (!user.companyId || user.companyId !== companyId) {
                    console.log('getPayslipsByCompany - Access denied: company mismatch');
                    res.status(403).json({ error: "Accès refusé" });
                    return;
                }
                console.log('getPayslipsByCompany - Access granted');
            }
            const payslips = await this.payslipService.getPayslipsByCompany(companyId);
            console.log('getPayslipsByCompany - Payslips found:', payslips.length);
            res.json(payslips);
        }
        catch (error) {
            console.error('getPayslipsByCompany - Error:', error.message);
            res.status(400).json({ error: error.message });
        }
    }
    async updatePayslip(req, res) {
        try {
            if (!req.params.id)
                throw new Error("ID manquant");
            const id = parseInt(req.params.id);
            if (isNaN(id))
                throw new Error("ID invalide");
            const data = req.body;
            const caller = req.user;
            // TODO: Add company permission check for ADMIN role
            const updatedPayslip = await this.payslipService.updatePayslip(id, data, caller.id);
            res.json({ message: "Bulletin de paie mis à jour", payslip: updatedPayslip });
        }
        catch (error) {
            res.status(400).json({ error: error.message });
        }
    }
    async exportPayslipPDF(req, res) {
        try {
            if (!req.params.id)
                throw new Error("ID manquant");
            const id = parseInt(req.params.id);
            if (isNaN(id))
                throw new Error("ID invalide");
            const payslip = await this.payslipService.getPayslipById(id);
            if (!payslip)
                throw new Error("Bulletin de paie non trouvé");
            // Vérification des permissions
            const caller = req.user;
            if (caller.role === "ADMIN" && payslip.employee?.companyId !== caller.companyId) {
                res.status(403).json({ error: "Accès refusé" });
                return;
            }
            // Utiliser les vraies données de la base
            const pdfData = {
                company: {
                    name: payslip.payRun?.company?.name || "Entreprise",
                    address: payslip.payRun?.company?.address || "Adresse",
                    currency: payslip.payRun?.company?.currency || "XOF"
                },
                employee: {
                    fullName: payslip.employee?.fullName || "Employé",
                    position: payslip.employee?.position || "Poste",
                    contractType: payslip.employee?.contractType || "FIXED"
                },
                payRun: {
                    name: payslip.payRun?.name || `Cycle ${payslip.payRunId}`,
                    period: payslip.payRun?.period || "",
                    startDate: payslip.payRun?.startDate || new Date(),
                    endDate: payslip.payRun?.endDate || new Date()
                },
                grossSalary: payslip.grossSalary,
                deductions: Array.isArray(payslip.deductions) ? payslip.deductions : [],
                totalDeductions: payslip.totalDeductions,
                netSalary: payslip.netSalary
            };
            const pdfBuffer = await this.pdfService.generatePayslipPDF(pdfData);
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', `attachment; filename="bulletin-${payslip.employee?.fullName?.replace(/\s+/g, '-') || payslip.id}.pdf"`);
            res.send(pdfBuffer);
        }
        catch (error) {
            console.error('Erreur export PDF:', error);
            res.status(400).json({ error: error.message });
        }
    }
    async exportPayRunPayslipsPDF(req, res) {
        try {
            if (!req.params.payRunId)
                throw new Error("ID du cycle manquant");
            const payRunId = parseInt(req.params.payRunId);
            if (isNaN(payRunId))
                throw new Error("ID du cycle invalide");
            const payslips = await this.payslipService.getPayslipsByPayRun(payRunId);
            if (payslips.length === 0)
                throw new Error("Aucun bulletin trouvé pour ce cycle");
            // Vérification des permissions
            const caller = req.user;
            if (caller.role === "ADMIN" && payslips[0]?.employee?.companyId !== caller.companyId) {
                res.status(403).json({ error: "Accès refusé" });
                return;
            }
            // Préparer les données pour le PDF en lot
            const pdfDataArray = payslips.map(payslip => ({
                company: {
                    name: payslip.payRun?.company?.name || "Entreprise",
                    address: payslip.payRun?.company?.address || "Adresse",
                    currency: payslip.payRun?.company?.currency || "XOF"
                },
                employee: {
                    fullName: payslip.employee?.fullName || "Employé",
                    position: payslip.employee?.position || "Poste",
                    contractType: payslip.employee?.contractType || "FIXED"
                },
                payRun: {
                    name: payslip.payRun?.name || `Cycle ${payslip.payRunId}`,
                    period: payslip.payRun?.period || "",
                    startDate: payslip.payRun?.startDate || new Date(),
                    endDate: payslip.payRun?.endDate || new Date()
                },
                grossSalary: payslip.grossSalary,
                deductions: Array.isArray(payslip.deductions) ? payslip.deductions : [],
                totalDeductions: payslip.totalDeductions,
                netSalary: payslip.netSalary
            }));
            const pdfBuffer = await this.pdfService.generateBulkPayslipsPDF(pdfDataArray);
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', `attachment; filename="bulletins-cycle-${payRunId}.pdf"`);
            res.send(pdfBuffer);
        }
        catch (error) {
            res.status(400).json({ error: error.message });
        }
    }
}
//# sourceMappingURL=payslipController.js.map