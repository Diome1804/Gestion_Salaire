import { UserRepository } from "./repositories/userRepository.js";
import { HashUtils } from "./utils/hash.js";
import { JwtUtils } from "./utils/jwt.js";
import { AuthService } from "./services/authService.js";
import { AuthController } from "./controllers/authController.js";
import { CompanyRepository } from "./repositories/companyRepository.js";
import { CompanyService } from "./services/companyService.js";
import { CompanyController } from "./controllers/companyController.js";
import { CloudinaryFileUploadService } from "./services/cloudinaryFileUploadService.js";
import { EmailService } from "./services/emailService.js";
import { EmployeeRepository } from "./repositories/employeeRepository.js";
import { EmployeeService } from "./services/employeeService.js";
import { EmployeeController } from "./controllers/employeeController.js";

// Instantiate dependencies
const userRepository = new UserRepository();
const hashUtils = new HashUtils();
const jwtUtils = new JwtUtils();
const companyRepository = new CompanyRepository();
const employeeRepository = new EmployeeRepository();
const fileUploadService = new CloudinaryFileUploadService();
const emailService = new EmailService();

// Inject into services
const authService = new AuthService(userRepository, hashUtils, jwtUtils, emailService);
const companyService = new CompanyService(companyRepository);
const employeeService = new EmployeeService(employeeRepository);

// Inject into controllers
const authController = new AuthController(authService);
const companyController = new CompanyController(companyService, fileUploadService);
const employeeController = new EmployeeController(employeeService);

export { authController, companyController, employeeController };
