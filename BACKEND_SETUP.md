# Configuration Backend - Système de Présence

## 📦 Dépendances à Installer

Pour que le système de présence fonctionne, installez ces dépendances dans le projet backend:

```bash
cd Gestion_Salaire
npm install qrcode
npm install uuid
npm install @types/qrcode --save-dev
npm install @types/uuid --save-dev
```

### Dépendances déjà installées (normalement)
- `nodemailer` - Pour l'envoi d'emails (déjà configuré dans votre .env)
- `@prisma/client` - Pour la base de données
- `bcrypt` - Pour le hashage des mots de passe

## 🗄️ Migrations Base de Données

Après avoir récupéré les changements du schema Prisma, exécutez:

```bash
npx prisma migrate dev --name add_attendance_system
npx prisma generate
```

## 📧 Configuration Email (Déjà fait)

Votre `.env` contient déjà:
```env
SMTP_HOST=...
SMTP_PORT=...
SMTP_USER=...
SMTP_PASS=...
SMTP_FROM=...
```

## 🎯 Endpoints à Implémenter

### 1. Génération QR Code pour Employé
**POST** `/employees/:id/generate-qr`

```typescript
import QRCode from 'qrcode';
import { v4 as uuidv4 } from 'uuid';

// Générer un code QR unique
const qrCode = `EMP-${employee.id}-${uuidv4()}`;

// Sauvegarder dans la base de données
await prisma.employee.update({
  where: { id: parseInt(id) },
  data: { qrCode }
});

// Générer l'image QR
const qrCodeImage = await QRCode.toDataURL(qrCode);

// Envoyer par email (utiliser votre service email existant)
await emailService.send({
  to: employee.email,
  subject: 'Votre Code QR de Pointage',
  html: `
    <h2>Bonjour ${employee.fullName},</h2>
    <p>Voici votre code QR pour le pointage:</p>
    <img src="${qrCodeImage}" alt="QR Code" />
    <p>Présentez ce code au vigile pour pointer.</p>
  `
});
```

### 2. Scanner QR Code (Pointage)
**POST** `/attendance/scan`

```typescript
// Body: { qrCode: string }

// 1. Trouver l'employé
const employee = await prisma.employee.findUnique({
  where: { qrCode: body.qrCode }
});

// 2. Vérifier si déjà pointé aujourd'hui
const today = new Date();
today.setHours(0, 0, 0, 0);

const existing = await prisma.attendance.findFirst({
  where: {
    employeeId: employee.id,
    date: { gte: today }
  }
});

// 3. Si pas de check-in, créer entrée
if (!existing) {
  await prisma.attendance.create({
    data: {
      employeeId: employee.id,
      date: today,
      checkInTime: new Date(),
      isPresent: true,
      scannedBy: req.user.id // ID du vigile
    }
  });
  return { message: "Entrée enregistrée" };
}

// 4. Si check-in existe mais pas check-out, enregistrer sortie
if (existing.checkInTime && !existing.checkOutTime) {
  const now = new Date();
  const hours = (now - existing.checkInTime) / (1000 * 60 * 60);
  
  await prisma.attendance.update({
    where: { id: existing.id },
    data: {
      checkOutTime: now,
      hoursWorked: hours
    }
  });
  return { message: "Sortie enregistrée", hoursWorked: hours };
}

// 5. Sinon, déjà pointé
return { error: "Déjà pointé aujourd'hui" };
```

### 3. Pointage Manuel (HONORAIRE)
**POST** `/attendance/manual`

```typescript
// Body: { matricule: string, checkInTime: string, checkOutTime: string }

const employee = await prisma.employee.findUnique({
  where: { matricule: body.matricule }
});

if (employee.contractType !== 'HONORAIRE') {
  return { error: "Réservé aux HONORAIRE" };
}

const checkIn = new Date(`${today}T${body.checkInTime}`);
const checkOut = new Date(`${today}T${body.checkOutTime}`);
const hours = (checkOut - checkIn) / (1000 * 60 * 60);

await prisma.attendance.create({
  data: {
    employeeId: employee.id,
    date: today,
    checkInTime: checkIn,
    checkOutTime: checkOut,
    hoursWorked: hours,
    isPresent: true,
    scannedBy: req.user.id
  }
});
```

### 4. Présences du Jour
**GET** `/attendance/today`

```typescript
const today = new Date();
today.setHours(0, 0, 0, 0);

const attendance = await prisma.attendance.findMany({
  where: {
    date: { gte: today },
    employee: { companyId: req.user.companyId }
  },
  include: {
    employee: {
      select: { id: true, fullName: true, position: true }
    }
  }
});
```

### 5. Historique Employé
**GET** `/attendance/employee/:id`

```typescript
const attendance = await prisma.attendance.findMany({
  where: { employeeId: parseInt(id) },
  orderBy: { date: 'desc' },
  take: 30
});
```

### 6. Rapport de Présences
**GET** `/attendance/report?startDate=...&endDate=...&contractType=...`

```typescript
const where = {
  employee: { companyId: req.user.companyId }
};

if (query.startDate) where.date = { gte: new Date(query.startDate) };
if (query.endDate) where.date = { ...where.date, lte: new Date(query.endDate) };
if (query.contractType) where.employee.contractType = query.contractType;

const attendance = await prisma.attendance.findMany({
  where,
  include: { employee: true }
});
```

## 🔐 Middleware Requis

```typescript
// Vérifier que l'utilisateur est VIGILE
export const requireVigile = (req, res, next) => {
  if (req.user.role !== 'VIGILE') {
    return res.status(403).json({ message: 'Accès refusé' });
  }
  next();
};
```

## 🛣️ Routes à Ajouter

```typescript
// Dans vos routes
router.post('/employees/:id/generate-qr', authenticate, employeeController.generateQRCode);
router.post('/attendance/scan', authenticate, requireVigile, attendanceController.scanQRCode);
router.post('/attendance/manual', authenticate, requireVigile, attendanceController.manualCheckIn);
router.get('/attendance/today', authenticate, requireVigile, attendanceController.getTodayAttendance);
router.get('/attendance/employee/:id', authenticate, attendanceController.getEmployeeAttendance);
router.get('/attendance/report', authenticate, attendanceController.getAttendanceReport);
```

## 💰 Calcul Salaires (Intégration)

Modifier la logique de calcul des payslips pour utiliser les présences:

```typescript
async function calculateSalary(employee, payRun) {
  const attendance = await prisma.attendance.findMany({
    where: {
      employeeId: employee.id,
      date: {
        gte: payRun.startDate,
        lte: payRun.endDate
      },
      isPresent: true
    }
  });

  switch (employee.contractType) {
    case 'FIXED':
      // Salaire fixe mensuel
      return employee.rateOrSalary;
      
    case 'DAILY':
      // Nombre de jours × taux journalier
      const daysWorked = attendance.length;
      return daysWorked * employee.rateOrSalary;
      
    case 'FREELANCE':
      // Nombre de jours présents × taux
      const freelanceDays = attendance.length;
      return freelanceDays * employee.rateOrSalary;
      
    case 'HONORAIRE':
      // Total heures × taux horaire
      const totalHours = attendance.reduce((sum, a) => sum + (a.hoursWorked || 0), 0);
      return totalHours * employee.rateOrSalary;
  }
}
```

## ✅ Checklist

- [ ] Installer les dépendances (`qrcode`, `uuid`)
- [ ] Exécuter les migrations Prisma
- [ ] Implémenter les 6 endpoints
- [ ] Ajouter le middleware `requireVigile`
- [ ] Ajouter les routes
- [ ] Modifier le calcul des salaires
- [ ] Tester avec Postman/Insomnia
- [ ] Déployer

## 🧪 Test Rapide

```bash
# 1. Générer QR pour employé ID 1
curl -X POST http://localhost:3000/employees/1/generate-qr \
  -H "Authorization: Bearer ADMIN_TOKEN"

# 2. Scanner QR (vigile)
curl -X POST http://localhost:3000/attendance/scan \
  -H "Authorization: Bearer VIGILE_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"qrCode": "EMP-1-uuid-ici"}'

# 3. Voir présences du jour
curl http://localhost:3000/attendance/today \
  -H "Authorization: Bearer VIGILE_TOKEN"
```

## 📝 Notes Importantes

1. **QR Code Format**: `EMP-{employeeId}-{uuid}` pour garantir l'unicité
2. **Timezone**: Utiliser UTC ou la timezone locale de manière cohérente
3. **Sécurité**: Valider que le vigile appartient à la même entreprise que l'employé
4. **Performance**: Indexer les colonnes `qrCode` et `matricule` dans la base de données
5. **Logs**: Logger tous les pointages pour audit

## 🐛 Erreurs Courantes

- **"Déjà pointé"**: Vérifier la logique de check-in/check-out
- **"QR invalide"**: Vérifier le format du QR code
- **"Email non envoyé"**: Vérifier la config SMTP dans .env