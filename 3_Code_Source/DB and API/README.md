# DigitalBank — Tests API Supabase (Partie 2)

Ce dossier contient :
- une **collection Postman** prête à l’emploi (REST auto-généré par Supabase / PostgREST)
- des **scripts Node.js** pour tester l’API et vérifier le **Row Level Security (RLS)** par rôle
- un script de **test MFA (TOTP)**

## 1) Prérequis
- Node.js 18+
- Un projet Supabase (DB importée depuis la Partie 1)
- 3 utilisateurs Supabase Auth :
  - `jean.dupont@digitalbank.fr` (customer)
  - `analyst@digitalbank.fr` (analyst)
  - `admin@digitalbank.fr` (admin)

> ℹ️ Les rôles sont stockés dans `auth.users.app_metadata.role` (ex: `admin`, `analyst`).

## 2) Installation
Dans `3_Code_Source` :
```bash
npm install
```

Crée un `.env` (copie ` .env.example `) :
```bash
copy .env.example .env
```
Puis remplace les valeurs par celles de ton projet Supabase.

## 3) Lancer les tests
### A. Test API (customer)
```bash
npm run test:api
```
Attendu :
- `customers visibles: 1`
- `accounts visibles: ...` (uniquement ceux du client)
- `transactions visibles...` (uniquement celles de ses comptes)
- `audit_logs: BLOQUÉ (OK)`

### B. Test RLS par rôles
```bash
npm run test:roles
```
Attendu :
- CUSTOMER : voit seulement ses lignes (accounts/transactions)
- ANALYST : voit toutes les transactions (et comptes si tu as autorisé)
- ADMIN : accès complet

### C. Test MFA (TOTP)
```bash
npm run test:mfa
```
- 1er run : génère QR code/secret → scan dans Google Authenticator
- 2e run : mets `MFA_CODE` dans `.env` → vérifie le facteur

## 4) Postman
La collection est dans :
`tests/postman/DigitalBank_API_-_Supabase_postman_collection.json`

Dans Postman, configure l’environnement :
- `supabase_url`
- `api_key` (anon public key)
- `access_token` (rempli après login)

## ⚠️ Sécurité
- Ne **committe jamais** le `service_role_key` ni un `.env`.
- Utilise `anon` key côté client + RLS.

---
