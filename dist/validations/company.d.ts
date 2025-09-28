import { z } from "zod";
export declare const companySchema: z.ZodObject<{
    name: z.ZodString;
    logo: z.ZodOptional<z.ZodString>;
    address: z.ZodString;
    currency: z.ZodString;
    periodType: z.ZodEnum<{
        MONTHLY: "MONTHLY";
        WEEKLY: "WEEKLY";
        DAILY: "DAILY";
    }>;
}, z.core.$strip>;
export declare const updateCompanySchema: z.ZodObject<{
    name: z.ZodOptional<z.ZodString>;
    logo: z.ZodOptional<z.ZodString>;
    address: z.ZodOptional<z.ZodString>;
    currency: z.ZodOptional<z.ZodString>;
    periodType: z.ZodOptional<z.ZodEnum<{
        MONTHLY: "MONTHLY";
        WEEKLY: "WEEKLY";
        DAILY: "DAILY";
    }>>;
}, z.core.$strip>;
//# sourceMappingURL=company.d.ts.map