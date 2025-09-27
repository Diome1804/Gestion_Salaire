import { UserRepository } from "./repositories/userRepository.js";
import { HashUtils } from "./utils/hash.js";
import { JwtUtils } from "./utils/jwt.js";
import { AuthService } from "./services/authService.js";
import { AuthController } from "./controllers/authController.js";
import { CompanyRepository } from "./repositories/companyRepository.js";
import { CompanyService } from "./services/companyService.js";
import { CompanyController } from "./controllers/companyController.js";
// Instantiate dependencies
const userRepository = new UserRepository();
const hashUtils = new HashUtils();
const jwtUtils = new JwtUtils();
const companyRepository = new CompanyRepository();
// Inject into services
const authService = new AuthService(userRepository, hashUtils, jwtUtils);
const companyService = new CompanyService(companyRepository);
// Inject into controllers
const authController = new AuthController(authService);
const companyController = new CompanyController(companyService);
export { authController, companyController };
//# sourceMappingURL=container.js.map