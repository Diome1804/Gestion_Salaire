import { z } from "zod";
export const companySchema = z.object({
    logo: z.string().optional(),
    address: z.string(),
    currency: z.string(),
    periodType: z.enum(["MONTHLY", "WEEKLY", "DAILY"]),
});
export const updateCompanySchema = z.object({
    logo: z.string().optional(),
    address: z.string().optional(),
    currency: z.string().optional(),
    periodType: z.enum(["MONTHLY", "WEEKLY", "DAILY"]).optional(),
});
//# sourceMappingURL=company.js.map