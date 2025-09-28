import { z } from "zod";
export declare const registerSchema: z.ZodObject<{
    name: z.ZodString;
    email: z.ZodString;
    password: z.ZodString;
    role: z.ZodOptional<z.ZodEnum<{
        SUPERADMIN: "SUPERADMIN";
        ADMIN: "ADMIN";
        CAISSIER: "CAISSIER";
    }>>;
}, z.core.$strip>;
export declare const loginSchema: z.ZodObject<{
    email: z.ZodString;
    password: z.ZodString;
}, z.core.$strip>;
export declare const createUserSchema: z.ZodObject<{
    name: z.ZodString;
    prenom: z.ZodOptional<z.ZodString>;
    email: z.ZodString;
    role: z.ZodEnum<{
        ADMIN: "ADMIN";
        CAISSIER: "CAISSIER";
    }>;
    companyId: z.ZodNumber;
}, z.core.$strip>;
export declare const changePasswordSchema: z.ZodObject<{
    newPassword: z.ZodString;
}, z.core.$strip>;
//# sourceMappingURL=auth.d.ts.map