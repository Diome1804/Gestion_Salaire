import { z } from "zod";

export const createEmployeeSchema = z.object({
  fullName: z.string().min(1, "Le nom complet est requis"),
  position: z.string().min(1, "Le poste est requis"),
  contractType: z.enum(["DAILY", "FIXED", "FREELANCE", "HONORAIRE"]),
  rateOrSalary: z.number().positive("Le taux/salaire doit être positif").optional(),
  bankDetails: z.string().optional(),
  email: z.string().email("Email invalide").min(1, "L'email est requis"),
  matricule: z.string().optional(),
  companyId: z.number().optional(),
}).refine((data) => {
  // For HONORAIRE, rateOrSalary will be set automatically to 1000
  if (data.contractType === 'HONORAIRE') {
    return true;
  }
  // For other contract types, rateOrSalary is required
  return data.rateOrSalary !== undefined && data.rateOrSalary > 0;
}, {
  message: "Le taux/salaire est requis pour ce type de contrat",
  path: ["rateOrSalary"],
});

export const updateEmployeeSchema = z.object({
  fullName: z.string().min(1).optional(),
  position: z.string().min(1).optional(),
  contractType: z.enum(["DAILY", "FIXED", "FREELANCE", "HONORAIRE"]).optional(),
  rateOrSalary: z.number().positive().optional(),
  bankDetails: z.string().optional(),
  email: z.string().email("Email invalide").min(1, "L'email est requis").optional(),
  matricule: z.string().optional(),
});