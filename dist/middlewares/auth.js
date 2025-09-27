import jwt from "jsonwebtoken";
export const authenticate = (req, res, next) => {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
        res.status(401).json({ error: "Token manquant" });
        return;
    }
    try {
        const payload = jwt.verify(token, process.env.JWT_SECRET);
        req.user = payload;
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