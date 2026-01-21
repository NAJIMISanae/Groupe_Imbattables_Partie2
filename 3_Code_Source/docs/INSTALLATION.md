# Guide d’installation — DigitalBank (Supabase)

## 1) Prérequis
- Node.js 18+
- Un projet Supabase (gratuit)
- Base restaurée (Partie 1) importée dans Supabase

## 2) Récupérer les infos Supabase
Dans Supabase Dashboard :
- **Settings → API**
  - **Project URL** → `SUPABASE_URL`
  - **anon public key** → `SUPABASE_ANON_KEY`
  - **service_role key** (secret) → `SUPABASE_SERVICE_ROLE_KEY` (utile uniquement pour scripts admin, à ne jamais exposer)

> 💡 URL correcte de ton projet : `https://<project-ref>.supabase.co`

## 3) Installer les dépendances
Dans `3_Code_Source` :
```bash
npm install
```

## 4) Variables d’environnement
Copie le template puis remplis :
```bash
copy .env.example .env
```

## 5) Lancer les tests
```bash
npm run test:api
npm run test:roles
```

## 6) MFA (TOTP)
1. Active MFA côté Supabase (Dashboard → Authentication → Multi-Factor)
2. Mets `MFA_EMAIL`, `MFA_PASSWORD` dans `.env`
3. Lance :
```bash
npm run test:mfa
```
- Scan QR code
- Renseigne `MFA_CODE` puis relance

## Dépannage rapide
- `Cannot find package 'dotenv'` → `npm install`
- `Invalid login credentials` → vérifie email/password dans `.env` + user confirmé (Auto Confirm User)
- `audit_logs accessible` en customer/analyst → tes policies audit_logs sont trop permissives
