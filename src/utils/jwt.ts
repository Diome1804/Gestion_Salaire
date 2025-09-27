import jwt from "jsonwebtoken";
import type { Role } from "@prisma/client";
import type { IJwtUtils } from "./IJwtUtils.js";

export class JwtUtils implements IJwtUtils {
  generateToken(payload: { id: number; role: Role }): string {
    return jwt.sign(payload, process.env.JWT_SECRET as string, { expiresIn: "1d" });
  }

  verifyToken(token: string): { id: number; role: Role } {
    return jwt.verify(token, process.env.JWT_SECRET as string) as { id: number; role: Role };
  }
}
