// api/test-api.js
// Basic end-to-end check as CUSTOMER (RLS should filter rows)

import 'dotenv/config';
import './check-env.js';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

async function login(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data;
}

async function main() {
  console.log('========================================');
  console.log('🧪 TESTS SUPABASE - ROLE CUSTOMER');
  console.log('========================================');

  // 1) login
  const session = await login(process.env.CUSTOMER_EMAIL, process.env.CUSTOMER_PASSWORD);
  console.log(`✅ Current User: ${session.user.email}`);

  // 2) customer row (RLS by email)
  const { data: customers, error: cErr } = await supabase
    .from('customers')
    .select('customer_id,email,first_name,last_name');
  if (cErr) throw cErr;
  console.log(`✅ customers visibles: ${customers.length}`);
  customers.slice(0, 5).forEach(c => console.log(`  - ${c.customer_id} ${c.email}`));

  // 3) accounts
  const { data: accounts, error: aErr } = await supabase
    .from('accounts')
    .select('account_id,customer_id,account_type,balance,currency,status')
    .order('account_id', { ascending: true });
  if (aErr) throw aErr;
  console.log(`✅ accounts visibles: ${accounts.length}`);
  accounts.forEach(a => console.log(`  - ${a.account_id} customer_id= ${a.customer_id} ${a.account_type} ${a.balance}`));

  // 4) transactions (top 10 for first visible account)
  const firstAcc = accounts[0]?.account_id;
  if (!firstAcc) {
    console.log('⚠️ No account visible, cannot test transactions.');
  } else {
    const { data: txs, error: tErr } = await supabase
      .from('transactions')
      .select('transaction_id,account_id,amount,merchant_name,merchant_category,timestamp,is_fraud')
      .eq('account_id', firstAcc)
      .order('timestamp', { ascending: false })
      .limit(10);
    if (tErr) throw tErr;
    console.log(`✅ transactions visibles (top 10): ${txs.length}`);
    txs.forEach(t => console.log(`  - ${t.transaction_id} acc= ${t.account_id} ${t.amount} ${t.merchant_name}`));
  }

  // 5) audit logs (should be admin-only)
  const { data: audits, error: logErr } = await supabase
    .from('audit_logs')
    .select('*')
    .limit(5);

  if (logErr) {
    console.log('✅ audit_logs: BLOQUÉ (OK) →', logErr.message);
  } else {
    console.log('⚠️ audit_logs accessible (à vérifier):', audits);
  }

  console.log('\n✅ Tests terminés.');
}

main().catch((err) => {
  console.error('❌ Erreur:', err.message || err);
  process.exit(1);
});
