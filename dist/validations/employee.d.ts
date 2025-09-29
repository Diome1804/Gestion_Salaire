import { z } from "zod";
export declare const createEmployeeSchema: z.ZodObject<{
    fullName: z.ZodString;
    position: z.ZodString;
    contractType: z.ZodEnum<{
        DAILY: "DAILY";
        FIXED: "FIXED";
        FREELANCE: "FREELANCE";
    }>;
    rateOrSalary: z.ZodNumber;
    bankDetails: z.ZodOptional<z.ZodString>;
    companyId: z.ZodOptional<z.ZodNumber>;
}, z.core.$strip>;
export declare const updateEmployeeSchema: z.ZodObject<{
    fullName: z.ZodOptional<z.ZodString>;
    position: z.ZodOptional<z.ZodString>;
    contractType: z.ZodOptional<z.ZodEnum<{
        DAILY: "DAILY";
        FIXED: "FIXED";
        FREELANCE: "FREELANCE";
    }>>;
    rateOrSalary: z.ZodOptional<z.ZodNumber>;
    bankDetails: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
//# sourceMappingURL=employee.d.ts.map