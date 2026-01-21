# RLS — Rôles et règles d’accès

## Rôles
Nous utilisons les rôles suivants dans `auth.users.app_metadata.role` :
- `customer`
- `analyst`
- `admin`

> Dans un JWT Supabase, `app_metadata` est disponible via `auth.jwt()` / `auth.jwt()->'app_metadata'` côté SQL.

## Liaison Customer ⇄ User (sans changer le schéma)
Plutôt que d’ajouter une colonne `user_id` dans `customers`, on relie par **email** :
- `customers.email = auth.jwt()->>'email'`

✅ Avantages :
- pas de migration du schéma
- simple pour un examen

⚠️ Condition :
- l’email Supabase Auth doit être **exactement** celui présent dans `customers.email`.

## Logique attendue
- **Customer** :
  - voit uniquement sa ligne `customers`
  - voit uniquement ses `accounts` (via `customer_id`)
  - voit uniquement les `transactions` de ses comptes
- **Analyst** :
  - voit toutes les `transactions`
  - (optionnel) voit tous les comptes
- **Admin** : accès complet (SELECT/INSERT/UPDATE/DELETE)

## Tests rapides
- Avec le script : `npm run test:roles`
- Avec Postman :
  - login customer → GET /customers (doit renvoyer 1 ligne)
  - login analyst → GET /transactions (doit renvoyer toutes les transactions)

