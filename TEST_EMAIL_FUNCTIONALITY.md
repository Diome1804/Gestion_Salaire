# 🧪 Test de la Fonctionnalité Email

## Checklist Rapide

- [ ] SendGrid configuré (compte créé, clé API obtenue)
- [ ] Email d'envoi vérifié dans SendGrid
- [ ] Variables `.env` configurées (`SMTP_FROM`, `SMTP_PASS`)
- [ ] Serveur backend redémarré
- [ ] Logs vérifiés au démarrage

## Test Complet Étape par Étape

### 1. Vérifier la Configuration au Démarrage

Démarrez le serveur:
```bash
cd Gestion_Salaire
npm run dev
```

**Attendu dans les logs:**
```
SendGrid Email Service Configuration: {
  apiKeyConfigured: 'YES',
  fromEmail: 'noreply@votre-domaine.com',
  apiKeyLength: 69
}
```

**Si vous voyez `apiKeyConfigured: 'NO'`:**
- ❌ `SMTP_PASS` n'est pas configuré dans `.env`
- ➡️ Suivez les instructions dans `CONFIGURATION_EMAIL.md`

### 2. Créer un Employé avec Email

1. Ouvrez le frontend: http://localhost:5173
2. Connectez-vous en tant qu'ADMIN ou SUPERADMIN
3. Allez sur la page "Employees"
4. Cliquez sur "Add Employee"
5. Remplissez le formulaire:
   - **Full Name**: Test Employee
   - **Position**: Developer
   - **Contract Type**: FIXED
   - **Rate or Salary**: 5000
   - **Email**: `votre-email-de-test@gmail.com` ⚠️ **IMPORTANT: Utilisez un vrai email que vous pouvez consulter**
   - **Bank Details**: (optionnel)
6. Cliquez sur "Save"

### 3. Vérifier les Logs du Serveur

**Logs attendus (succès):**
```
📧 Sending email to votre-email-de-test@gmail.com with subject: Votre Code QR de Pointage
✅ Email sent successfully to votre-email-de-test@gmail.com
```

**Logs en cas d'erreur:**
```
❌ Failed to send email to votre-email-de-test@gmail.com: [détails de l'erreur]
SendGrid Error Response: { ... }
```

### 4. Vérifier la Réponse Frontend

**Si l'email est envoyé avec succès:**
```json
{
  "message": "Employé créé et code QR envoyé par email",
  "employee": { ... },
  "qrCodeSent": true
}
```

Une alerte devrait apparaître: "Employé créé avec succès! Un code QR a été envoyé par email."

**Si l'email échoue:**
```json
{
  "message": "Employé créé mais erreur lors de l'envoi du code QR par email: [raison]",
  "employee": { ... },
  "qrCodeSent": false,
  "emailError": "[détails]"
}
```

### 5. Vérifier la Base de Données

```sql
SELECT id, fullName, email, qrCode, createdAt 
FROM Employee 
WHERE email = 'votre-email-de-test@gmail.com';
```

**Attendu:**
- `email`: doit contenir l'email que vous avez saisi
- `qrCode`: doit contenir une valeur comme `EMP-15-uuid-ici`

### 6. Vérifier l'Email Reçu

1. Consultez la boîte de réception de l'email de test
2. **Vérifiez aussi le dossier SPAM** ⚠️
3. Recherchez un email avec le sujet: "Votre Code QR de Pointage"

**Contenu attendu de l'email:**
- Salutation: "Bonjour [Nom de l'employé]"
- Image du code QR (format Data URL)
- Instructions pour utiliser le code QR
- Message de confidentialité

### 7. Vérifier dans SendGrid Dashboard

1. Allez sur https://app.sendgrid.com/
2. Cliquez sur "Activity" dans le menu
3. Cherchez l'email envoyé à votre adresse de test
4. Vérifiez le statut:
   - ✅ **Delivered**: Email reçu avec succès
   - ⏳ **Processed**: En cours d'envoi
   - ❌ **Bounced**: Adresse email invalide
   - ❌ **Dropped**: Bloqué par SendGrid

## Scénarios de Test

### Test 1: Email Valide ✅
- Email: `test@gmail.com`
- Résultat attendu: Email envoyé et reçu

### Test 2: Email Invalide ❌
- Email: `test@invalid-domain-xyz.com`
- Résultat attendu: Erreur "bounced" dans SendGrid

### Test 3: Sans Configuration SendGrid ❌
- `SMTP_PASS` vide dans `.env`
- Résultat attendu: Erreur "Email service not configured"

### Test 4: Clé API Invalide ❌
- `SMTP_PASS` avec une mauvaise clé
- Résultat attendu: Erreur "Unauthorized" de SendGrid

### Test 5: Email Non Vérifié ❌
- `SMTP_FROM` avec un email non vérifié dans SendGrid
- Résultat attendu: Erreur "does not match a verified Sender Identity"

## Dépannage

### Problème: "apiKeyConfigured: 'NO'"
**Solution:**
1. Vérifiez que `.env` contient `SMTP_PASS=...`
2. Pas d'espaces autour du `=`
3. Pas de guillemets autour de la valeur
4. Redémarrez le serveur

### Problème: "Unauthorized"
**Solution:**
1. Votre clé API SendGrid est invalide ou expirée
2. Créez une nouvelle clé API dans SendGrid
3. Mettez à jour `SMTP_PASS` dans `.env`
4. Redémarrez le serveur

### Problème: "The from email does not match a verified Sender Identity"
**Solution:**
1. Allez dans SendGrid → Settings → Sender Authentication
2. Vérifiez votre domaine OU
3. Vérifiez une adresse email unique (Single Sender Verification)
4. Mettez à jour `SMTP_FROM` dans `.env` avec l'email vérifié
5. Redémarrez le serveur

### Problème: Email dans le spam
**Solution:**
1. C'est normal pour les nouveaux comptes SendGrid
2. Marquez l'email comme "Non spam"
3. Ajoutez l'expéditeur à vos contacts
4. Pour la production, configurez SPF, DKIM, DMARC

### Problème: Email non reçu
**Solution:**
1. Vérifiez SendGrid Activity pour voir le statut
2. Vérifiez le dossier spam
3. Attendez quelques minutes (peut prendre jusqu'à 5 min)
4. Vérifiez que l'adresse email est correcte dans la BDD

## Commandes Utiles

### Voir les logs en temps réel
```bash
cd Gestion_Salaire
npm run dev | grep -E "Email|SendGrid|📧|✅|❌"
```

### Vérifier la configuration
```bash
cd Gestion_Salaire
cat .env | grep SMTP
```

### Tester avec curl
```bash
curl -X POST http://localhost:3000/employees \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "fullName": "Test Employee",
    "position": "Developer",
    "contractType": "FIXED",
    "rateOrSalary": 5000,
    "email": "test@example.com"
  }'
```

## Résultat Final Attendu

✅ Employé créé dans la base de données  
✅ Email stocké dans la colonne `email`  
✅ Code QR généré et stocké dans la colonne `qrCode`  
✅ Email envoyé avec le code QR en image  
✅ Email reçu dans la boîte de réception (ou spam)  
✅ Logs détaillés dans le serveur  

## Support

Si après tous ces tests vous avez encore des problèmes:

1. Copiez les logs du serveur
2. Copiez votre configuration `.env` (sans la clé API)
3. Vérifiez le statut dans SendGrid Activity
4. Consultez `CONFIGURATION_EMAIL.md` section Dépannage