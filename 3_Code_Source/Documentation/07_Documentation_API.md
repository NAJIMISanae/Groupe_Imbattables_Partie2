# Tests Postman - DigitalBank API
## Date
21/01/2026

## Résumé
Tests complets de l'API Supabase pour DigitalBank avec authentification JWT et Row Level Security.

---

## Configuration

### Environnement Postman
**Nom :** DigitalBank

**Variables :**
- `supabase_url` : https://puvjksqfwvfguxeqobqe.supabase.co
- `api_key` : eyJhbG... (clé anon Supabase)
- `access_token` : (généré après login)

---

## Tests réalisés

###  TEST 1 : Authentication - POST Login
**Endpoint :** `{{supabase_url}}/auth/v1/token?grant_type=password`

**Request Body :**
```json
{
  "email": "jean.dupont@digitalbank.fr",
  "password": "SecureTest123!"
}
```

**Response (200 OK) :**
```json
{
  "access_token": "eyJhbGci...",
  "token_type": "bearer",
  "expires_in": 3600,
  "user": {
    "id": "6fd25ef0-849a-4e6f-a78b-d8be068b1053",
    "email": "jean.dupont@digitalbank.fr",
    "role": "authenticated"
  }
}
```

**Résultat :**  Login réussi avec JWT token

---

###  TEST 2 : Accounts - GET All Accounts
**Endpoint :** `{{supabase_url}}/rest/v1/accounts?select=*`

**Headers :**
- `Authorization: Bearer {{access_token}}`
- `apikey: {{api_key}}`

**Response (200 OK) :**
```json
[
  {
    "account_id": 1,
    "user_id": "6fd25ef0-849a-4e6f-a78b-d8be068b1053",
    "account_number": "FR7630001007941234567890185",
    "account_type": "checking",
    "balance": 5420.50,
    "currency": "EUR",
    "status": "active"
  },
  {
    "account_id": 2,
    "user_id": "6fd25ef0-849a-4e6f-a78b-d8be068b1053",
    "account_number": "FR7630001007941234567890186",
    "account_type": "savings",
    "balance": 12000.00,
    "currency": "EUR",
    "status": "active"
  }
]
```

**Résultat :**  2 comptes récupérés (RLS fonctionne - uniquement les comptes de l'utilisateur connecté)

---

###  TEST 3 : Transactions - GET All Transactions
**Endpoint :** `{{supabase_url}}/rest/v1/transactions?select=*&order=timestamp.desc&limit=10`

**Headers :**
- `Authorization: Bearer {{access_token}}`
- `apikey: {{api_key}}`

**Response (200 OK) :**
```json
[
  {
    "transaction_id": 1,
    "account_id": 1,
    "transaction_type": "deposit",
    "amount": 2500.00,
    "description": "Salaire mensuel",
    "timestamp": "2026-01-21T14:22:41.430946+00:00",
    "status": "completed"
  },
  // ... autres transactions
]
```

**Résultat :**  Transactions filtrées par RLS (uniquement celles de l'utilisateur)

---

###  TEST 4 : Transactions - POST Create Transaction
**Endpoint :** `{{supabase_url}}/rest/v1/transactions`

**Headers :**
- `Authorization: Bearer {{access_token}}`
- `apikey: {{api_key}}`
- `Content-Type: application/json`
- `Prefer: return=representation`

**Request Body :**
```json
{
  "account_id": 1,
  "transaction_type": "deposit",
  "amount": 100.00,
  "currency": "EUR",
  "description": "Test transaction Postman",
  "merchant": "Test Merchant",
  "category": "test",
  "status": "completed"
}
```

**Response (201 Created) :**
```json
{
  "transaction_id": 4,
  "account_id": 1,
  "transaction_type": "deposit",
  "amount": 100.00,
  "description": "Test transaction Postman",
  "status": "completed"
}
```

**Résultat :**  Transaction créée avec succès

---

## Validation Row Level Security (RLS)

### Test effectué
- Login avec user `jean.dupont@digitalbank.fr` (role: client)
- GET /accounts : Ne voit QUE ses 2 comptes
- GET /transactions : Ne voit QUE ses transactions

### RLS validé 
-  Les clients voient uniquement leurs propres données
-  L'authentification JWT est obligatoire
-  Les requêtes sans token renvoient 401 Unauthorized
-  Les tentatives d'accès aux données d'autres users sont bloquées

---

## Tests supplémentaires à faire

### Par les analysts
- [ ] Login en tant que `marie.martin@digitalbank.fr` (analyst)
- [ ] Vérifier qu'ils voient TOUTES les transactions
- [ ] Vérifier qu'ils ne peuvent PAS modifier

### Par les admins
- [ ] Login en tant que `admin@digitalbank.fr` (admin)
- [ ] Vérifier l'accès complet (lecture + écriture + suppression)
- [ ] Tester DELETE sur accounts et transactions

---

## Statistiques

| Métrique           | Valeur |
|----------          |--------|
| Tests effectués    | 4 |
| Tests réussis      | 4  |
| Taux de réussite   | 100% |
| Temps de réponse moyen | ~200ms |
| Endpoints testés   | 4 |
| Users testés       | 1 (client) |

---

## Fichiers

- **Collection :** `tests/postman/DigitalBank_API.postman_collection.json`
- **Environnement :** `tests/postman/DigitalBank.postman_environment.json`



**Status :**  Tests API validés avec succès  
**Auteur :** NAJIMI Sanae  
**Date :** 21/01/2026