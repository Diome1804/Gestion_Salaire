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
            // TODO: Implement PDF generation with proper data structure
            // For now, return a placeholder
            res.status(501).json({ error: "Export PDF en cours d'implémentation" });
        }
        catch (error) {
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
            // TODO: Add company permission check for ADMIN role
            // TODO: Implement bulk PDF generation
            res.status(501).json({ error: "Export PDF en lot en cours d'implémentation" });
        }
        catch (error) {
            res.status(400).json({ error: error.message });
        }
    }
}
//# sourceMappingURL=payslipController.js.map