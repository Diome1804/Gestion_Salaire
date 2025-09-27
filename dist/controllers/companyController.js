import { companySchema, updateCompanySchema } from "../validations/company.js";
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
}
//# sourceMappingURL=companyController.js.map