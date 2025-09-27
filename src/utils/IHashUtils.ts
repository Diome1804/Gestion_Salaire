export interface IHashUtils {
  hashPassword(password: string): Promise<string>;
  comparePassword(password: string, hashed: string): Promise<boolean>;
}
