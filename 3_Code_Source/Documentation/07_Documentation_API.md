# Documentation API + Tests Postman — DigitalBank (Supabase)

> ⚠️ Ce document est un **template**. Remplace les valeurs par celles de TON projet (ne pas committer les clés).

## 1) Variables Postman
Environnement : `DigitalBank`
- `supabase_url` : `https://<project-ref>.supabase.co`
- `api_key` : `<anon_public_key>`
- `access_token` : (rempli après login)

## 2) TEST 1 — Login (Email/Password)
**POST** `{{supabase_url}}/auth/v1/token?grant_type=password`

Headers:
- `apikey: {{api_key}}`
- `Content-Type: application/json`

Body:
```json
{
  "email": "jean.dupont@digitalbank.fr",
  "password": "SecureTest123!"
}
```

✅ Résultat attendu : 200 OK + `access_token`

## 3) TEST 2 — Current user
**GET** `{{supabase_url}}/auth/v1/user`

Headers:
- `apikey: {{api_key}}`
- `Authorization: Bearer {{access_token}}`

## 4) TEST 3 — Customers (RLS)
**GET** `{{supabase_url}}/rest/v1/customers?select=customer_id,email,first_name,last_name`

Headers:
- `apikey: {{api_key}}`
- `Authorization: Bearer {{access_token}}`

✅ Attendu : **1 ligne** (le client connecté), car policy basée sur `customers.email = auth.email()`.

## 5) TEST 4 — Accounts (RLS)
**GET** `{{supabase_url}}/rest/v1/accounts?select=*`

Headers:
- `apikey: {{api_key}}`
- `Authorization: Bearer {{access_token}}`

✅ Attendu : uniquement les comptes du client.

## 6) TEST 5 — Transactions d’un compte
**GET** `{{supabase_url}}/rest/v1/transactions?account_id=eq.1&select=*&order=timestamp.desc&limit=10`

Headers:
- `apikey: {{api_key}}`
- `Authorization: Bearer {{access_token}}`

✅ Attendu : uniquement les transactions des comptes autorisés.

## 7) TEST 6 — Audit logs (doit être bloqué)
**GET** `{{supabase_url}}/rest/v1/audit_logs?select=*`

✅ Attendu : **403 / permission denied** pour customer et analyst.

---

## Notes rôles (analyst/admin)
Le rôle est stocké dans : `auth.users.app_metadata.role`.
- `admin` : accès complet
- `analyst` : accès étendu (au minimum transactions)
- `customer` : accès limité à ses données
