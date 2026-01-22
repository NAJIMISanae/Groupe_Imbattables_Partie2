# 📸 Guide Screenshots - DigitalBank API

**15 screenshots à capturer** pour valider le projet

⏱️ **Temps total :** 20 minutes

---

## 🎯 Liste complète des screenshots

### GROUPE 1 : Setup Supabase (5 screenshots)

✅ **01 - Création du projet Supabase**
- Dashboard Supabase → Projects
- Montrer le projet "digitalbank-prod"
- **Fichier :** `01_creation_projet_supabase.png`

✅ **02 - Configuration API**
- Dashboard Supabase → Settings → API
- Montrer Project URL et les clés API
- **Fichier :** `02_configuration_api_supabase.png`

✅ **03 - Table Editor**
- Dashboard Supabase → Table Editor
- Vue d'ensemble des 6 tables
- **Fichier :** `03_vue_tables_supabase.png`

✅ **04 - Table customers (10 lignes)**
- Dashboard Supabase → Table Editor → customers
- Montrer les 10 lignes avec colonnes : customer_id, email, first_name, last_name, city
- **Fichier :** `04_table_customers_10_lignes.png`

✅ **05 - Table transactions (60 lignes)**
- Dashboard Supabase → Table Editor → transactions
- Montrer quelques lignes avec colonne `is_fraud` visible
- Scroll pour montrer qu'il y a 60 lignes
- **Fichier :** `05_table_transactions_60_lignes.png`

---

### GROUPE 2 : Vérification SQL (3 screenshots)

✅ **06 - Import du schéma SQL**
- Dashboard Supabase → SQL Editor
- Montrer le fichier `schema_customers.sql` copié dans l'éditeur
- **Fichier :** `06_import_schema_sql.png`

✅ **07 - Exécution SQL réussie**
- Dashboard Supabase → SQL Editor
- Montrer "Success. No rows returned" après exécution
- **Fichier :** `07_execution_sql_reussie.png`

✅ **08 - Vérification COUNT**
- Dashboard Supabase → SQL Editor → New Query
- Exécuter :
  ```sql
  SELECT 'customers' as table_name, COUNT(*) as count FROM customers
  UNION ALL
  SELECT 'accounts', COUNT(*) FROM accounts
  UNION ALL
  SELECT 'transactions', COUNT(*) FROM transactions
  UNION ALL
  SELECT 'transactions frauduleuses', COUNT(*) FROM transactions WHERE is_fraud = TRUE;
  ```
- Montrer résultat : 10, 13, 60, 20
- **Fichier :** `08_verification_count_sql.png`

---

### GROUPE 3 : Tests automatisés (3 screenshots)

✅ **09 - npm install**
- Terminal VS Code
- Commande : `npm install`
- Montrer "added 45 packages"
- **Fichier :** `09_npm_install_reussi.png`

✅ **10 - npm test - Partie 1**
- Terminal VS Code
- Commande : `npm test`
- Montrer Tests 1-3 (Login, Token, Customer Info) ✅
- **Fichier :** `10_tests_partie1_reussis.png`

✅ **11 - npm test - Partie 2**
- Terminal VS Code
- Scroll vers le bas
- Montrer Tests 4-5 (Accounts, Transactions) ✅
- Montrer "TOUS LES TESTS TERMINÉS AVEC SUCCÈS"
- **Fichier :** `11_tests_partie2_reussis.png`

---

### GROUPE 4 : Code source (2 screenshots)

✅ **12 - Fichier auth-custom.js**
- VS Code → `api/auth-custom.js`
- Montrer les fonctions : login, verifyToken, getCustomerInfo
- **Fichier :** `12_code_auth_custom.png`

✅ **13 - Fichier .env configuré**
- VS Code → `.env`
- Montrer les 3 variables (URL, ANON_KEY, SERVICE_ROLE_KEY)
- ⚠️ Flouter SERVICE_ROLE_KEY pour sécurité !
- **Fichier :** `13_fichier_env_configure.png`

---

### GROUPE 5 : Tests Postman (2 screenshots optionnels)

✅ **14 - Collection Postman**
- Postman
- Montrer la collection importée
- **Fichier :** `14_collection_postman.png`

✅ **15 - Test Postman réussi**
- Postman
- Montrer requête GET Accounts avec résultat 200 OK
- **Fichier :** `15_test_postman_reussi.png`

---

## 📝 Instructions détaillées par screenshot

### Screenshot 01 : Création projet Supabase

**Étapes :**
1. Aller sur https://supabase.com/dashboard
2. Cliquer sur ton projet "digitalbank-prod"
3. Capturer l'écran montrant la page d'accueil du projet

**Ce qui doit être visible :**
- Nom du projet
- Région (Europe West)
- Date de création

---

### Screenshot 04 : Table customers

**Étapes :**
1. Dashboard Supabase → Table Editor
2. Cliquer sur "customers"
3. Capturer l'écran montrant les 10 lignes

**Ce qui doit être visible :**
- 10 lignes de customers
- Colonnes : customer_id, email, first_name, last_name, city
- Jean Dupont, Marie Martin, Pierre Bernard, etc.

---

### Screenshot 08 : Vérification COUNT

**Requête SQL à exécuter :**
```sql
SELECT 'customers' as table_name, COUNT(*) as count FROM customers
UNION ALL
SELECT 'accounts', COUNT(*) FROM accounts
UNION ALL
SELECT 'cards', COUNT(*) FROM cards
UNION ALL
SELECT 'transactions', COUNT(*) FROM transactions
UNION ALL
SELECT 'login_attempts', COUNT(*) FROM login_attempts
UNION ALL
SELECT 'transactions frauduleuses', COUNT(*) FROM transactions WHERE is_fraud = TRUE;
```

**Résultat attendu :**
```
customers                | 10
accounts                 | 13
cards                    | 10
transactions             | 60
login_attempts           | 20
transactions frauduleuses| 20
```

---

### Screenshot 11 : Tests complets

**Commande :**
```bash
npm test
```

**Ce qui doit être visible :**
- ✅ TEST 1 : Login réussi !
- ✅ TEST 2 : Token valide !
- ✅ TEST 3 : Infos récupérées !
- ✅ TEST 4 : 2 compte(s) trouvé(s) !
- ✅ TEST 5 : 6 transaction(s) trouvée(s) !
- ✅ TOUS LES TESTS TERMINÉS AVEC SUCCÈS

---

### Screenshot 13 : Fichier .env

**⚠️ SÉCURITÉ :**
Avant de capturer, **FLOUTER** la SERVICE_ROLE_KEY :
1. Ouvrir .env dans VS Code
2. Sélectionner la valeur de SERVICE_ROLE_KEY
3. Utiliser un outil de capture avec flou/pixelisation
4. OU remplacer temporairement par : `eyJhbGci... [MASQUÉ POUR SÉCURITÉ]`

---

## ✅ Checklist finale

- [ ] 01 - Création projet Supabase
- [ ] 02 - Configuration API
- [ ] 03 - Vue tables
- [ ] 04 - Table customers (10 lignes)
- [ ] 05 - Table transactions (60 lignes)
- [ ] 06 - Import schéma SQL
- [ ] 07 - Exécution SQL réussie
- [ ] 08 - Vérification COUNT
- [ ] 09 - npm install
- [ ] 10 - Tests partie 1
- [ ] 11 - Tests partie 2
- [ ] 12 - Code auth-custom.js
- [ ] 13 - Fichier .env (SERVICE_ROLE_KEY floutée)
- [ ] 14 - Collection Postman (optionnel)
- [ ] 15 - Test Postman (optionnel)

**Minimum requis : 13 screenshots**  
**Recommandé : 15 screenshots**

---

## 💾 Organisation des fichiers

**Placer tous les screenshots dans :**
```
3_Code_Source/screenshots/
├── 01_creation_projet_supabase.png
├── 02_configuration_api_supabase.png
├── 03_vue_tables_supabase.png
└── ... (tous les autres)
```

---

## 🎥 Alternative : Vidéo de démo

**Au lieu de screenshots, tu peux faire une vidéo de 2-3 minutes montrant :**
1. Dashboard Supabase (tables)
2. Terminal avec `npm test`
3. Code source (auth-custom.js)

**Outils recommandés :**
- OBS Studio (gratuit)
- Loom (simple)
- Windows + G (capture intégrée Windows)

---

**Temps total : 20 minutes pour 15 screenshots ! 📸**
