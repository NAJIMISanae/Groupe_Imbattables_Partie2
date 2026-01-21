// api/test-roles.js
// Verifies RLS behaviour for CUSTOMER / ANALYST / ADMIN

import 'dotenv/config';
import './check-env.js';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

async function login(email, password) {
  // Ensure clean auth state (important when running multiple logins in a row)
  await supabase.auth.signOut();
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data;
}

async function safeSelect(table, select, opts = {}) {
  const q = supabase.from(table).select(select, opts);
  if (opts.filter) {
    // { col, op, value }
    const { col, op, value } = opts.filter;
    q[op](col, value);
  }
  if (opts.limit) q.limit(opts.limit);
  if (opts.order) q.order(opts.order.col, { ascending: opts.order.ascending });
  const { data, error, count } = await q;
  return { data, error, count };
}

async function runRole(roleName, email, password) {
  console.log(`\n================ ROLE: ${roleName} ================`);
  const session = await login(email, password);
  console.log(`✅ connecté: ${session.user.email}`);

  // Accounts sample
  const { data: accs, error: aErr } = await safeSelect(
    'accounts',
    'account_id,customer_id,account_type',
    { limit: 10, order: { col: 'account_id', ascending: false } }
  );
  if (aErr) {
    console.log('❌ accounts:', aErr.message);
  } else {
    console.log('🔎 account_id visibles (échantillon):', accs.map(a => a.account_id).join(', ') || '0');
  }

  // Transactions count (prefer exact count without loading rows)
  const { count, error: tErr } = await supabase
    .from('transactions')
    .select('transaction_id', { count: 'exact', head: true });

  if (tErr) {
    console.log('❌ transactions count:', tErr.message);
  } else {
    console.log('📦 total transactions visibles (count):', count);
  }

  // audit_logs must be admin-only
  const { data: audits, error: logErr } = await safeSelect('audit_logs', '*', { limit: 5 });
  if (logErr) {
    console.log('✅ audit_logs: BLOQUÉ (OK) →', logErr.message);
  } else {
    console.log(`✅ audit_logs: ACCESSIBLE → ${audits.length} ligne(s)`);
  }
}

async function main() {
  console.log('🧪 TESTS RLS PAR RÔLES');

  await runRole('CUSTOMER', process.env.CUSTOMER_EMAIL, process.env.CUSTOMER_PASSWORD);
  await runRole('ANALYST', process.env.ANALYST_EMAIL, process.env.ANALYST_PASSWORD);
  await runRole('ADMIN', process.env.ADMIN_EMAIL, process.env.ADMIN_PASSWORD);

  console.log('\n✅ Terminé.');
}

main().catch((err) => {
  console.error('❌ Erreur:', err.message || err);
  process.exit(1);
});
