export const requireRole = (roles) => {
    return (req, res, next) => {
        const user = req.user;
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
//# sourceMappingURL=requireRole.js.map