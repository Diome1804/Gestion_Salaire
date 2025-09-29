import type { IEmailService } from './IEmailService.js';
export declare class EmailService implements IEmailService {
    constructor();
    sendEmail(to: string, subject: string, html: string): Promise<void>;
}
//# sourceMappingURL=emailService.d.ts.map