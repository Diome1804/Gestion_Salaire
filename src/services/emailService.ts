import nodemailer from 'nodemailer';
import type { IEmailService } from './IEmailService.js';

export class EmailService implements IEmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  async sendEmail(to: string, subject: string, html: string): Promise<void> {
    const mailOptions = {
      from: process.env.SMTP_FROM || 'noreply@gestion-salaire.com',
      to,
      subject,
      html,
    };

    await this.transporter.sendMail(mailOptions);
  }
}
