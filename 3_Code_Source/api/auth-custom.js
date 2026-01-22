// ===============================================
// AUTHENTIFICATION JWT CUSTOM - DIGITALBANK
// ===============================================
import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';
import jwt from 'jsonwebtoken';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const JWT_SECRET = process.env.JWT_SECRET || 'digitalbank_secret_2026';

// ===============================================
// 1. LOGIN
// ===============================================
export async function login(email, password) {
  try {
    const { data: customer, error } = await supabase
      .from('customers')
      .select('*')
      .eq('email', email)
      .single();

    if (error || !customer) {
      return {
        success: false,
        error: 'Email ou mot de passe incorrect'
      };
    }

    // Pour les tests, accepter n'importe quel password
    // En production: bcrypt.compareSync(password, customer.password_hash)
    
    const token = jwt.sign(
      {
        customer_id: customer.customer_id,
        email: customer.email,
        role: 'customer'
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    await supabase
      .from('customers')
      .update({ last_login: new Date().toISOString() })
      .eq('customer_id', customer.customer_id);

    return {
      success: true,
      token: token,
      customer: {
        customer_id: customer.customer_id,
        email: customer.email,
        first_name: customer.first_name,
        last_name: customer.last_name
      }
    };
  } catch (error) {
    console.error('Erreur login:', error);
    return { success: false, error: 'Erreur serveur' };
  }
}

// ===============================================
// 2. VÉRIFIER TOKEN
// ===============================================
export function verifyToken(token) {
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    return {
      valid: true,
      customer_id: decoded.customer_id,
      email: decoded.email
    };
  } catch (error) {
    return { valid: false, error: 'Token invalide ou expiré' };
  }
}

// ===============================================
// 3. GET CUSTOMER INFO
// ===============================================
export async function getCustomerInfo(customer_id) {
  try {
    const { data: customer, error } = await supabase
      .from('customers')
      .select('customer_id, email, first_name, last_name, phone, city, status')
      .eq('customer_id', customer_id)
      .single();

    if (error) {
      return { success: false, error: 'Customer non trouvé' };
    }

    return { success: true, customer: customer };
  } catch (error) {
    return { success: false, error: 'Erreur serveur' };
  }
}

// ===============================================
// 4. GET ACCOUNTS
// ===============================================
export async function getAccounts(customer_id) {
  try {
    const { data: accounts, error } = await supabase
      .from('accounts')
      .select('*')
      .eq('customer_id', customer_id);

    if (error) {
      return { success: false, error: 'Erreur récupération comptes' };
    }

    return { success: true, accounts: accounts };
  } catch (error) {
    return { success: false, error: 'Erreur serveur' };
  }
}

// ===============================================
// 5. GET TRANSACTIONS
// ===============================================
export async function getTransactions(customer_id, limit = 50) {
  try {
    const { data: accounts } = await supabase
      .from('accounts')
      .select('account_id')
      .eq('customer_id', customer_id);

    if (!accounts || accounts.length === 0) {
      return { success: true, transactions: [] };
    }

    const accountIds = accounts.map(a => a.account_id);

    const { data: transactions, error } = await supabase
      .from('transactions')
      .select('*')
      .in('account_id', accountIds)
      .order('timestamp', { ascending: false })
      .limit(limit);

    if (error) {
      return { success: false, error: 'Erreur récupération transactions' };
    }

    return { success: true, transactions: transactions };
  } catch (error) {
    return { success: false, error: 'Erreur serveur' };
  }
}

export default {
  login,
  verifyToken,
  getCustomerInfo,
  getAccounts,
  getTransactions
};
