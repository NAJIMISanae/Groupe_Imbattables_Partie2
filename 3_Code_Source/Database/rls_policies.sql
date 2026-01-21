
-- ROW LEVEL SECURITY POLICIES - DIGITALBANK

-- TABLE : PROFILES
-- Supprimer les anciennes policies
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;

-- Policy 1 : Users peuvent voir leur propre profil
CREATE POLICY "Users can view own profile"
ON public.profiles
FOR SELECT
USING (auth.uid() = id);

-- Policy 2 : Users peuvent modifier leur propre profil
CREATE POLICY "Users can update own profile"
ON public.profiles
FOR UPDATE
USING (auth.uid() = id);

-- Policy 3 : Admins peuvent voir tous les profils
CREATE POLICY "Admins can view all profiles"
ON public.profiles
FOR SELECT
USING ((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin');

-- TABLE : ACCOUNTS

DROP POLICY IF EXISTS "Clients can view own accounts" ON public.accounts;
DROP POLICY IF EXISTS "Clients can create own accounts" ON public.accounts;
DROP POLICY IF EXISTS "Clients can update own accounts" ON public.accounts;
DROP POLICY IF EXISTS "Only admins can delete accounts" ON public.accounts;

-- Policy 1 : Clients peuvent voir leurs comptes
CREATE POLICY "Clients can view own accounts"
ON public.accounts
FOR SELECT
USING (
    user_id = auth.uid()
    OR (SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('analyst','admin')
);

-- Policy 2 : Clients peuvent créer leurs comptes
CREATE POLICY "Clients can create own accounts"
ON public.accounts
FOR INSERT
WITH CHECK (user_id = auth.uid());

-- Policy 3 : Clients peuvent modifier leurs comptes
CREATE POLICY "Clients can update own accounts"
ON public.accounts
FOR UPDATE
USING (
    user_id = auth.uid()
    OR (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
);

-- Policy 4 : Seuls les admins peuvent supprimer des comptes
CREATE POLICY "Only admins can delete accounts"
ON public.accounts
FOR DELETE
USING ((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin');

-- TABLE : TRANSACTIONS

DROP POLICY IF EXISTS "Clients can view own transactions" ON public.transactions;
DROP POLICY IF EXISTS "Clients can create transactions" ON public.transactions;
DROP POLICY IF EXISTS "Only admins can update transactions" ON public.transactions;
DROP POLICY IF EXISTS "Only admins can delete transactions" ON public.transactions;

-- Policy 1 : Clients peuvent voir leurs transactions
CREATE POLICY "Clients can view own transactions"
ON public.transactions
FOR SELECT
USING (
    EXISTS (
        SELECT 1 
        FROM public.accounts 
        WHERE accounts.account_id = transactions.account_id 
        AND accounts.user_id = auth.uid()
    )
    OR (SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('analyst','admin')
);

-- Policy 2 : Clients peuvent créer des transactions
CREATE POLICY "Clients can create transactions"
ON public.transactions
FOR INSERT
WITH CHECK (
    EXISTS (
        SELECT 1 
        FROM public.accounts 
        WHERE accounts.account_id = transactions.account_id 
        AND accounts.user_id = auth.uid()
    )
);

-- Policy 3 : Seuls les admins peuvent modifier des transactions
CREATE POLICY "Only admins can update transactions"
ON public.transactions
FOR UPDATE
USING ((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin');

-- Policy 4 : Seuls les admins peuvent supprimer des transactions
CREATE POLICY "Only admins can delete transactions"
ON public.transactions
FOR DELETE
USING ((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin');

-- TABLE : AUDIT_LOGS

DROP POLICY IF EXISTS "Only admins can view audit logs" ON public.audit_logs;
DROP POLICY IF EXISTS "System can insert audit logs" ON public.audit_logs;

-- Policy 1 : Seuls les admins voient les logs
CREATE POLICY "Only admins can view audit logs"
ON public.audit_logs
FOR SELECT
USING ((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin');

-- Policy 2 : Système peut créer des logs (triggers)
CREATE POLICY "System can insert audit logs"
ON public.audit_logs
FOR INSERT
WITH CHECK (true);

-- ============================================
-- FIN DU SCRIPT
