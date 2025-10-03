# Système de Gestion des Salaires - Backend API

## Description
API REST backend pour la gestion complète des salaires, développée avec Node.js, TypeScript, Express et Prisma. L'API gère l'authentification, les entreprises, les employés, les cycles de paie, les bulletins de salaire, les paiements et les rapports.

## Technologies Utilisées
- **Node.js** : Environnement d'exécution JavaScript côté serveur
- **TypeScript** : JavaScript avec typage statique
- **Express.js** : Framework web pour Node.js
- **Prisma** : ORM pour la base de données
- **PostgreSQL** : Base de données relationnelle
- **JWT** : Authentification basée sur les tokens
- **bcrypt** : Hashage des mots de passe
- **Nodemailer** : Envoi d'emails
- **PDF-lib** : Génération de PDFs
- **Cloudinary** : Stockage et gestion des fichiers

## Architecture
L'application suit une architecture en couches (Layered Architecture) :

- **Routes** : Définition des endpoints API
- **Contrôleurs** : Logique métier et gestion des requêtes/réponses
- **Services** : Logique métier complexe
- **Repositories** : Accès aux données
- **Middlewares** : Authentification, validation, etc.
- **Utils** : Utilitaires (hash, JWT, etc.)

## Rôles Utilisateurs
- **SUPERADMIN** : Accès complet à toutes les fonctionnalités
- **ADMIN** : Gestion d'une entreprise spécifique
- **CAISSIER** : Gestion des paiements pour une entreprise
- **EMPLOYEE** : Accès limité à ses propres données

## Installation et Configuration

### Prérequis
- Node.js (v18+)
- PostgreSQL
- npm ou yarn

### Installation
```bash
cd Gestion_Salaire
npm install
```

### Configuration de la Base de Données
1. Créer une base de données PostgreSQL
2. Configurer les variables d'environnement dans un fichier `.env` :
```env
DATABASE_URL="postgresql://username:password@localhost:5432/database_name"
JWT_SECRET="your-jwt-secret"
EMAIL_HOST="smtp.gmail.com"
EMAIL_PORT=587
EMAIL_USER="your-email@gmail.com"
EMAIL_PASS="your-app-password"
CLOUDINARY_CLOUD_NAME="your-cloud-name"
CLOUDINARY_API_KEY="your-api-key"
CLOUDINARY_API_SECRET="your-api-secret"
FRONTEND_URL="http://localhost:3000"
```

### Migration de la Base de Données
```bash
npx prisma migrate dev
npx prisma generate
```

### Démarrage
```bash
# Mode développement
npm run dev

# Production
npm run build
npm start
```

## API Endpoints

### Authentification
```
POST /api/auth/login
POST /api/auth/register
POST /api/auth/me
```

### Entreprises (SUPERADMIN uniquement)
```
GET    /api/companies
POST   /api/companies
GET    /api/companies/:id2025
PUT    /api/companies/:id
DELETE /api/companies/:id
POST   /api/companies/:id/logo
```

### Employés
```
GET    /api/employees
POST   /api/employees
GET    /api/employees/:id
PUT    /api/employees/:id
DELETE /api/employees/:id
GET    /api/employees/company/:companyId
```

### Cycles de Paie (PayRuns)
```
GET    /api/payruns
POST   /api/payruns
GET    /api/payruns/:id
PUT    /api/payruns/:id
DELETE /api/payruns/:id
POST   /api/payruns/:id/approve
POST   /api/payruns/:id/close
```

### Bulletins de Salaire (Payslips)
```
GET    /api/payslips
GET    /api/payslips/:id
PUT    /api/payslips/:id
GET    /api/payslips/payrun/:payRunId
GET    /api/payslips/employee/:employeeId
GET    /api/payslips/company/:companyId
GET    /api/payslips/:id/pdf
GET    /api/payruns/:payRunId/payslips/pdf
```

### Paiements
```
GET    /api/payments
GET    /api/payments/:id
GET    /api/payments/payslip/:payslipId
POST   /api/payments
PUT    /api/payments/:id
DELETE /api/payments/:id
GET    /api/payments/:id/receipt
GET    /api/payments/company/:companyId/list
GET    /api/payruns/:payRunId/register
```

## Notifications par Email

### Notifications Automatiques
- **Disponibilité des bulletins** : Email envoyé aux employés quand un cycle de paie est créé
- **Confirmation de paiement** : Email envoyé aux employés quand un paiement est effectué

### Configuration Email
L'API utilise Nodemailer pour l'envoi d'emails. Configurez les variables d'environnement pour votre fournisseur SMTP.

## Gestion des Fichiers
- **Upload de logos d'entreprise** : Via Cloudinary
- **Génération de PDFs** : Bulletins, reçus de paiement, registres de paie

## Sécurité
- Authentification JWT avec expiration
- Hashage des mots de passe avec bcrypt
- Validation des données d'entrée
- Contrôle d'accès basé sur les rôles
- Protection contre les attaques CSRF

## Scripts Disponibles
```bash
npm run dev      # Démarrage en mode développement
npm run build    # Compilation TypeScript
npm start        # Démarrage en production
npm run lint     # Vérification du code
```

## Tests et Débogage

### Tests API avec cURL

#### 1. Authentification
```bash
# Connexion
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"password"}'

# Réponse: {"token":"jwt-token","user":{...}}
```

#### 2. Gestion des Entreprises
```bash
# Créer une entreprise (SUPERADMIN)
curl -X POST http://localhost:5000/api/companies \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name":"Entreprise ABC",
    "address":"123 Rue de la Paix",
    "currency":"XOF",
    "taxId":"123456789"
  }'
```

#### 3. Gestion des Employés
```bash
# Créer un employé
curl -X POST http://localhost:5000/api/employees \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "firstName":"John",
    "lastName":"Doe",
    "email":"john.doe@company.com",
    "position":"Développeur",
    "salary":500000,
    "contractType":"CDI",
    "companyId":1
  }'
```

#### 4. Création d'un Cycle de Paie
```bash
# Créer un cycle de paie
curl -X POST http://localhost:5000/api/payruns \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name":"Paie Novembre 2024",
    "periodType":"MONTHLY",
    "startDate":"2024-11-01",
    "endDate":"2024-11-30"
  }'
```

#### 5. Gestion des Paiements
```bash
# Créer un paiement
curl -X POST http://localhost:5000/api/payments \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "payslipId":1,
    "amount":500000,
    "paymentMethod":"BANK_TRANSFER",
    "reference":"PAY-001"
  }'
```

#### 6. Export PDF
```bash
# Télécharger un bulletin PDF
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  http://localhost:5000/api/payslips/1/pdf \
  -o bulletin.pdf

# Télécharger un reçu de paiement
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  http://localhost:5000/api/payments/1/receipt \
  -o recu.pdf
```

## Déploiement
L'API est configurée pour le déploiement sur Render.com avec support PostgreSQL.

## Contribution
1. Fork le projet
2. Créer une branche feature
3. Commiter les changements
4. Push vers la branche
5. Créer une Pull Request

## Support
Pour toute question ou problème, veuillez créer une issue sur le dépôt GitHub.
