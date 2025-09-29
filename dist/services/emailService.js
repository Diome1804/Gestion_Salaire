import sgMail from '@sendgrid/mail';
export class EmailService {
    constructor() {
        console.log('SendGrid API Config Debug:', {
            apiKey: process.env.SMTP_PASS ? 'SET' : 'NOT SET',
            from: process.env.SMTP_FROM
        });
        // Use SMTP_PASS as SendGrid API key
        sgMail.setApiKey(process.env.SMTP_PASS || '');
    }
    async sendEmail(to, subject, html) {
        const msg = {
            to,
            from: process.env.SMTP_FROM || 'noreply@gestion-salaire.com',
            subject,
            html,
        };
        await sgMail.send(msg);
    }
}
//# sourceMappingURL=emailService.js.map