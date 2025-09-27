import type { IHashUtils } from "./IHashUtils.js";
export declare class HashUtils implements IHashUtils {
    hashPassword(password: string): Promise<string>;
    comparePassword(password: string, hash: string): Promise<boolean>;
}
//# sourceMappingURL=hash.d.ts.map