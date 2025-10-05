import sgMail from '@sendgrid/mail';
import QRCode from 'qrcode';
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

  async sendQRCode(employee: any, qrCodeData: string): Promise<void> {
    // Generate QR code image
    const qrCodeImage = await QRCode.toDataURL(qrCodeData);

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">Bonjour ${employee.fullName},</h2>
        <p>Voici votre code QR pour le pointage:</p>
        <div style="text-align: center; margin: 30px 0;">
          <img src="${qrCodeImage}" alt="QR Code" style="max-width: 300px;" />
        </div>
        <p>Présentez ce code au vigile pour pointer votre présence à l'entrée et à la sortie.</p>
        <p style="color: #dc2626;"><strong>Important:</strong> Gardez ce code confidentiel.</p>
        <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;" />
        <p style="color: #6b7280; font-size: 12px;">
          Cet email a été envoyé automatiquement par le système de gestion des salaires.
        </p>
      </div>
    `;

    await this.sendEmail(employee.email, 'Votre Code QR de Pointage', html);
  }

  async sendVigileCredentials(vigile: any, tempPassword: string): Promise<void> {
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">Bonjour ${vigile.name} ${vigile.prenom},</h2>
        <p>Vous avez été créé en tant que vigile. Voici vos identifiants de connexion:</p>
        <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p style="margin: 10px 0;"><strong>Email:</strong> ${vigile.email}</p>
          <p style="margin: 10px 0;"><strong>Mot de passe temporaire:</strong> <code style="background-color: #e5e7eb; padding: 4px 8px; border-radius: 4px;">${tempPassword}</code></p>
        </div>
        <p>Connectez-vous sur: <a href="${frontendUrl}/vigile/login" style="color: #2563eb;">${frontendUrl}/vigile/login</a></p>
        <p style="color: #dc2626;"><strong>Important:</strong> Changez votre mot de passe après la première connexion.</p>
        <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;" />
        <p style="color: #6b7280; font-size: 12px;">
          Cet email a été envoyé automatiquement par le système de gestion des salaires.
        </p>
      </div>
    `;

    await this.sendEmail(vigile.email, 'Vos Identifiants Vigile', html);
  }
}
