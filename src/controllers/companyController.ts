import type { Request, Response } from "express";
import type { ICompanyController } from "./ICompanyController.js";
import type { ICompanyService } from "../services/ICompanyService.js";
import { companySchema, updateCompanySchema } from "../validations/company.js";

export class CompanyController implements ICompanyController {

  constructor(private companyService: ICompanyService) {
    //
  }

  async createCompany(req: Request, res: Response): Promise<void> {
    try {
      const data = companySchema.parse(req.body);
      const company = await this.companyService.createCompany(data);
      res.json({ message: "Entreprise créée", company });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async getCompany(req: Request, res: Response): Promise<void> {
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
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async updateCompany(req: Request, res: Response): Promise<void> {
    try {
      if (!req.params.id) {
        res.status(400).json({ error: "ID manquant" });
        return;
      }
      const id = parseInt(req.params.id);
      const data = updateCompanySchema.parse(req.body);
      const company = await this.companyService.updateCompany(id, data);
      res.json({ message: "Entreprise mise à jour", company });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async deleteCompany(req: Request, res: Response): Promise<void> {
    try {
      if (!req.params.id) {
        res.status(400).json({ error: "ID manquant" });
        return;
      }
      const id = parseInt(req.params.id);
      await this.companyService.deleteCompany(id);
      res.json({ message: "Entreprise supprimée" });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async getAllCompanies(req: Request, res: Response): Promise<void> {
    try {
      const companies = await this.companyService.getAllCompanies();
      res.json(companies);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }
}
