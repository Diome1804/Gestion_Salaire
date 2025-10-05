import type { Request, Response, NextFunction } from "express";

export const requireRole = (roles: string | string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = (req as any).user;
    
    if (!user) {
      res.status(401).json({ message: 'Non authentifié' });
      return;
    }

    const allowedRoles = Array.isArray(roles) ? roles : [roles];

    if (!allowedRoles.includes(user.role)) {
      res.status(403).json({ message: 'Accès refusé' });
      return;
    }

    next();
  };
};