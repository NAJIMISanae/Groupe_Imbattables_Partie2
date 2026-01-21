import 'dotenv/config';

const required = [
  'SUPABASE_URL',
  'SUPABASE_ANON_KEY',
  'CUSTOMER_EMAIL',
  'CUSTOMER_PASSWORD',
  'ANALYST_EMAIL',
  'ANALYST_PASSWORD',
  'ADMIN_EMAIL',
  'ADMIN_PASSWORD'
];

const missing = required.filter(k => !process.env[k] || String(process.env[k]).trim() === '');
if (missing.length) {
  console.error('❌ Missing env vars:', missing.join(', '));
  console.error('👉 Create a .env file (copy .env.example) and fill the values.');
  process.exit(1);
}

console.log('✅ Env looks OK.');
