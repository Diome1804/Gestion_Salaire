export class CompanyService {
    companyRepository;
    constructor(companyRepository) {
        this.companyRepository = companyRepository;
        //
    }
    async createCompany(data) {
        const transformedData = {
            ...data,
            logo: data.logo ?? null,
        };
        return this.companyRepository.create(transformedData);
    }
    async getCompanyById(id) {
        return this.companyRepository.findById(id);
    }
    async updateCompany(id, data) {
        const transformedData = {};
        if (data.name !== undefined)
            transformedData.name = data.name;
        if (data.logo !== undefined)
            transformedData.logo = data.logo ?? null;
        if (data.address !== undefined)
            transformedData.address = data.address;
        if (data.currency !== undefined)
            transformedData.currency = data.currency;
        if (data.periodType !== undefined)
            transformedData.periodType = data.periodType;
        if (data.allowImpersonation !== undefined)
            transformedData.allowImpersonation = data.allowImpersonation;
        return this.companyRepository.update(id, transformedData);
    }
    async deleteCompany(id) {
        await this.companyRepository.delete(id);
    }
    async getAllCompanies() {
        return this.companyRepository.findAll();
    }
}
//# sourceMappingURL=companyService.js.map