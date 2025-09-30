export interface PayslipPDFData {
    company: {
        name: string;
        address: string;
        currency: string;
    };
    employee: {
        fullName: string;
        position: string;
        contractType: string;
    };
    payRun: {
        name: string;
        period: string;
        startDate: Date;
        endDate: Date;
    };
    grossSalary: number;
    deductions: Array<{
        label: string;
        amount: number;
    }>;
    totalDeductions: number;
    netSalary: number;
}
export declare class PDFService {
    private generatePayslipHTML;
    generatePayslipPDF(data: PayslipPDFData): Promise<Buffer>;
    generateBulkPayslipsPDF(payslipsData: PayslipPDFData[]): Promise<Buffer>;
}
//# sourceMappingURL=pdfService.d.ts.map