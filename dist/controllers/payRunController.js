export class PayRunController {
    payRunService;
    payslipService;
    emailService;
    constructor(payRunService, payslipService, emailService) {
        this.payRunService = payRunService;
        this.payslipService = payslipService;
        this.emailService = emailService;
    }
    async createPayRun(req, res) {
        try {
            const caller = req.user;
            const data = {
                companyId: caller.role === "ADMIN" ? caller.companyId : req.body.companyId,
                periodType: req.body.periodType,
                startDate: req.body.startDate ? new Date(req.body.startDate) : undefined,
                endDate: req.body.endDate ? new Date(req.body.endDate) : undefined,
                createdBy: caller.id
            };
            const payRun = await this.payRunService.createPayRun(data);
            // Send email notifications to employees (async)
            this.sendPayslipNotifications(payRun.id).catch(error => {
                console.error('Failed to send payslip notifications:', error);
            });
            res.status(201).json({ message: "Cycle de paie créé", payRun });
        }
        catch (error) {
            res.status(400).json({ error: error.message });
        }
    }
    async getAllPayRuns(req, res) {
        try {
            const caller = req.user;
            const filters = {};
            if (req.query.companyId)
                filters.companyId = parseInt(req.query.companyId);
            if (req.query.status)
                filters.status = req.query.status;
            if (req.query.periodType)
                filters.periodType = req.query.periodType;
            // Restrict to own company for ADMIN
            if (caller.role === "ADMIN") {
                filters.companyId = caller.companyId;
            }
            const payRuns = await this.payRunService.getAllPayRuns(filters);
            res.json(payRuns);
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
    async getPayRunById(req, res) {
        try {
            if (!req.params.id)
                throw new Error("ID manquant");
            const id = parseInt(req.params.id);
            if (isNaN(id))
                throw new Error("ID invalide");
            const payRun = await this.payRunService.getPayRunById(id);
            if (!payRun) {
                res.status(404).json({ error: "Cycle de paie non trouvé" });
                return;
            }
            const caller = req.user;
            if (caller.role === "ADMIN" && payRun.companyId !== caller.companyId) {
                res.status(403).json({ error: "Accès refusé" });
                return;
            }
            res.json(payRun);
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
    async updatePayRun(req, res) {
        try {
            if (!req.params.id)
                throw new Error("ID manquant");
            const id = parseInt(req.params.id);
            if (isNaN(id))
                throw new Error("ID invalide");
            const caller = req.user;
            const payRun = await this.payRunService.getPayRunById(id);
            if (!payRun)
                throw new Error("Cycle de paie non trouvé");
            if (caller.role === "ADMIN" && payRun.companyId !== caller.companyId) {
                throw new Error("Accès refusé");
            }
            const updateData = req.body;
            const updated = await this.payRunService.updatePayRun(id, updateData);
            res.json({ message: "Cycle de paie mis à jour", payRun: updated });
        }
        catch (error) {
            res.status(400).json({ error: error.message });
        }
    }
    async approvePayRun(req, res) {
        try {
            if (!req.params.id)
                throw new Error("ID manquant");
            const id = parseInt(req.params.id);
            if (isNaN(id))
                throw new Error("ID invalide");
            const caller = req.user;
            const payRun = await this.payRunService.getPayRunById(id);
            if (!payRun)
                throw new Error("Cycle de paie non trouvé");
            if (caller.role === "ADMIN" && payRun.companyId !== caller.companyId) {
                throw new Error("Accès refusé");
            }
            const approved = await this.payRunService.approvePayRun(id);
            res.json({ message: "Cycle de paie approuvé", payRun: approved });
        }
        catch (error) {
            res.status(400).json({ error: error.message });
        }
    }
    async closePayRun(req, res) {
        try {
            if (!req.params.id)
                throw new Error("ID manquant");
            const id = parseInt(req.params.id);
            if (isNaN(id))
                throw new Error("ID invalide");
            const caller = req.user;
            const payRun = await this.payRunService.getPayRunById(id);
            if (!payRun)
                throw new Error("Cycle de paie non trouvé");
            if (caller.role === "ADMIN" && payRun.companyId !== caller.companyId) {
                throw new Error("Accès refusé");
            }
            const closed = await this.payRunService.closePayRun(id);
            res.json({ message: "Cycle de paie clôturé", payRun: closed });
        }
        catch (error) {
            res.status(400).json({ error: error.message });
        }
    }
    async deletePayRun(req, res) {
        try {
            if (!req.params.id)
                throw new Error("ID manquant");
            const id = parseInt(req.params.id);
            if (isNaN(id))
                throw new Error("ID invalide");
            const caller = req.user;
            const payRun = await this.payRunService.getPayRunById(id);
            if (!payRun)
                throw new Error("Cycle de paie non trouvé");
            if (caller.role === "ADMIN" && payRun.companyId !== caller.companyId) {
                throw new Error("Accès refusé");
            }
            // Only SUPERADMIN can delete
            if (caller.role !== "SUPERADMIN") {
                res.status(403).json({ error: "Accès refusé" });
                return;
            }
            await this.payRunService.deletePayRun(id);
            res.json({ message: "Cycle de paie supprimé" });
        }
        catch (error) {
            res.status(400).json({ error: error.message });
        }
    }
    async sendPayslipNotifications(payRunId) {
        try {
            // Get payslips for this payrun with employee and company data
            const payslips = await this.payslipService.getPayslipsByPayRun(payRunId);
            for (const payslip of payslips) {
                if (payslip.employee?.email) {
                    const subject = `Votre bulletin de paie - ${payslip.payRun?.name}`;
                    const html = `
            <h1>Bulletin de Paie Disponible</h1>
            <p>Bonjour ${payslip.employee.fullName},</p>
            <p>Votre bulletin de paie pour la période ${payslip.payRun?.period || payslip.payRun?.name} est maintenant disponible.</p>
            <p><strong>Entreprise:</strong> ${payslip.payRun?.company?.name}</p>
            <p><strong>Salaire brut:</strong> ${new Intl.NumberFormat('fr-FR', { style: 'currency', currency: payslip.payRun?.company?.currency || 'XOF' }).format(payslip.grossSalary)}</p>
            <p><strong>Salaire net:</strong> ${new Intl.NumberFormat('fr-FR', { style: 'currency', currency: payslip.payRun?.company?.currency || 'XOF' }).format(payslip.netSalary)}</p>
            <p>Vous pouvez consulter et télécharger votre bulletin depuis votre espace employé.</p>
            <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}">Accéder à mon compte</a>
          `;
                    await this.emailService.sendEmail(payslip.employee.email, subject, html);
                }
            }
        }
        catch (error) {
            console.error('Error sending payslip notifications:', error);
            throw error;
        }
    }
}
//# sourceMappingURL=payRunController.js.map