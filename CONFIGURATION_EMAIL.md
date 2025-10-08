# Configuration de l'Email (SendGrid)

## Problème Résolu

L'email n'était pas envoyé car les variables d'environnement n'étaient pas correctement configurées.

## Configuration Requise

### 1. Créer un compte SendGrid

1. Allez sur [SendGrid](https://sendgrid.com/)
2. Créez un compte gratuit (100 emails/jour gratuits)
3. Vérifiez votre email

### 2. Obtenir une clé API SendGrid

1. Connectez-vous à SendGrid
2. Allez dans **Settings** → **API Keys**
3. Cliquez sur **Create API Key**
4. Donnez un nom à votre clé (ex: "Gestion Salaire Production")
5. Sélectionnez **Full Access** ou au minimum **Mail Send**
6. Copiez la clé API (vous ne pourrez plus la voir après)

### 3. Configurer le fichier .env

Modifiez votre fichier `Gestion_Salaire/.env` :

```env
# Email Configuration (SendGrid)
SMTP_FROM="noreply@votre-domaine.com"
SMTP_PASS="SG.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"

# Frontend URL for email links
FRONTEND_URL="https://votre-domaine.com"
```

**Important:**
- `SMTP_FROM`: L'adresse email d'envoi (doit être vérifiée dans SendGrid)
- `SMTP_PASS`: Votre clé API SendGrid (commence par "SG.")
- `FRONTEND_URL`: L'URL de votre frontend pour les liens dans les emails

### 4. Vérifier l'adresse email d'envoi

Dans SendGrid:
1. Allez dans **Settings** → **Sender Authentication**
2. Vérifiez votre domaine OU
3. Vérifiez une adresse email unique (Single Sender Verification)

### 5. Redémarrer le serveur backend

```bash
cd Gestion_Salaire
npm run dev
```

## Vérification

Lors du démarrage, vous devriez voir dans les logs:

```
SendGrid Email Service Configuration: {
  apiKeyConfigured: 'YES',
  fromEmail: 'noreply@votre-domaine.com',
  apiKeyLength: 69
}
```

Si vous voyez `apiKeyConfigured: 'NO'`, vérifiez votre fichier `.env`.

## Test

1. Créez un nouvel employé avec une adresse email valide
2. Vérifiez les logs du serveur pour voir si l'email est envoyé
3. Vérifiez la boîte de réception de l'employé (et le dossier spam)

## Emails Envoyés

Le système envoie automatiquement des emails pour:

1. **Code QR de pointage** - Lors de la création d'un employé
2. **Identifiants vigile** - Lors de la création d'un utilisateur vigile
3. **Bulletins de paie** - Lors de la création d'une période de paie
4. **Notifications de paiement** - Lors de l'enregistrement d'un paiement

## Dépannage

### L'email n'est pas envoyé

1. Vérifiez que `SMTP_PASS` est bien configuré dans `.env`
2. Vérifiez que la clé API SendGrid est valide
3. Vérifiez que l'adresse `SMTP_FROM` est vérifiée dans SendGrid
4. Consultez les logs du serveur pour voir les erreurs détaillées

### Erreur "Unauthorized"

- Votre clé API SendGrid n'est pas valide ou a expiré
- Créez une nouvelle clé API dans SendGrid

### Erreur "The from email does not match a verified Sender Identity"

- L'adresse email dans `SMTP_FROM` n'est pas vérifiée dans SendGrid
- Allez dans SendGrid → Settings → Sender Authentication
- Vérifiez votre domaine ou votre adresse email

## Alternative: Utiliser un autre service d'email

Si vous ne voulez pas utiliser SendGrid, vous pouvez modifier `emailService.ts` pour utiliser:
- **Nodemailer** avec Gmail, Outlook, etc.
- **AWS SES** (Amazon Simple Email Service)
- **Mailgun**
- **Postmark**

## Production

Pour la production sur Render.com:

1. Allez dans votre service sur Render
2. Cliquez sur **Environment**
3. Ajoutez les variables:
   - `SMTP_FROM`: votre email vérifié
   - `SMTP_PASS`: votre clé API SendGrid
   - `FRONTEND_URL`: l'URL de votre frontend en production

4. Redéployez le service