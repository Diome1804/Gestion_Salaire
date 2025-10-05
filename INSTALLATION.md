# 🚀 Installation Rapide - Système de Présence

## Backend (Gestion_Salaire)

### 1. Installer les dépendances
```bash
cd Gestion_Salaire
npm install qrcode uuid
npm install @types/qrcode @types/uuid --save-dev
```

### 2. Exécuter les migrations
```bash
npx prisma migrate dev --name add_attendance_system
npx prisma generate
```

### 3. Démarrer le serveur
```bash
npm run dev
```

✅ Le backend est prêt! Tous les endpoints sont implémentés.

---

## Frontend (salary-management-system)

### 1. Installer les dépendances
```bash
cd salary-management-system
npm install
```

### 2. Remplacer les sons (optionnel)
- Télécharger des sons sur https://freesound.org/
- Remplacer `public/sounds/success.mp3` (son "ting")
- Remplacer `public/sounds/error.mp3` (son d'erreur)

### 3. Activer le scanner QR
Dans `src/components/attendance/QRScanner.jsx`, ajouter en haut:
```javascript
import jsQR from 'jsqr';
```

### 4. Démarrer l'application
```bash
npm run dev
```

✅ Le frontend est prêt!

---

## 🧪 Test Rapide

### 1. Créer un employé avec email
- Connectez-vous en tant qu'admin
- Allez dans "Employees"
- Créez un employé avec une adresse email

### 2. Générer le QR code
- Cliquez sur l'employé
- Allez dans l'onglet "Code QR"
- Cliquez sur "Générer et Envoyer le Code QR"
- L'employé reçoit le QR par email

### 3. Créer un vigile
- Allez dans "Admins"
- Créez un utilisateur avec rôle "VIGILE"
- Le vigile reçoit ses identifiants par email

### 4. Tester le pointage
- Connectez-vous sur `/vigile/login` avec les identifiants du vigile
- Scannez le QR code de l'employé (ou uploadez l'image)
- Vérifiez que le pointage est enregistré

### 5. Voir les rapports
- Retournez sur le compte admin
- Allez dans "Présences"
- Consultez les rapports de présence

---

## 📦 Dépendances Installées

### Backend
- `qrcode` - Génération de codes QR
- `uuid` - Génération d'identifiants uniques

### Frontend
- `jsqr` - Décodage de codes QR
- `html5-qrcode` - Scanner QR avec caméra
- `qrcode` - Génération de codes QR

---

## ✅ Checklist

### Backend
- [x] Code implémenté
- [ ] Dépendances installées (`npm install qrcode uuid`)
- [ ] Migrations exécutées (`npx prisma migrate dev`)
- [ ] Serveur démarré (`npm run dev`)

### Frontend
- [x] Code implémenté
- [ ] Dépendances installées (`npm install`)
- [ ] Import jsQR ajouté dans QRScanner.jsx
- [ ] Sons remplacés (optionnel)
- [ ] Application démarrée (`npm run dev`)

---

## 🎯 Endpoints Disponibles

### Employés
- `POST /employees/:id/generate-qr` - Générer QR code
- `GET /employees/:id/qr` - Obtenir QR code

### Présences
- `POST /attendance/scan` - Scanner QR (VIGILE)
- `POST /attendance/manual` - Pointage manuel (VIGILE)
- `GET /attendance/today` - Présences du jour (VIGILE)
- `GET /attendance/employee/:id` - Historique employé
- `GET /attendance/report` - Rapport de présences (ADMIN)

---

## 🐛 Problèmes Courants

### "Module not found: qrcode"
```bash
cd Gestion_Salaire
npm install qrcode uuid
```

### "Cannot find module 'jsqr'"
```bash
cd salary-management-system
npm install
```

### Scanner ne fonctionne pas
- Ajouter `import jsQR from 'jsqr';` dans QRScanner.jsx
- Autoriser l'accès à la caméra dans le navigateur
- Utiliser HTTPS en production

### Email non envoyé
- Vérifier la configuration SMTP dans `.env`
- Vérifier que l'employé a une adresse email

---

## 📞 Support

Consultez les fichiers de documentation:
- `BACKEND_SETUP.md` - Détails backend
- `FRONTEND_NOTES.md` - Détails frontend
- `INTEGRATION_CHECKLIST.md` - Checklist complète