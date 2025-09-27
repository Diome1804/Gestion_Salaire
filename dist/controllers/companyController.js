import { companySchema, updateCompanySchema } from "../validations/company.js";
export class CompanyController {
    companyService;
    constructor(companyService) {
        this.companyService = companyService;
        //
    }
    async createCompany(req, res) {
        try {
            const data = companySchema.parse(req.body);
            const company = await this.companyService.createCompany(data);
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
            const company = await this.companyService.updateCompany(id, data);
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
}
//# sourceMappingURL=companyController.js.map