import prisma from "../config/prisma.js";
export class EmployeeService {
    employeeRepository;
    constructor(employeeRepository) {
        this.employeeRepository = employeeRepository;
    }
    async createEmployee(data) {
        // Check if user exists and belongs to the company
        const user = await prisma.users.findUnique({ where: { id: data.userId } });
        if (!user)
            throw new Error("Utilisateur non trouvé");
        if (user.companyId !== data.companyId)
            throw new Error("L'utilisateur n'appartient pas à cette entreprise");
        // Check if employee already exists for this user
        const existing = await this.employeeRepository.findByUserId(data.userId);
        if (existing)
            throw new Error("Employé déjà créé pour cet utilisateur");
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