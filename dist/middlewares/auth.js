import jwt from "jsonwebtoken";
import prisma from "../config/prisma.js";
export const authenticate = async (req, res, next) => {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
        res.status(401).json({ error: "Token manquant" });
        return;
    }
    try {
        const payload = jwt.verify(token, process.env.JWT_SECRET);
        // Fetch full user to get companyId
        const user = await prisma.users.findUnique({ where: { id: payload.id } });
        if (!user) {
            res.status(401).json({ error: "Utilisateur non trouvé" });
            return;
        }
        req.user = {
            id: user.id,
            role: user.role,
            companyId: user.companyId
        };
        next();
    }
    catch (error) {
        res.status(401).json({ error: "Token invalide" });
    }
};
export const authorize = (roles) => {
    return (req, res, next) => {
        const user = req.user;
        if (!user || !roles.includes(user.role)) {
            res.status(403).json({ error: "Accès refusé" });
            return;
        }
        next();
    };
};
//# sourceMappingURL=auth.js.map