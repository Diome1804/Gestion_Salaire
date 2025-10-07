import { companySchema, updateCompanySchema } from "../validations/company.js";
import { SalaryCalculatorService } from "../services/salaryCalculatorService.js";
export class CompanyController {
    companyService;
    fileUploadService;
    constructor(companyService, fileUploadService) {
        this.companyService = companyService;
        this.fileUploadService = fileUploadService;
        //
    }
    async createCompany(req, res) {
        try {
            const data = companySchema.parse(req.body);
            let logoUrl;
            if (req.file) {
                logoUrl = await this.fileUploadService.uploadFile(req.file);
            }
            const companyData = { ...data, logo: logoUrl };
            const company = await this.companyService.createCompany(companyData);
            res.json({ message: "Entreprise créée", company });
        }
        catch (error) {
            res.status(400).json({ error: error.message });
        }
    }
    async getCompany(req, res) {
        try {
            if (!req.params.id) {
                res.status(400).json({ error: "ID manquant" });
                return;
            }
            const id = parseInt(req.params.id);
            const company = await this.companyService.getCompanyById(id);
            if (!company) {
                res.status(404).json({ error: "Entreprise non trouvée" });
                return;
            }
            res.json(company);
        }
        catch (error) {
            res.status(400).json({ error: error.message });
        }
    }
    async updateCompany(req, res) {
        try {
            if (!req.params.id) {
                res.status(400).json({ error: "ID manquant" });
                return;
            }
            const id = parseInt(req.params.id);
            const data = updateCompanySchema.parse(req.body);
            let logoUrl;
            if (req.file) {
                logoUrl = await this.fileUploadService.uploadFile(req.file);
            }
            const companyData = { ...data, logo: logoUrl };
            const company = await this.companyService.updateCompany(id, companyData);
            res.json({ message: "Entreprise mise à jour", company });
        }
        catch (error) {
            res.status(400).json({ error: error.message });
        }
    }
    async deleteCompany(req, res) {
        try {
            if (!req.params.id) {
                res.status(400).json({ error: "ID manquant" });
                return;
            }
            const id = parseInt(req.params.id);
            await this.companyService.deleteCompany(id);
            res.json({ message: "Entreprise supprimée" });
        }
        catch (error) {
            res.status(400).json({ error: error.message });
        }
    }
    async getAllCompanies(req, res) {
        try {
            const companies = await this.companyService.getAllCompanies();
            res.json(companies);
        }
        catch (error) {
            res.status(400).json({ error: error.message });
        }
    }
    async toggleImpersonationPermission(req, res) {
        try {
            const caller = req.user;
            if (!req.params.id) {
                res.status(400).json({ error: "ID manquant" });
                return;
            }
            const companyId = parseInt(req.params.id);
            // Vérifier que l'utilisateur est admin de cette entreprise
            if (caller.role !== 'SUPERADMIN' && caller.companyId !== companyId) {
                res.status(403).json({ error: "Accès non autorisé" });
                return;
            }
            const { allowImpersonation } = req.body;
            if (typeof allowImpersonation !== 'boolean') {
                res.status(400).json({ error: "allowImpersonation doit être un booléen" });
                return;
            }
            const company = await this.companyService.updateCompany(companyId, { allowImpersonation });
            res.json({
                message: `Autorisation d'impersonnation ${allowImpersonation ? 'activée' : 'désactivée'}`,
                company
            });
        }
        catch (error) {
            res.status(400).json({ error: error.message });
        }
    }
    async updateCompanyRates(req, res) {
        try {
            const caller = req.user;
            if (!req.params.id) {
                res.status(400).json({ error: "ID manquant" });
                return;
            }
            const companyId = parseInt(req.params.id);
            // Vérifier que l'utilisateur est admin de cette entreprise ou SUPERADMIN
            if (caller.role !== 'SUPERADMIN' && caller.companyId !== companyId) {
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
            await salaryCalculator.updateCompanyRates(companyId, {
                hourlyRate,
                dailyRate,
                overtimeRate
            });
            res.json({ message: "Tarifs de l'entreprise mis à jour avec succès" });
        }
        catch (error) {
            res.status(400).json({ error: error.message });
        }
    }
    async getCompanyRates(req, res) {
        try {
            const caller = req.user;
            if (!req.params.id) {
                res.status(400).json({ error: "ID manquant" });
                return;
            }
            const companyId = parseInt(req.params.id);
            // Vérifier que l'utilisateur est admin de cette entreprise ou SUPERADMIN
            if (caller.role !== 'SUPERADMIN' && caller.companyId !== companyId) {
                res.status(403).json({ error: "Accès refusé" });
                return;
            }
            const company = await this.companyService.getCompanyById(companyId);
            if (!company) {
                res.status(404).json({ error: "Entreprise non trouvée" });
                return;
            }
            res.json({
                companyId: company.id,
                companyName: company.name,
                rates: {
                    hourlyRate: company.hourlyRate,
                    dailyRate: company.dailyRate,
                    overtimeRate: company.overtimeRate
                }
            });
        }
        catch (error) {
            res.status(400).json({ error: error.message });
        }
    }
}
//# sourceMappingURL=companyController.js.map