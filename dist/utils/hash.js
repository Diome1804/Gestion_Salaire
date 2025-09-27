import bcrypt from "bcrypt";
export class HashUtils {
    async hashPassword(password) {
        const salt = await bcrypt.genSalt(10);
        return bcrypt.hash(password, salt);
    }
    async comparePassword(password, hash) {
        return bcrypt.compare(password, hash);
    }
}
//# sourceMappingURL=hash.js.map