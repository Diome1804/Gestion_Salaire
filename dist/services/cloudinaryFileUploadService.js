import { v2 as cloudinary } from "cloudinary";
export class CloudinaryFileUploadService {
    constructor() {
        cloudinary.config({
            cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
            api_key: process.env.CLOUDINARY_API_KEY,
            api_secret: process.env.CLOUDINARY_API_SECRET,
        });
    }
    async uploadFile(file) {
        return new Promise((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream({ folder: "company-logos" }, (error, result) => {
                if (error) {
                    reject(error);
                }
                else if (result) {
                    resolve(result.secure_url);
                }
                else {
                    reject(new Error("Upload failed"));
                }
            });
            uploadStream.end(file.buffer);
        });
    }
}
//# sourceMappingURL=cloudinaryFileUploadService.js.map