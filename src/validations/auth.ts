import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
  role: z.enum(["SUPERADMIN", "ADMIN", "CAISSIER"]).optional()
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6)
});

export const createUserSchema = z.object({
  name: z.string().min(2),
  prenom: z.string().min(2).optional(),
  email: z.string().email(),
  role: z.enum(["ADMIN", "CAISSIER"]),
  companyId: z.number().int().positive()
});

export const changePasswordSchema = z.object({
  newPassword: z.string().min(6)
});
