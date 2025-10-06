import { z } from "zod";
export const registerSchema = z.object({
    name: z.string().min(1, "Le nom est requis"),
    prenom: z.string().optional(),
    email: z.string().email("Email invalide"),
    password: z.string().min(6, "Le mot de passe doit contenir au moins 6 caractères"),
});
export const loginSchema = z.object({
    email: z.string().email("Email invalide"),
    password: z.string().min(1, "Le mot de passe est requis"),
});
export const createUserSchema = z.object({
    name: z.string().min(1, "Le nom est requis"),
    prenom: z.string().optional(),
    email: z.string().email("Email invalide"),
    role: z.enum(["SUPERADMIN", "ADMIN", "CAISSIER", "VIGILE"]),
    companyId: z.number().optional().nullable(),
});
export const changePasswordSchema = z.object({
    newPassword: z.string().min(6, "Le mot de passe doit contenir au moins 6 caractères"),
});
//# sourceMappingURL=auth.js.map