import prisma from "../config/prisma.js";
export class EmployeeService {
    employeeRepository;
    constructor(employeeRepository) {
        this.employeeRepository = employeeRepository;
    }
    async createEmployee(data) {
        // Validate email is provided
        if (!data.email || !data.email.trim()) {
            throw new Error("L'email est obligatoire pour tous les employés");
        }
        return this.employeeRepository.create(data);
    }
    async updateEmployee(id, data) {
        const employee = await this.employeeRepository.findById(id);
        if (!employee)
            throw new Error("Employé non trouvé");
        return this.employeeRepository.update(id, data);
    }
    async getAllEmployees(filters) {
        return this.employeeRepository.findAll(filters);
    }
    async getEmployeeById(id) {
        return this.employeeRepository.findById(id);
    }
    async deleteEmployee(id) {
        const employee = await this.employeeRepository.findById(id);
        if (!employee)
            throw new Error("Employé non trouvé");
        await this.employeeRepository.delete(id);
    }
    async activateEmployee(id) {
        const employee = await this.employeeRepository.findById(id);
        if (!employee)
            throw new Error("Employé non trouvé");
        return this.employeeRepository.activate(id);
    }
    async deactivateEmployee(id) {
        const employee = await this.employeeRepository.findById(id);
        if (!employee)
            throw new Error("Employé non trouvé");
        return this.employeeRepository.deactivate(id);
    }
}
//# sourceMappingURL=employeeService.js.map