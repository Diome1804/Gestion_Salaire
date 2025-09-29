import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import type { Role } from "@prisma/client";
import prisma from "../config/prisma.js";

export const authenticate = async (req: Request, res: Response, next: NextFunction) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) {
    res.status(401).json({ error: "Token manquant" });
    return;
  }
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET as string) as { id: number; role: Role };
    // Fetch full user to get companyId
    const user = await prisma.users.findUnique({ where: { id: payload.id } });
    if (!user) {
      res.status(401).json({ error: "Utilisateur non trouvé" });
      return;
    }
    (req as any).user = {
      id: user.id,
      role: user.role,
      companyId: user.companyId
    };
    next();
  } catch (error) {
    res.status(401).json({ error: "Token invalide" });
  }
};

export const authorize = (roles: Role[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = (req as any).user;
    if (!user || !roles.includes(user.role)) {
      res.status(403).json({ error: "Accès refusé" });
      return;
    }
    next();
  };
};
