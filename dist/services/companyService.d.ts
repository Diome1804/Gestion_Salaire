import type { ICompanyService } from "./ICompanyService.js";
import type { ICompanyRepository } from "../repositories/ICompanyRepository.js";
import type { Company, PeriodType } from "@prisma/client";
export declare class CompanyService implements ICompanyService {
    private companyRepository;
    constructor(companyRepository: ICompanyRepository);
    createCompany(data: {
        name: string;
        logo?: string | undefined;
        address: string;
        currency: string;
        periodType: PeriodType;
    }): Promise<Company>;
    getCompanyById(id: number): Promise<Company | null>;
    updateCompany(id: number, data: Partial<{
        name?: string | undefined;
        logo?: string | undefined;
        address?: string | undefined;
        currency?: string | undefined;
        periodType?: PeriodType | undefined;
    }>): Promise<Company>;
    deleteCompany(id: number): Promise<void>;
    getAllCompanies(): Promise<Company[]>;
}
//# sourceMappingURL=companyService.d.ts.map