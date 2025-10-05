# 🚀 Notes de Déploiement - Système de Présence

## ⚠️ Important: Déploiement Backend Requis

Le système de présence nécessite que le backend soit redéployé avec le nouveau code.

### Erreurs Attendues Avant Déploiement

Si vous voyez ces erreurs, c'est normal - le backend n'a pas encore le nouveau code:

```
GET /attendance/employee/12 404 (Not Found)
GET /attendance/today 404 (Not Found)
POST /attendance/scan 404 (Not Found)
```

## 📋 Checklist de Déploiement

### 1. Backend (Gestion_Salaire)

#### A. Installer les dépendances
```bash
cd Gestion_Salaire
npm install qrcode uuid
npm install @types/qrcode @types/uuid --save-dev
```

#### B. Exécuter les migrations Prisma
```bash
npx prisma migrate dev --name add_attendance_system
npx prisma generate
```

#### C. Vérifier les variables d'environnement
Assurez-vous que `.env` contient:
```env
# Email (déjà configuré)
SMTP_PASS=your_sendgrid_api_key
SMTP_FROM=noreply@yourcompany.com

# Frontend URL (pour les liens dans les emails)
FRONTEND_URL=https://your-frontend-url.com
```

#### D. Tester localement
```bash
npm run dev
```

Tester les endpoints:
- `GET /attendance/employee/1` - Doit retourner 200 (ou tableau vide)
- `POST /employees/1/generate-qr` - Doit retourner 200

#### E. Déployer sur Render/Heroku/etc.

**Sur Render:**
1. Push le code sur GitHub
2. Render détectera automatiquement les changements
3. Il exécutera `npm install` et `npx prisma generate`
4. Vérifier que les migrations sont appliquées

**Commande manuelle si nécessaire:**
```bash
npx prisma migrate deploy
```

### 2. Frontend (salary-management-system)

Le frontend est déjà prêt! Aucun déploiement spécial requis.

## 🧪 Tests Post-Déploiement

### Test 1: Vérifier les routes d'attendance
```bash
curl https://gestion-salaire.onrender.com/attendance/employee/1
```
Devrait retourner `200 OK` (même si tableau vide)

### Test 2: Créer un employé avec email
1. Connectez-vous en tant qu'admin
2. Créez un employé avec un email
3. L'employé devrait être créé sans erreur

### Test 3: Générer un QR code
1. Allez sur la page de détails de l'employé
2. Cliquez sur l'onglet "Code QR"
3. Cliquez sur "Générer et Envoyer le Code QR"
4. Vérifiez que l'email est reçu

### Test 4: Créer un vigile
1. Allez dans "Admins"
2. Créez un utilisateur avec rôle "VIGILE"
3. Le vigile devrait recevoir un email avec:
   - Ses identifiants
   - Un lien vers `/vigile/login`

### Test 5: Tester le pointage
1. Connectez-vous en tant que vigile sur `/vigile/login`
2. Essayez de scanner un QR code (ou simuler)
3. Vérifiez que le pointage est enregistré

## 🐛 Résolution des Problèmes

### Problème: "404 Not Found" sur /attendance/*
**Cause:** Le backend n'a pas été redéployé avec le nouveau code

**Solution:**
1. Vérifier que le code est bien sur GitHub
2. Vérifier que Render/Heroku a bien redéployé
3. Vérifier les logs de déploiement

### Problème: "Module not found: qrcode"
**Cause:** Les dépendances ne sont pas installées

**Solution:**
```bash
cd Gestion_Salaire
npm install qrcode uuid
```

### Problème: Vigile ne reçoit pas d'email
**Cause:** Service email non configuré ou erreur d'envoi

**Solution:**
1. Vérifier `SMTP_PASS` dans `.env`
2. Vérifier `SMTP_FROM` dans `.env`
3. Vérifier les logs du serveur pour erreurs email
4. Tester avec un email personnel d'abord

### Problème: "Column 'email' does not exist"
**Cause:** Migrations Prisma non appliquées

**Solution:**
```bash
npx prisma migrate deploy
# ou en dev
npx prisma migrate dev
```

## 📊 Vérification de la Base de Données

Après déploiement, vérifier que les tables ont les nouvelles colonnes:

```sql
-- Vérifier Employee
DESCRIBE Employee;
-- Devrait avoir: email, qrCode, matricule

-- Vérifier Attendance
DESCRIBE Attendance;
-- Devrait avoir: checkInTime, checkOutTime, scannedBy

-- Vérifier Users (enum Role)
SHOW COLUMNS FROM Users WHERE Field = 'role';
-- Devrait inclure: VIGILE
```

## ✅ Confirmation de Succès

Vous saurez que tout fonctionne quand:

1. ✅ Aucune erreur 404 sur les routes `/attendance/*`
2. ✅ Les employés peuvent être créés avec email
3. ✅ Les QR codes sont générés et envoyés par email
4. ✅ Les vigiles reçoivent leurs identifiants par email
5. ✅ Le pointage fonctionne (check-in/check-out)
6. ✅ Les rapports de présence affichent des données

## 🔄 Ordre de Déploiement Recommandé

1. **Backend d'abord** - Déployer Gestion_Salaire
2. **Tester les endpoints** - Vérifier que tout fonctionne
3. **Frontend ensuite** - Déployer salary-management-system (si nécessaire)
4. **Tests end-to-end** - Tester le workflow complet

## 📞 Support

Si vous rencontrez des problèmes:
1. Vérifier les logs du serveur backend
2. Vérifier la console du navigateur (F12)
3. Tester les endpoints avec Postman/curl
4. Vérifier que les migrations sont appliquées