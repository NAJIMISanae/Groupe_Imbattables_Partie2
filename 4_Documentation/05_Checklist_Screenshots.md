# Checklist — Screenshots à livrer

> Objectif : que les captures correspondent **au nouveau projet Supabase** (celui de l’examen) et aux policies finales.

## A. Base de données
1. **Tables créées/importées** : écran `Database → Tables` (on voit `customers`, `accounts`, `transactions`, `audit_logs`, `cards`, `login_attempts`, etc.)
2. **SQL migration / import** : exécution réussie dans `SQL Editor` (ou screenshot de l’outil d’import)

## B. Authentification
3. **Email provider** activé : `Authentication → Providers` (Email enabled + email confirmations)
4. **URL redirections** : `Authentication → URL Configuration` (Site URL + Redirect URLs)
5. **Utilisateurs** créés : `Authentication → Users` (les 3 emails `jean.dupont@digitalbank.fr`, `analyst@digitalbank.fr`, `admin@digitalbank.fr`)

## C. MFA
6. **Multi-Factor (TOTP)** activé : `Authentication → Multi-Factor`
7. (optionnel) screenshot Postman / script montrant `mfa.enroll` ou `mfa.verify` réussi

## D. Sécurité / RLS
8. **RLS activé** : écran `Authentication → Policies` ou `Database → Tables` montrant RLS enabled pour les tables sensibles
9. **Liste des policies** sur :
   - `customers`
   - `accounts`
   - `transactions`
   - `audit_logs`

## E. API / Tests
10. Postman : **Login** (token OK)
11. Postman : **GET customers (RLS)** renvoie 1 ligne pour le client
12. Postman : **GET accounts** renvoie uniquement ses comptes
13. Postman : **GET transactions** renvoie uniquement ses transactions
14. Postman : test **analyst/admin** montrant accès élargi (au minimum transactions)

---

## ⚠️ À refaire dans ton dossier actuel
Dans ton zip actuel, certaines captures semblent venir d’une ancienne version (ex: capture “roles/profiles” et capture “tables UNRESTRICTED”).
Refais les captures 1, 5, 6, 8, 9 à partir du projet Supabase de l’examen.
