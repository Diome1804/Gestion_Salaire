import type { Request } from "express";

export interface IFileUploadService {
  uploadFile(file: Express.Multer.File): Promise<string>;
}
