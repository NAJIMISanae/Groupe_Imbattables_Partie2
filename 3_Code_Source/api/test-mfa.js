// api/test-mfa.js
// Enroll + verify TOTP MFA for a user.
// 1) Put MFA_EMAIL + MFA_PASSWORD in .env
// 2) Run: npm run test:mfa
// 3) Scan QR in Google Authenticator
// 4) Put the 6-digit code into MFA_CODE and run again

import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const required = ['SUPABASE_URL','SUPABASE_ANON_KEY','MFA_EMAIL','MFA_PASSWORD'];
const missing = required.filter(k => !process.env[k]);
if (missing.length) {
  console.error('❌ Missing env vars for MFA test:', missing.join(', '));
  process.exit(1);
}

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

async function main() {
  const email = process.env.MFA_EMAIL;
  const password = process.env.MFA_PASSWORD;

  // Login
  const { data: loginData, error: loginErr } = await supabase.auth.signInWithPassword({ email, password });
  if (loginErr) throw loginErr;

  console.log(`✅ Logged in as: ${loginData.user.email}`);

  // List factors (optional)
  const { data: factorsBefore } = await supabase.auth.mfa.listFactors();
  const existing = (factorsBefore?.totp ?? []).find(f => f.status === 'verified' || f.status === 'unverified');
  if (existing) {
    console.log('ℹ️ Existing TOTP factor found:', existing.id, 'status=', existing.status);
  }

  // Enroll a new factor if none
  let factorId;
  if (!existing) {
    const { data, error } = await supabase.auth.mfa.enroll({ factorType: 'totp' });
    if (error) throw error;

    factorId = data.id;
    const qr = data.totp?.qr_code;
    const secret = data.totp?.secret;
    const uri = data.totp?.uri;

    console.log('✅ MFA enrolled (TOTP)');
    console.log('factorId:', factorId);
    if (uri) console.log('otpauth URI:', uri);
    if (secret) console.log('secret:', secret);
    if (qr) console.log('QR code (data URL):', qr);

    console.log('\n👉 Scan the QR code / URI in Google Authenticator.');
    console.log('👉 Then set MFA_CODE=123456 in your .env and run again to verify.');
    return;
  } else {
    factorId = existing.id;
  }

  const code = (process.env.MFA_CODE || '').trim();
  if (!code) {
    console.log('👉 MFA_CODE is empty. Add a 6-digit code and run again to verify.');
    return;
  }

  // Challenge + verify
  const { data: challenge, error: chErr } = await supabase.auth.mfa.challenge({ factorId });
  if (chErr) throw chErr;

  const { data: verify, error: vErr } = await supabase.auth.mfa.verify({
    factorId,
    challengeId: challenge.id,
    code
  });
  if (vErr) throw vErr;

  console.log('✅ MFA verified!');
  console.log('session AAL:', verify?.session?.aal);
}

main().catch((err) => {
  console.error('❌ MFA test failed:', err.message || err);
  process.exit(1);
});
