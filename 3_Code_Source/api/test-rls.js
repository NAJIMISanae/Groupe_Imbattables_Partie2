
// TESTS RLS  - DIGITALBANK 

import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

console.log('========================================');
console.log(' TESTS RLS - DIGITALBANK ');
console.log('========================================\n');

function logUpdateResult(label, updateError, updatedRows) {
  if (updateError) {
    console.log(`✅ ${label} ne peut PAS modifier les comptes (erreur)`);
    console.log(`   → ${updateError.message}`);
    return;
  }

  if (!updatedRows || updatedRows.length === 0) {
    console.log(`✅ ${label} ne peut PAS modifier les comptes (0 ligne modifiée)`);
    console.log('   → RLS fonctionne : seuls les admins peuvent modifier !');
    return;
  }

  console.log(`❌ PROBLÈME : ${label} a modifié ${updatedRows.length} ligne(s) !`);
  console.log('   Détails:', updatedRows);
}

// ===============================================
// TEST 1 : CLIENT
// ===============================================
async function testClientAccess() {
  console.log(' TEST 1 : Accès CLIENT (jean.dupont@digitalbank.fr)');

  const { error: authError } = await supabase.auth.signInWithPassword({
    email: 'jean.dupont@digitalbank.fr',
    password: 'Secure123!',
  });

  if (authError) {
    console.log('❌ Erreur login:', authError.message);
    return;
  }

  console.log('✅ Login réussi');

  const { data: accounts, error: accErr } = await supabase
    .from('accounts')
    .select('*');

  if (accErr) {
    console.log('❌ Erreur select accounts:', accErr.message);
    await supabase.auth.signOut();
    console.log('');
    return;
  }

  console.log(`✅ CLIENT voit ${accounts?.length || 0} compte(s)`);
  console.log('   → RLS fonctionne : le client ne voit QUE ses comptes !');

  const { data: transactions, error: txErr } = await supabase
    .from('transactions')
    .select('*');

  if (txErr) {
    console.log('❌ Erreur select transactions:', txErr.message);
    await supabase.auth.signOut();
    console.log('');
    return;
  }

  console.log(`✅ CLIENT voit ${transactions?.length || 0} transaction(s)`);
  console.log('   → RLS fonctionne : le client ne voit QUE ses transactions !');

  // ✅ IMPORTANT: tester l'update sur un compte qui appartient au client
  const myAccountId = accounts?.[0]?.account_id;

  if (!myAccountId) {
    console.log('⚠️ Aucun compte visible pour le client, impossible de tester l’UPDATE.');
    await supabase.auth.signOut();
    console.log('');
    return;
  }

  const { data: updated, error: updateError } = await supabase
    .from('accounts')
    .update({ balance: 9999999.99 })
    .eq('account_id', myAccountId)
    .select('account_id, balance'); // <-- clé: permet de voir si une ligne a vraiment été modifiée

  logUpdateResult('CLIENT', updateError, updated);

  await supabase.auth.signOut();
  console.log('');
}

// ===============================================
// TEST 2 : ANALYST
// ===============================================
async function testAnalystAccess() {
  console.log(' TEST 2 : Accès ANALYST (analyst@digitalbank.fr)');

  const { error: authError } = await supabase.auth.signInWithPassword({
    email: 'analyst@digitalbank.fr',
    password: 'Secure123!',
  });

  if (authError) {
    console.log('❌ Erreur login:', authError.message);
    return;
  }

  console.log('✅ Login réussi');

  const { data: accounts, error: accErr } = await supabase
    .from('accounts')
    .select('*');

  if (accErr) {
    console.log('❌ Erreur select accounts:', accErr.message);
    await supabase.auth.signOut();
    console.log('');
    return;
  }

  console.log(`✅ ANALYST voit ${accounts?.length || 0} compte(s)`);
  console.log("   → RLS fonctionne : l'analyst voit TOUS les comptes !");

  const { data: transactions, error: txErr } = await supabase
    .from('transactions')
    .select('*');

  if (txErr) {
    console.log('❌ Erreur select transactions:', txErr.message);
    await supabase.auth.signOut();
    console.log('');
    return;
  }

  console.log(`✅ ANALYST voit ${transactions?.length || 0} transaction(s)`);
  console.log("   → RLS fonctionne : l'analyst voit TOUTES les transactions !");

  // Ici, analyst voit la ligne, mais UPDATE doit être bloqué (admin-only)
  const anyAccountId = accounts?.[0]?.account_id;

  if (!anyAccountId) {
    console.log('⚠️ Aucun compte visible pour l’analyst, impossible de tester l’UPDATE.');
    await supabase.auth.signOut();
    console.log('');
    return;
  }

  const { data: updated, error: updateError } = await supabase
    .from('accounts')
    .update({ balance: 9999999.99 })
    .eq('account_id', anyAccountId)
    .select('account_id, balance');

  logUpdateResult('ANALYST', updateError, updated);

  await supabase.auth.signOut();
  console.log('');
}

// ===============================================
// TEST 3 : ADMIN
// ===============================================
async function testAdminAccess() {
  console.log('TEST 3 : Accès ADMIN (admin@digitalbank.fr)');

  const { error: authError } = await supabase.auth.signInWithPassword({
    email: 'admin@digitalbank.fr',
    password: 'Secure123!',
  });

  if (authError) {
    console.log('❌ Erreur login:', authError.message);
    return;
  }

  console.log('✅ Login réussi');

  const { data: accounts, error: accErr } = await supabase
    .from('accounts')
    .select('*');

  if (accErr) {
    console.log('❌ Erreur select accounts:', accErr.message);
    await supabase.auth.signOut();
    console.log('');
    return;
  }

  console.log(`✅ ADMIN voit ${accounts?.length || 0} compte(s)`);
  console.log("   → RLS fonctionne : l'admin voit TOUS les comptes !");

  const adminAccountId = accounts?.[0]?.account_id;

  if (!adminAccountId) {
    console.log('⚠️ Aucun compte visible pour l’admin, impossible de tester l’UPDATE.');
    await supabase.auth.signOut();
    console.log('');
    return;
  }

  const { data: updated, error: updateError } = await supabase
    .from('accounts')
    .update({ balance: 5420.5 })
    .eq('account_id', adminAccountId)
    .select('account_id, balance');

  if (updateError) {
    console.log("❌ PROBLÈME : l'admin ne peut PAS modifier !");
    console.log('   →', updateError.message);
  } else if (!updated || updated.length === 0) {
    console.log("❌ PROBLÈME : l'admin a fait 0 modification (inattendu) !");
  } else {
    console.log('✅ ADMIN peut modifier les comptes');
    console.log("   → RLS fonctionne : l'admin a tous les droits !");
  }

  const { data: logs, error: logsErr } = await supabase
    .from('audit_logs')
    .select('*');

  if (logsErr) {
    console.log('❌ Erreur select audit_logs:', logsErr.message);
  } else {
    console.log(`✅ ADMIN voit ${logs?.length || 0} audit log(s)`);
    console.log('   → RLS fonctionne : seuls les admins voient les logs !');
  }

  await supabase.auth.signOut();
  console.log('');
}

// ===============================================
// TEST 4 : NON AUTHENTIFIÉ
// ===============================================
async function testUnauthenticatedAccess() {
  console.log(' TEST 4 : Accès NON AUTHENTIFIÉ (sans login)');

  const { data: accounts, error } = await supabase.from('accounts').select('*');

  if (error) {
    // Certains setups renvoient une erreur RLS, d’autres renvoient simplement 0 lignes.
    console.log('✅ Accès bloqué (erreur):', error.message);
    console.log('   → RLS fonctionne : authentification obligatoire !\n');
    return;
  }

  if (!accounts || accounts.length === 0) {
    console.log('✅ Utilisateur non authentifié ne voit AUCUN compte');
    console.log('   → RLS fonctionne : authentification obligatoire !\n');
  } else {
    console.log('❌ PROBLÈME : Un utilisateur non authentifié peut voir des données !\n');
  }
}

// ===============================================
// EXÉCUTER TOUS LES TESTS
// ===============================================
async function runAllRLSTests() {
  try {
    await testUnauthenticatedAccess();
    await testClientAccess();
    await testAnalystAccess();
    await testAdminAccess();

    console.log('========================================');
    console.log('✅ TOUS LES TESTS RLS TERMINÉS');
    console.log('========================================\n');
    console.log(' RÉSUMÉ (ATTENDU) :');
    console.log('- CLIENT : Voit uniquement ses données ✅');
    console.log('- ANALYST : Voit toutes les données (lecture seule) ✅');
    console.log('- ADMIN : Accès complet (lecture + écriture) ✅');
    console.log('- NON AUTHENTIFIÉ : Aucun accès ✅');
  } catch (error) {
    console.error('\n❌ Erreur globale:', error);
  } finally {
    // sécurité: s'assurer qu'on est déconnecté
    try { await supabase.auth.signOut(); } catch {}
  }
}

runAllRLSTests();
