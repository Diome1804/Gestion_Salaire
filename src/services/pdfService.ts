import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

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
  async generatePayslipHTML(data: PayslipPDFData): Promise<string> {
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
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage();
    const { width, height } = page.getSize();

    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    const fontSize = 12;
    let yPosition = height - 50;

    // Fonction utilitaire pour formater la monnaie
    const formatCurrency = (amount: number) => {
      return new Intl.NumberFormat('fr-FR', {
        style: 'currency',
        currency: data.company.currency,
      }).format(amount);
    };

    // Fonction utilitaire pour dessiner du texte
    const drawText = (text: string, x: number, y: number, options: any = {}) => {
      page.drawText(text, { x, y, size: fontSize, font, ...options });
    };

    const drawBoldText = (text: string, x: number, y: number, options: any = {}) => {
      page.drawText(text, { x, y, size: fontSize, font: boldFont, ...options });
    };

    // En-tête
    drawBoldText('BULLETIN DE PAIE', width / 2 - 80, yPosition, { size: 18 });
    yPosition -= 30;
    drawBoldText(data.payRun.name, width / 2 - 60, yPosition, { size: 14 });
    yPosition -= 20;
    drawText(`Période: ${new Intl.DateTimeFormat('fr-FR').format(data.payRun.startDate)} - ${new Intl.DateTimeFormat('fr-FR').format(data.payRun.endDate)}`, width / 2 - 100, yPosition);
    yPosition -= 40;

    // Informations entreprise
    drawBoldText('Informations Entreprise', 50, yPosition);
    yPosition -= 20;
    drawText(`Nom: ${data.company.name}`, 50, yPosition);
    yPosition -= 15;
    drawText(`Adresse: ${data.company.address}`, 50, yPosition);
    yPosition -= 30;

    // Informations employé
    drawBoldText('Informations Employé', 50, yPosition);
    yPosition -= 20;
    drawText(`Nom: ${data.employee.fullName}`, 50, yPosition);
    yPosition -= 15;
    drawText(`Poste: ${data.employee.position}`, 50, yPosition);
    yPosition -= 15;
    drawText(`Type de contrat: ${data.employee.contractType}`, 50, yPosition);
    yPosition -= 40;

    // Détails salariaux
    drawBoldText('Détail de la Paie', 50, yPosition);
    yPosition -= 30;

    // Tableau des salaires
    const tableX = 50;
    const col1Width = 200;
    const col2Width = 150;

    // En-têtes du tableau
    drawBoldText('Description', tableX, yPosition);
    drawBoldText('Montant', tableX + col1Width, yPosition);
    yPosition -= 20;

    // Ligne séparatrice
    page.drawLine({
      start: { x: tableX, y: yPosition + 15 },
      end: { x: tableX + col1Width + col2Width, y: yPosition + 15 },
      thickness: 1,
      color: rgb(0, 0, 0),
    });
    yPosition -= 10;

    // Salaire brut
    drawText('Salaire brut', tableX, yPosition);
    drawText(formatCurrency(data.grossSalary), tableX + col1Width, yPosition);
    yPosition -= 20;

    // Déductions
    data.deductions.forEach(deduction => {
      drawText(deduction.label, tableX, yPosition);
      drawText(`-${formatCurrency(deduction.amount)}`, tableX + col1Width, yPosition);
      yPosition -= 20;
    });

    // Total déductions
    page.drawLine({
      start: { x: tableX, y: yPosition + 15 },
      end: { x: tableX + col1Width + col2Width, y: yPosition + 15 },
      thickness: 1,
      color: rgb(0, 0, 0),
    });
    yPosition -= 10;
    drawBoldText('Total déductions', tableX, yPosition);
    drawBoldText(`-${formatCurrency(data.totalDeductions)}`, tableX + col1Width, yPosition);
    yPosition -= 30;

    // Salaire net
    drawBoldText(`SALAIRE NET À PAYER: ${formatCurrency(data.netSalary)}`, width / 2 - 100, yPosition, {
      size: 16,
      color: rgb(0, 0.5, 0)
    });

    // Pied de page
    yPosition = 50;
    drawText('Ce bulletin de paie est généré automatiquement par le système de gestion salariale.', 50, yPosition, { size: 10 });
    yPosition -= 15;
    drawText(`Date de génération: ${new Intl.DateTimeFormat('fr-FR').format(new Date())}`, 50, yPosition, { size: 10 });

    const pdfBytes = await pdfDoc.save();
    return Buffer.from(pdfBytes);
  }

  async generateBulkPayslipsPDF(payslipsData: PayslipPDFData[]): Promise<Buffer> {
    const pdfDoc = await PDFDocument.create();

    for (const [index, data] of payslipsData.entries()) {
      if (index > 0) {
        // Ajouter une nouvelle page pour chaque bulletin après le premier
        pdfDoc.addPage();
      }

      const pages = pdfDoc.getPages();
      const page = pages[pages.length - 1]; // Toujours prendre la dernière page
      if (!page) continue; // Skip if page is undefined
      const { width, height } = page.getSize();

      const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
      const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

      const fontSize = 12;
      let yPosition = height - 50;

      // Fonction utilitaire pour formater la monnaie
      const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('fr-FR', {
          style: 'currency',
          currency: data.company.currency,
        }).format(amount);
      };

      // Fonction utilitaire pour dessiner du texte
      const drawText = (text: string, x: number, y: number, options: any = {}) => {
        page.drawText(text, { x, y, size: fontSize, font, ...options });
      };

      const drawBoldText = (text: string, x: number, y: number, options: any = {}) => {
        page.drawText(text, { x, y, size: fontSize, font: boldFont, ...options });
      };

      // En-tête
      drawBoldText('BULLETIN DE PAIE', width / 2 - 80, yPosition, { size: 18 });
      yPosition -= 30;
      drawBoldText(data.payRun.name, width / 2 - 60, yPosition, { size: 14 });
      yPosition -= 20;
      drawText(`Période: ${new Intl.DateTimeFormat('fr-FR').format(data.payRun.startDate)} - ${new Intl.DateTimeFormat('fr-FR').format(data.payRun.endDate)}`, width / 2 - 100, yPosition);
      yPosition -= 40;

      // Informations entreprise
      drawBoldText('Informations Entreprise', 50, yPosition);
      yPosition -= 20;
      drawText(`Nom: ${data.company.name}`, 50, yPosition);
      yPosition -= 15;
      drawText(`Adresse: ${data.company.address}`, 50, yPosition);
      yPosition -= 30;

      // Informations employé
      drawBoldText('Informations Employé', 50, yPosition);
      yPosition -= 20;
      drawText(`Nom: ${data.employee.fullName}`, 50, yPosition);
      yPosition -= 15;
      drawText(`Poste: ${data.employee.position}`, 50, yPosition);
      yPosition -= 15;
      drawText(`Type de contrat: ${data.employee.contractType}`, 50, yPosition);
      yPosition -= 40;

      // Détails salariaux
      drawBoldText('Détail de la Paie', 50, yPosition);
      yPosition -= 30;

      // Tableau des salaires
      const tableX = 50;
      const col1Width = 200;
      const col2Width = 150;

      // En-têtes du tableau
      drawBoldText('Description', tableX, yPosition);
      drawBoldText('Montant', tableX + col1Width, yPosition);
      yPosition -= 20;

      // Ligne séparatrice
      page.drawLine({
        start: { x: tableX, y: yPosition + 15 },
        end: { x: tableX + col1Width + col2Width, y: yPosition + 15 },
        thickness: 1,
        color: rgb(0, 0, 0),
      });
      yPosition -= 10;

      // Salaire brut
      drawText('Salaire brut', tableX, yPosition);
      drawText(formatCurrency(data.grossSalary), tableX + col1Width, yPosition);
      yPosition -= 20;

      // Déductions
      data.deductions.forEach(deduction => {
        drawText(deduction.label, tableX, yPosition);
        drawText(`-${formatCurrency(deduction.amount)}`, tableX + col1Width, yPosition);
        yPosition -= 20;
      });

      // Total déductions
      page.drawLine({
        start: { x: tableX, y: yPosition + 15 },
        end: { x: tableX + col1Width + col2Width, y: yPosition + 15 },
        thickness: 1,
        color: rgb(0, 0, 0),
      });
      yPosition -= 10;
      drawBoldText('Total déductions', tableX, yPosition);
      drawBoldText(`-${formatCurrency(data.totalDeductions)}`, tableX + col1Width, yPosition);
      yPosition -= 30;

      // Salaire net
      drawBoldText(`SALAIRE NET À PAYER: ${formatCurrency(data.netSalary)}`, width / 2 - 100, yPosition, {
        size: 16,
        color: rgb(0, 0.5, 0)
      });

      // Pied de page
      yPosition = 50;
      drawText('Ce bulletin de paie est généré automatiquement par le système de gestion salariale.', 50, yPosition, { size: 10 });
      yPosition -= 15;
      drawText(`Date de génération: ${new Intl.DateTimeFormat('fr-FR').format(new Date())}`, 50, yPosition, { size: 10 });
    }

    const pdfBytes = await pdfDoc.save();
    return Buffer.from(pdfBytes);
  }
}