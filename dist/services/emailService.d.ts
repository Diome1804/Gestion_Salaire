import type { IEmailService } from './IEmailService.js';
export declare class EmailService implements IEmailService {
    constructor();
    sendEmail(to: string, subject: string, html: string): Promise<void>;
    sendQRCode(employee: any, qrCodeData: string): Promise<void>;
    sendVigileCredentials(vigile: any, tempPassword: string): Promise<void>;
}
//# sourceMappingURL=emailService.d.ts.map