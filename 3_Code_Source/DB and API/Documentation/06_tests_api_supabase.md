# Tests API Supabase - DigitalBank

## Test 1 : Login
- Statut : Réussi
- User ID : 6fd25ef0-849a-4e6f-a78b-d8be068b1053
- Email : jean.dupont@digitalbank.fr

## Test 2 : Récupération des comptes
- Comptes trouvés : 2
  - FR7630001007941234567890185 : 5420.5 EUR
  - FR7630001007941234567890186 : 12000 EUR

## Test 3 : Récupération des transactions
- Transactions trouvées : 4
  - Test transaction : 100 EUR
  - Salaire mensuel : 2500 EUR
  - Courses alimentaires : -45.8 EUR
  - Abonnement internet : -120 EUR

## Test 4 : Création d'une transaction
- Statut : Réussi
- Transaction ID : 5

## Test 5 : Vérification RLS
- Jean (client) voit 2 compte(s)
- Marie (analyst) voit 2 compte(s)
- Note : RLS pourrait avoir un problème

## Date
21/01/2026

## Status
Tests exécutés avec succès (à l’exception du RLS à vérifier)
