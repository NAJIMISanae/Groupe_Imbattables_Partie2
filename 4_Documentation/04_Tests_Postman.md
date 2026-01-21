# Tests Postman — DigitalBank API

## 1) Import
Importer la collection :
`3_Code_Source/tests/postman/DigitalBank_API_-_Supabase_postman_collection.json`

## 2) Variables d’environnement (Postman)
Créer un environnement `DigitalBank` avec :
- `supabase_url` : `https://<project-ref>.supabase.co`
- `api_key` : **anon public key**
- `access_token` : vide au départ (remplie après login)

## 3) Flow recommandé
1. **POST Login (Client)** : récupère `access_token` et le colle dans la variable d’environnement `access_token`.
2. **GET Current User** : vérifie l’identité.
3. **GET Customers (RLS)** : doit renvoyer 1 ligne pour le customer.
4. **GET All Accounts** : doit renvoyer seulement ses comptes.
5. **GET Transactions** : filtre par `account_id` + ordre timestamp.

## 4) Headers standards
Pour toutes les requêtes REST sur `/rest/v1` :
- `apikey: {{api_key}}`
- `Authorization: Bearer {{access_token}}`
- `Accept: application/json`

> Sans `Authorization`, tu seras en rôle `anon` et RLS peut bloquer.
