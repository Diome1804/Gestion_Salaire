import type { ICompanyRepository } from "./ICompanyRepository.js";
import type { Company, PeriodType } from "@prisma/client";
export declare class CompanyRepository implements ICompanyRepository {
    create(data: {
        name: string;
        logo?: string | null;
        address: string;
        currency: string;
        periodType: PeriodType;
    }): Promise<Company>;
    findById(id: number): Promise<Company | null>;
    update(id: number, data: {
        name?: string;
        logo?: string | null;
        address?: string;
        currency?: string;
        periodType?: PeriodType;
    }): Promise<Company>;
    delete(id: number): Promise<void>;
    findAll(): Promise<Company[]>;
}
//# sourceMappingURL=companyRepository.d.ts.map