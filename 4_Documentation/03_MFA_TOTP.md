# MFA (TOTP) — Configuration et test

## 1) Activer MFA dans Supabase
Supabase Dashboard → **Authentication → Multi-Factor**
- Activer **TOTP**

> Si l’écran Multi-Factor n’apparaît pas : vérifie que tu es bien dans le **bon projet** et que tu as les droits Owner.

## 2) Enrôler MFA (TOTP) côté client
La façon la plus simple pour ton livrable :
- se connecter avec l’utilisateur
- lancer l’enrôlement TOTP
- scanner le QR code dans Google Authenticator
- vérifier avec un code 6 digits

## 3) Script de test fourni
Dans `3_Code_Source` :
```bash
copy .env.example .env
# renseigne SUPABASE_URL, SUPABASE_ANON_KEY, MFA_EMAIL, MFA_PASSWORD
npm install
npm run test:mfa
```
- **1er run** : le script affiche `factorId` + QR / secret
- **2e run** : ajoute `MFA_CODE=123456` puis relance → `MFA verified!`

## 4) Preuve à capturer (screenshot)
- Page Supabase : Multi-Factor (TOTP enabled)
- Console : sortie du script `npm run test:mfa` (enroll + verify)
