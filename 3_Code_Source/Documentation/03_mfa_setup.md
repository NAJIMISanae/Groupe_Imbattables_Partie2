# MFA (Multi-Factor Authentication) Setup

## Configuration
- Type : TOTP (Time-based One-Time Password)
- Compatible avec : Google Authenticator, Authy, 1Password
- Backend : Supabase (Service Role Key pour admin)
- Sécurité : ajoute un deuxième facteur à l’authentification standard (email + mot de passe)

## Activation
1. L'utilisateur existe déjà dans la base Supabase.
2. Le script `supabaseAdmin.auth.mfa.enroll()` est appelé avec l'ID de l’utilisateur.
3. Le QR code et la clé secrète sont générés par Supabase.
4. L’utilisateur scanne le QR code avec son application d’authentification (Google Authenticator, Authy, etc.).
5. L’utilisateur entre le code de vérification généré par l’application.
6. MFA TOTP activé 

## Test
- Fichier utilisé : `api/test-mfa.js`
- Utilisateurs testés :
  - `admin@digitalbank.fr`
  - `analyst@digitalbank.fr`
  - `jean.dupont@digitalbank.fr`
- Étapes du test :
  1. Récupération de l’ID utilisateur par email.
  2. Activation du MFA TOTP pour chaque utilisateur.
  3. Affichage du QR code et du secret dans le terminal pour scan.

## Résultats
-  Connexion des utilisateurs réussie
-  MFA TOTP activé pour tous les utilisateurs testés
-  QR code et clé secrète affichés pour chaque utilisateur
-  Sécurité renforcée : authentification à deux facteurs fonctionnelle

## Remarques
- Les utilisateurs doivent **scanner le QR code** avec leur application avant de pouvoir utiliser le MFA.
- Le script peut être réutilisé pour tout nouvel utilisateur en ajoutant son email à la liste.
