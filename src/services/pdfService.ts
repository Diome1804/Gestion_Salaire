import puppeteer from 'puppeteer';

export interface PayslipPDFData {
  // Infos entreprise
  company: {
    name: string;
    address: string;
    currency: string;
  };

  // Infos employé
  employee: {
    fullName: string;
    position: string;
    contractType: string;
  };

  // Infos paie
  payRun: {
    name: string;
    period: string;
    startDate: Date;
    endDate: Date;
  };

  // Calculs
  grossSalary: number;
  deductions: Array<{label: string, amount: number}>;
  totalDeductions: number;
  netSalary: number;
}

export class PDFService {
  private async generatePayslipHTML(data: PayslipPDFData): Promise<string> {
    const formatCurrency = (amount: number) => {
      return new Intl.NumberFormat('fr-FR', {
        style: 'currency',
        currency: data.company.currency,
      }).format(amount);
    };

    const formatDate = (date: Date) => {
      return new Intl.DateTimeFormat('fr-FR').format(new Date(date));
    };

    return `
      <!DOCTYPE html>
      <html lang="fr">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Bulletin de Paie - ${data.employee.fullName}</title>
        <style>
          body {
            font-family: 'Arial', sans-serif;
            margin: 0;
            padding: 20px;
            background-color: #f5f5f5;
          }
          .container {
            max-width: 800px;
            margin: 0 auto;
            background: white;
            padding: 30px;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
          }
          .header {
            text-align: center;
            border-bottom: 2px solid #333;
            padding-bottom: 20px;
            margin-bottom: 30px;
          }
          .company-info {
            margin-bottom: 20px;
          }
          .employee-info {
            background: #f8f9fa;
            padding: 15px;
            border-radius: 5px;
            margin-bottom: 20px;
          }
          .salary-section {
            margin: 20px 0;
          }
          .salary-table {
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
          }
          .salary-table th, .salary-table td {
            padding: 12px;
            text-align: left;
            border-bottom: 1px solid #ddd;
          }
          .salary-table th {
            background-color: #f8f9fa;
            font-weight: bold;
          }
          .total-row {
            background-color: #e9ecef;
            font-weight: bold;
          }
          .net-salary {
            font-size: 18px;
            color: #28a745;
            text-align: center;
            margin: 20px 0;
            padding: 15px;
            background: #d4edda;
            border-radius: 5px;
          }
          .footer {
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #ddd;
            text-align: center;
            font-size: 12px;
            color: #666;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>BULLETIN DE PAIE</h1>
            <h2>${data.payRun.name}</h2>
            <p>Période: ${formatDate(data.payRun.startDate)} - ${formatDate(data.payRun.endDate)}</p>
          </div>

          <div class="company-info">
            <h3>${data.company.name}</h3>
            <p>${data.company.address}</p>
          </div>

          <div class="employee-info">
            <h3>Informations de l'Employé</h3>
            <p><strong>Nom:</strong> ${data.employee.fullName}</p>
            <p><strong>Poste:</strong> ${data.employee.position}</p>
            <p><strong>Type de contrat:</strong> ${data.employee.contractType}</p>
          </div>

          <div class="salary-section">
            <h3>Détail de la Paie</h3>

            <table class="salary-table">
              <thead>
                <tr>
                  <th>Description</th>
                  <th>Montant</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Salaire brut</td>
                  <td>${formatCurrency(data.grossSalary)}</td>
                </tr>
                ${data.deductions.map(deduction => `
                  <tr>
                    <td>${deduction.label}</td>
                    <td>-${formatCurrency(deduction.amount)}</td>
                  </tr>
                `).join('')}
                <tr class="total-row">
                  <td>Total déductions</td>
                  <td>-${formatCurrency(data.totalDeductions)}</td>
                </tr>
              </tbody>
            </table>

            <div class="net-salary">
              <strong>SALAIRE NET À PAYER: ${formatCurrency(data.netSalary)}</strong>
            </div>
          </div>

          <div class="footer">
            <p>Ce bulletin de paie est généré automatiquement par le système de gestion salariale.</p>
            <p>Date de génération: ${formatDate(new Date())}</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  async generatePayslipPDF(data: PayslipPDFData): Promise<Buffer> {
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    try {
      const page = await browser.newPage();
      const html = await this.generatePayslipHTML(data);

      await page.setContent(html, { waitUntil: 'networkidle0' });

      const pdfBuffer = await page.pdf({
        format: 'A4',
        printBackground: true,
        margin: {
          top: '20px',
          right: '20px',
          bottom: '20px',
          left: '20px'
        }
      });

      return Buffer.from(pdfBuffer);
    } finally {
      await browser.close();
    }
  }

  async generateBulkPayslipsPDF(payslipsData: PayslipPDFData[]): Promise<Buffer> {
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    try {
      const page = await browser.newPage();

      // Créer une page HTML avec tous les bulletins
      const html = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <title>Bulletins de Paie - Lot</title>
          <style>
            .page-break { page-break-before: always; }
            body { margin: 0; }
          </style>
        </head>
        <body>
          ${await Promise.all(payslipsData.map(async (data, index) => {
            const payslipHtml = await this.generatePayslipHTML(data);
            const cleanHtml = payslipHtml
              .replace(/<!DOCTYPE html>/, '')
              .replace(/<html.*?>/, '')
              .replace(/<\/html>/, '')
              .replace(/<head>[\s\S]*?<\/head>/, '')
              .replace(/<body.*?>/, '')
              .replace(/<\/body>/, '');

            return `${index > 0 ? '<div class="page-break"></div>' : ''}${cleanHtml}`;
          }))}
        </body>
        </html>
      `;

      await page.setContent(html, { waitUntil: 'networkidle0' });

      const pdfBuffer = await page.pdf({
        format: 'A4',
        printBackground: true,
        margin: {
          top: '20px',
          right: '20px',
          bottom: '20px',
          left: '20px'
        }
      });

      return Buffer.from(pdfBuffer);
    } finally {
      await browser.close();
    }
  }
}