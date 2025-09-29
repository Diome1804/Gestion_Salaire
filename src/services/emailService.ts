import sgMail from '@sendgrid/mail';
import type { IEmailService } from './IEmailService.js';

export class EmailService implements IEmailService {
  constructor() {
    console.log('SendGrid API Config Debug:', {
      apiKey: process.env.SMTP_PASS ? 'SET' : 'NOT SET',
      from: process.env.SMTP_FROM
    });

    // Use SMTP_PASS as SendGrid API key
    sgMail.setApiKey(process.env.SMTP_PASS || '');
  }

  async sendEmail(to: string, subject: string, html: string): Promise<void> {
    const msg = {
      to,
      from: process.env.SMTP_FROM || 'noreply@gestion-salaire.com',
      subject,
      html,
    };

    await sgMail.send(msg);
  }
}
