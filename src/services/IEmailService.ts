export interface IEmailService {
  sendEmail(to: string, subject: string, html: string): Promise<void>;
  sendQRCode(employee: any, qrCodeData: string): Promise<void>;
  sendVigileCredentials(vigile: any, tempPassword: string): Promise<void>;
}
