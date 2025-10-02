export class PayslipService {
    payslipRepository;
    payRunService;
    constructor(payslipRepository, payRunService) {
        this.payslipRepository = payslipRepository;
        this.payRunService = payRunService;
    }
    async getPayslipById(id) {
        return this.payslipRepository.findById(id);
    }
    async getPayslipsByPayRun(payRunId) {
        return this.payslipRepository.findByPayRun(payRunId);
    }
    async getPayslipsByEmployee(employeeId) {
        return this.payslipRepository.findByEmployee(employeeId);
    }
    async getPayslipsByCompany(companyId) {
        return this.payslipRepository.findByCompany(companyId);
    }
    async updatePayslip(id, data, userId) {
        // Vérifier que le bulletin peut être modifié
        const canModify = await this.canModifyPayslip(id);
        if (!canModify) {
            throw new Error("Ce bulletin ne peut pas être modifié (cycle approuvé ou clôturé)");
        }
        const payslip = await this.payslipRepository.findById(id);
        if (!payslip) {
            throw new Error("Bulletin de paie non trouvé");
        }
        // Calculer les nouvelles valeurs
        const deductions = data.deductions || [];
        const { totalDeductions, netSalary } = this.calculateNetSalary(payslip.grossSalary, deductions);
        // Mettre à jour le bulletin
        const updateData = {
            deductions: deductions,
            totalDeductions,
            netSalary
        };
        if (data.notes !== undefined) {
            updateData.notes = data.notes;
        }
        const updatedPayslip = await this.payslipRepository.update(id, updateData);
        // TODO: Recalculer les totaux du cycle de paie
        // await this.updatePayRunTotals(payslip.payRunId);
        return updatedPayslip;
    }
    calculateNetSalary(grossSalary, deductions) {
        const totalDeductions = deductions.reduce((sum, deduction) => sum + deduction.amount, 0);
        const netSalary = grossSalary - totalDeductions;
        return {
            totalDeductions,
            netSalary: Math.max(0, netSalary) // Éviter les valeurs négatives
        };
    }
    async canModifyPayslip(payslipId) {
        const payslip = await this.payslipRepository.findById(payslipId);
        if (!payslip)
            return false;
        const payRun = await this.payRunService.getPayRunById(payslip.payRunId);
        if (!payRun)
            return false;
        // Seuls les cycles en DRAFT peuvent être modifiés
        return payRun.status === 'DRAFT';
    }
}
//# sourceMappingURL=payslipService.js.map