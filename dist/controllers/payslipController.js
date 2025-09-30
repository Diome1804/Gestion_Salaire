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
            // TODO: Add company permission check for ADMIN role
            // Pour l'instant, créer un PDF simple avec les données de base
            const pdfData = {
                company: {
                    name: "Entreprise Demo",
                    address: "Adresse Demo",
                    currency: "XOF"
                },
                employee: {
                    fullName: `Employé ${payslip.employeeId}`,
                    position: "Poste Demo",
                    contractType: "FIXED"
                },
                payRun: {
                    name: `Cycle ${payslip.payRunId}`,
                    period: "01/09/2025 - 30/09/2025",
                    startDate: new Date(),
                    endDate: new Date()
                },
                grossSalary: payslip.grossSalary,
                deductions: Array.isArray(payslip.deductions) ? payslip.deductions : [],
                totalDeductions: payslip.totalDeductions,
                netSalary: payslip.netSalary
            };
            const pdfBuffer = await this.pdfService.generatePayslipPDF(pdfData);
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', `attachment; filename="bulletin-${payslip.id}.pdf"`);
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
            // TODO: Add company permission check for ADMIN role
            // Préparer les données pour le PDF en lot (version simplifiée)
            const pdfDataArray = payslips.map(payslip => ({
                company: {
                    name: "Entreprise Demo",
                    address: "Adresse Demo",
                    currency: "XOF"
                },
                employee: {
                    fullName: `Employé ${payslip.employeeId}`,
                    position: "Poste Demo",
                    contractType: "FIXED"
                },
                payRun: {
                    name: `Cycle ${payslip.payRunId}`,
                    period: "01/09/2025 - 30/09/2025",
                    startDate: new Date(),
                    endDate: new Date()
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