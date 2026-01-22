// api/test-mfa.js
import 'dotenv/config';
import { supabaseAdmin } from '../supabase-admin.js'; // ton fichier supabase-admin.js

// Récupérer l'ID utilisateur exact par email
async function getUserIdByEmail(email) {
  try {
    const { data, error } = await supabaseAdmin.auth.admin.listUsers();
    if (error) {
      console.error('Erreur récupération utilisateurs:', error);
      return null;
    }

    // Chercher l'utilisateur exact
    const user = data.users.find(u => u.email === email);
    if (!user) {
      console.warn('Utilisateur non trouvé:', email);
      return null;
    }

    console.log(`Utilisateur trouvé: ${email}, ID: ${user.id}`);
    return user.id;
  } catch (err) {
    console.error('Erreur getUserIdByEmail:', err);
    return null;
  }
}

// Activer MFA TOTP pour un utilisateur
async function enrollMFA(userId) {
  try {
    // Supabase v2 n'a pas forcément auth.admin.enableMFA, donc ici on affiche juste l'ID
    console.log(`Prêt pour activer MFA pour l'utilisateur ID: ${userId}`);
    
    // Si tu avais la vraie fonction MFA côté admin, ça ressemblerait à ça :
    // const { data, error } = await supabaseAdmin.auth.admin.enableMFA({
    //   userId,
    //   factorType: 'totp'
    // });
    // if (error) {
    //   console.error('Erreur MFA pour', userId, error);
    //   return;
    // }
    // console.log('QR Code:', data.totp.qr_code);
    // console.log('Secret:', data.totp.secret);

  } catch (err) {
    console.error('Erreur enrollMFA:', err);
  }
}

// Script principal
async function main() {
  const emails = [
    'admin@digitalbank.fr',
    'analyst@digitalbank.fr',
    'jean.dupont@digitalbank.fr'
  ];

  for (const email of emails) {
    const userId = await getUserIdByEmail(email);
    if (userId) {
      await enrollMFA(userId);
    }
  }
}

main();
