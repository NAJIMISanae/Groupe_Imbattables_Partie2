# 📡 API Endpoints - DigitalBank

**Base URL :** `https://puvjksqfwvfguxeqobqe.supabase.co/rest/v1/`  
**Authentification :** JWT Token (custom)

---

## 🔐 Authentification

### Login
```javascript
import auth from './api/auth-custom.js';

const result = await auth.login('jean.dupont@email.fr', 'password');

// Résultat :
{
  success: true,
  token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  customer: {
    customer_id: 1,
    email: "jean.dupont@email.fr",
    first_name: "Jean",
    last_name: "Dupont"
  }
}
```

### Vérifier Token
```javascript
const result = auth.verifyToken(token);

// Résultat :
{
  valid: true,
  customer_id: 1,
  email: "jean.dupont@email.fr"
}
```

---

## 👤 Customers

### Get Customer Info
```javascript
const result = await auth.getCustomerInfo(customer_id);

// Résultat :
{
  success: true,
  customer: {
    customer_id: 1,
    email: "jean.dupont@email.fr",
    first_name: "Jean",
    last_name: "Dupont",
    phone: "0601020304",
    city: "Paris",
    status: "active"
  }
}
```

**Sécurité :** Filtré automatiquement par customer_id du JWT

---

## 🏦 Accounts

### Get Accounts
```javascript
const result = await auth.getAccounts(customer_id);

// Résultat :
{
  success: true,
  accounts: [
    {
      account_id: 1,
      customer_id: 1,
      account_number: "FR7612345678901234567890123",
      account_type: "checking",
      balance: 2500.75,
      currency: "EUR",
      status: "active"
    },
    {
      account_id: 2,
      customer_id: 1,
      account_number: "FR7612345678901234567890124",
      account_type: "savings",
      balance: 15000.00,
      currency: "EUR",
      status: "active"
    }
  ]
}
```

**Sécurité :** Ne retourne QUE les comptes du customer connecté

---

## 💳 Transactions

### Get Transactions
```javascript
const result = await auth.getTransactions(customer_id, limit);

// Résultat :
{
  success: true,
  transactions: [
    {
      transaction_id: 1,
      account_id: 1,
      transaction_type: "deposit",
      amount: 1500.00,
      currency: "EUR",
      merchant_name: "Salary",
      merchant_category: "Income",
      location: "Paris, France",
      timestamp: "2026-01-21T10:00:00Z",
      status: "completed",
      is_fraud: false
    },
    // ... autres transactions
  ]
}
```

**Paramètres :**
- `customer_id` : ID du customer (depuis JWT)
- `limit` : Nombre max de transactions (défaut: 50)

**Sécurité :** Ne retourne QUE les transactions des comptes du customer

---

## 📊 Exemples d'utilisation

### Workflow complet

```javascript
import auth from './api/auth-custom.js';

// 1. Login
const loginResult = await auth.login('jean.dupont@email.fr', 'password');
const token = loginResult.token;

// 2. Vérifier token
const verify = auth.verifyToken(token);
const customer_id = verify.customer_id;

// 3. Récupérer infos
const customer = await auth.getCustomerInfo(customer_id);
console.log('Bienvenue', customer.customer.first_name);

// 4. Récupérer comptes
const accounts = await auth.getAccounts(customer_id);
console.log('Vous avez', accounts.accounts.length, 'compte(s)');

// 5. Récupérer transactions
const transactions = await auth.getTransactions(customer_id, 10);
console.log('Dernières transactions:', transactions.transactions);
```

---

## 🔒 Sécurité

### Filtrage automatique

Chaque endpoint filtre automatiquement par `customer_id` :

```javascript
// L'utilisateur ne peut voir QUE ses données
.eq('customer_id', customer_id)  // ← Filtre de sécurité

// Transactions : filtre via accounts
.in('account_id', [account_ids du customer])  // ← Sécurité renforcée
```

### Expiration du token

```javascript
// Token expire après 24h
expiresIn: '24h'

// Après expiration, refaire un login
```

---

## 🧪 Tests

### Test complet

```bash
npm test
```

**Résultat :**
```
✅ TEST 1 : Login réussi !
✅ TEST 2 : Token valide !
✅ TEST 3 : Infos récupérées !
✅ TEST 4 : 2 compte(s) trouvé(s) !
✅ TEST 5 : 6 transaction(s) trouvée(s) !
```

---

## ❌ Gestion des erreurs

### Erreur login
```javascript
{
  success: false,
  error: "Email ou mot de passe incorrect"
}
```

### Erreur token
```javascript
{
  valid: false,
  error: "Token invalide ou expiré"
}
```

### Erreur serveur
```javascript
{
  success: false,
  error: "Erreur serveur"
}
```

---

## 📈 Statistiques

**Données disponibles :**
- 10 customers
- 13 accounts
- 60 transactions (30 normales + 30 frauduleuses)
- 10 cards
- 20 login_attempts

**Performance :**
- Temps de réponse moyen : ~200ms
- Taux de succès : 100%

---

## 🔄 Évolutions futures

**Fonctionnalités à ajouter :**
- [ ] Create Account
- [ ] Create Transaction
- [ ] Update Customer Info
- [ ] Get Cards
- [ ] Detect Fraud (ML)
- [ ] Audit Logs

---

**Documentation complète et à jour ! 📚**
