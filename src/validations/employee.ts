import { z } from "zod";

export const createEmployeeSchema = z.object({
  fullName: z.string().min(1, "Le nom complet est requis"),
  position: z.string().min(1, "Le poste est requis"),
  contractType: z.enum(["DAILY", "FIXED", "FREELANCE", "HONORAIRE"]),
  rateOrSalary: z.number().positive("Le taux/salaire doit être positif"),
  bankDetails: z.string().optional(),
  email: z.string().email("Email invalide").optional(),
  matricule: z.string().optional(),
  companyId: z.number().optional(),
});

export const updateEmployeeSchema = z.object({
  fullName: z.string().min(1).optional(),
  position: z.string().min(1).optional(),
  contractType: z.enum(["DAILY", "FIXED", "FREELANCE", "HONORAIRE"]).optional(),
  rateOrSalary: z.number().positive().optional(),
  bankDetails: z.string().optional(),
  email: z.string().email("Email invalide").optional(),
  matricule: z.string().optional(),
});