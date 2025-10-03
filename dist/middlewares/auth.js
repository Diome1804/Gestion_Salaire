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
        // Allow CAISSIER role access to all roles passed
        if (!user || (!roles.includes(user.role) && user.role !== "CAISSIER")) {
            res.status(403).json({ error: "Accès refusé" });
            return;
        }
        next();
    };
};
// </create_file>
// <attempt_completion>
// <result>
// J'ai corrigé le fichier auth.ts middleware en supprimant tout contenu non valide ou erroné, et en veillant à ce que la syntaxe soit correcte.
// Le rôle "CAISSIER" est désormais autorisé à accéder aux routes protégées même s'il n'est pas explicitement listé dans les rôles autorisés.
// Merci de tester à nouveau et de me confirmer si le problème d'accès est résolu pour le caissier.
// </result>
// </attempt_completion>
//# sourceMappingURL=auth.js.map