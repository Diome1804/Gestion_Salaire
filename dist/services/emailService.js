import nodemailer from 'nodemailer';
export class EmailService {
    transporter;
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
    async sendEmail(to, subject, html) {
        const mailOptions = {
            from: process.env.SMTP_FROM || 'noreply@gestion-salaire.com',
            to,
            subject,
            html,
        };
        await this.transporter.sendMail(mailOptions);
    }
}
//# sourceMappingURL=emailService.js.map