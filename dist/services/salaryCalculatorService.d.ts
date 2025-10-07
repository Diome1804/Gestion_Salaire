export interface SalaryRates {
    hourlyRate: number;
    dailyRate: number;
    overtimeRate: number;
}
export interface SalaryBreakdown {
    regularHours: number;
    overtimeHours: number;
    regularSalary: number;
    overtimeSalary: number;
    totalSalary: number;
}
export declare class SalaryCalculatorService {
    /**
     * Récupère les tarifs effectifs pour un employé
     * Priorité : tarifs personnalisés de l'employé > tarifs de l'entreprise
     */
    getEffectiveRates(employeeId: number): Promise<SalaryRates>;
    /**
     * Calcule le salaire pour une période donnée
     */
    calculateSalary(employeeId: number, startDate: Date, endDate: Date): Promise<number>;
    /**
     * Calcule la ventilation salariale pour une journée spécifique
     */
    calculateDailySalaryBreakdown(hoursWorked: number, rates: SalaryRates): SalaryBreakdown;
    /**
     * Met à jour les tarifs d'une entreprise
     */
    updateCompanyRates(companyId: number, rates: Partial<SalaryRates>): Promise<void>;
    /**
     * Met à jour les tarifs personnalisés d'un employé
     */
    updateEmployeeRates(employeeId: number, rates: Partial<SalaryRates>): Promise<void>;
    /**
     * Récupère tous les tarifs (entreprise + employé) pour un employé
     */
    getAllRates(employeeId: number): Promise<{
        companyRates: SalaryRates;
        employeeRates: Partial<SalaryRates>;
        effectiveRates: SalaryRates;
    }>;
}
//# sourceMappingURL=salaryCalculatorService.d.ts.map