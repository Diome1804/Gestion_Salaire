import jwt from "jsonwebtoken";
export class JwtUtils {
    generateToken(payload) {
        return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "1d" });
    }
    verifyToken(token) {
        return jwt.verify(token, process.env.JWT_SECRET);
    }
}
//# sourceMappingURL=jwt.js.map