import { z } from "zod";
export const createEmployeeSchema = z.object({
    userId: z.number().int().positive(),
    fullName: z.string().min(1),
    position: z.string().min(1),
    contractType: z.enum(["DAILY", "FIXED", "FREELANCE"]),
    rateOrSalary: z.number().positive(),
    bankDetails: z.string().optional(),
    companyId: z.number().int().positive().optional(),
});
export const updateEmployeeSchema = z.object({
    fullName: z.string().min(1).optional(),
    position: z.string().min(1).optional(),
    contractType: z.enum(["DAILY", "FIXED", "FREELANCE"]).optional(),
    rateOrSalary: z.number().positive().optional(),
    bankDetails: z.string().optional(),
});
//# sourceMappingURL=employee.js.map