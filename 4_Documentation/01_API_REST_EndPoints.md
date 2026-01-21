# Documentation API REST — Supabase (PostgREST)

## Base URL
- `https://<project-ref>.supabase.co/rest/v1`

## Authentification
- Login (email/password) :
  - `POST https://<project-ref>.supabase.co/auth/v1/token?grant_type=password`
  - Headers :
    - `apikey: <anon_key>`
    - `Content-Type: application/json`
  - Body JSON :
    - `{ "email": "...", "password": "..." }`

La réponse contient `access_token`. Pour appeler l’API REST, ajouter :
- `Authorization: Bearer <access_token>`
- `apikey: <anon_key>`

## Endpoints utilisés (examen)
### Customers
- `GET /customers?select=customer_id,email,first_name,last_name`
  - RLS : renvoie 1 ligne pour le client connecté (match par email).

### Accounts
- `GET /accounts?select=*`
- `GET /accounts?account_id=eq.<id>&select=*`

### Transactions
- `GET /transactions?account_id=eq.<account_id>&select=*&order=timestamp.desc&limit=10`
- `POST /transactions`
  - Headers : `Prefer: return=representation`
  - Body : JSON d’une transaction (au minimum `account_id`, `transaction_type`, `amount`, `currency`, `timestamp`...)

### Audit logs (admin only)
- `GET /audit_logs?select=*` (doit être bloqué pour customer/analyst)
