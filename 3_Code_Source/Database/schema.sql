
-- Activation des extensions nécessaires
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- TABLE 1 : USERS (sera gérée par Supabase Auth)
-- Note : Supabase a déjà une table auth.users
-- On va créer une table publique pour les données additionnelles

CREATE TABLE public.profiles (
    id UUID REFERENCES auth.users(id) PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    first_name TEXT,
    last_name TEXT,
    phone TEXT,
    role TEXT CHECK (role IN ('client', 'analyst', 'admin')) DEFAULT 'client',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Trigger pour créer automatiquement un profil lors de l'inscription
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, role)
    VALUES (NEW.id, NEW.email, 'client');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- TABLE 2 : ACCOUNTS

CREATE TABLE public.accounts (
    account_id BIGSERIAL PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    account_number TEXT UNIQUE NOT NULL,
    account_type TEXT CHECK (account_type IN ('checking', 'savings', 'credit', 'investment')) NOT NULL,
    balance DECIMAL(15, 2) DEFAULT 0.00 CHECK (balance >= 0),
    currency TEXT DEFAULT 'EUR',
    status TEXT CHECK (status IN ('active', 'suspended', 'closed')) DEFAULT 'active',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_accounts_user_id ON public.accounts(user_id);
CREATE INDEX idx_accounts_status ON public.accounts(status);

-- TABLE 3 : TRANSACTIONS

CREATE TABLE public.transactions (
    transaction_id BIGSERIAL PRIMARY KEY,
    account_id BIGINT REFERENCES public.accounts(account_id) ON DELETE CASCADE NOT NULL,
    transaction_type TEXT CHECK (transaction_type IN ('deposit', 'withdrawal', 'transfer', 'payment')) NOT NULL,
    amount DECIMAL(15, 2) NOT NULL CHECK (amount != 0),
    currency TEXT DEFAULT 'EUR',
    description TEXT,
    merchant TEXT,
    category TEXT,
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    status TEXT CHECK (status IN ('pending', 'completed', 'failed', 'cancelled')) DEFAULT 'completed',
    ip_address INET,
    location TEXT,
    flagged_suspicious BOOLEAN DEFAULT FALSE
);

CREATE INDEX idx_transactions_account_id ON public.transactions(account_id);
CREATE INDEX idx_transactions_timestamp ON public.transactions(timestamp DESC);
CREATE INDEX idx_transactions_status ON public.transactions(status);

-- TABLE 4 : AUDIT_LOGS

CREATE TABLE public.audit_logs (
    log_id BIGSERIAL PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    action TEXT NOT NULL,
    table_name TEXT,
    record_id BIGINT,
    old_values JSONB,
    new_values JSONB,
    ip_address INET,
    timestamp TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_audit_logs_user_id ON public.audit_logs(user_id);
CREATE INDEX idx_audit_logs_timestamp ON public.audit_logs(timestamp DESC);

-- DONNÉES DE TEST

-- Note : Les users seront créés via Supabase Auth
-- Pour les tests, on créera les comptes après l'inscription des users

-- Fonction pour insérer des données de test (à exécuter après création des users)
CREATE OR REPLACE FUNCTION insert_test_data()
RETURNS void AS $$
DECLARE
    user1_id UUID;
    user2_id UUID;
    account1_id BIGINT;
    account2_id BIGINT;
BEGIN
    -- Récupérer les IDs des premiers users (tu les créeras via l'interface)
    SELECT id INTO user1_id FROM auth.users WHERE email = 'jean.dupont@digitalbank.fr' LIMIT 1;
    SELECT id INTO user2_id FROM auth.users WHERE email = 'marie.martin@digitalbank.fr' LIMIT 1;
    
    IF user1_id IS NOT NULL THEN
        -- Comptes pour user 1
        INSERT INTO public.accounts (user_id, account_number, account_type, balance, currency, status)
        VALUES 
            (user1_id, 'FR7630001007941234567890185', 'checking', 5420.50, 'EUR', 'active')
        RETURNING account_id INTO account1_id;
        
        INSERT INTO public.accounts (user_id, account_number, account_type, balance, currency, status)
        VALUES 
            (user1_id, 'FR7630001007941234567890186', 'savings', 12000.00, 'EUR', 'active')
        RETURNING account_id INTO account2_id;
        
        -- Transactions pour user 1
        INSERT INTO public.transactions (account_id, transaction_type, amount, description, merchant, category, status)
        VALUES
            (account1_id, 'deposit', 2500.00, 'Salaire mensuel', 'Employeur SAS', 'income', 'completed'),
            (account1_id, 'withdrawal', -45.80, 'Courses alimentaires', 'Carrefour', 'groceries', 'completed'),
            (account1_id, 'payment', -120.00, 'Abonnement internet', 'Orange', 'utilities', 'completed');
    END IF;
    
    IF user2_id IS NOT NULL THEN
        -- Comptes pour user 2
        INSERT INTO public.accounts (user_id, account_number, account_type, balance, currency, status)
        VALUES 
            (user2_id, 'FR7630001007941234567890187', 'checking', 3200.75, 'EUR', 'active');
    END IF;
END;
$$ LANGUAGE plpgsql;
