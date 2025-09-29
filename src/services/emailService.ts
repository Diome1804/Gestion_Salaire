import nodemailer from 'nodemailer';
import type { IEmailService } from './IEmailService.js';

export class EmailService implements IEmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    console.log('SMTP Config Debug:', {
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      user: process.env.SMTP_USER ? 'SET' : 'NOT SET',
      pass: process.env.SMTP_PASS ? 'SET' : 'NOT SET',
      from: process.env.SMTP_FROM
    });

    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_PORT === '465', // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
      // Add timeout and debug
      connectionTimeout: 10000, // 10 seconds
      greetingTimeout: 10000,
      socketTimeout: 10000,
      debug: true,
      logger: true,
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
