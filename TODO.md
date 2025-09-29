# TODO: Implement Superadmin Company and User Creation Flow

## Completed
- [x] Update Prisma schema to add isTempPassword field to Users
- [x] Run migration for isTempPassword
- [x] Create IEmailService and EmailService for sending emails
- [x] Install nodemailer and types
- [x] Update IAuthService to include changePassword and modify createUserBySuperAdmin
- [x] Update IUserRepository and UserRepository to support update and isTempPassword
- [x] Modify AuthService to generate temp password, send email, and implement changePassword
- [x] Update container to inject EmailService
- [x] Update validations to remove password from createUserSchema and add changePasswordSchema
- [x] Update AuthController to handle temp password login and add changePassword
- [x] Update routes to allow ADMIN to create users and add change-password route
- [x] Modify createUser to set companyId for ADMIN
- [x] Regenerate Prisma client

## Remaining
- [ ] Test the flow: Create superadmin, login, create company, create admin user (check email), login as admin (force password change), change password, create caissier
- [ ] Ensure middleware restricts access properly (SUPERADMIN creates company, ADMIN creates CAISSIER)
- [ ] Add environment variables for SMTP (SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM, FRONTEND_URL)
- [ ] Update frontend to handle requirePasswordChange flag and redirect to change password
- [ ] Add validation to ensure SUPERADMIN can create ADMIN, ADMIN can create CAISSIER, but not vice versa

## New Task: Add Delete User Endpoint for Superadmin
- [x] Add delete method to IUserRepository interface
- [x] Implement delete in UserRepository
- [x] Add deleteUser to IAuthService interface
- [x] Implement deleteUser in AuthService
- [x] Add deleteUser to IAuthController interface
- [x] Implement deleteUser in AuthController
- [x] Add DELETE /auth/users/:id route with SUPERADMIN authorization
- [x] Regenerate Prisma client
