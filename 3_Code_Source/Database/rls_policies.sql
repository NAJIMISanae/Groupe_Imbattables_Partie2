
-- ROW LEVEL SECURITY POLICIES - DIGITALBANK
-- TABLE : PROFILES

-- Policy 1 : Les users peuvent voir leur propre profil
CREATE POLICY "Users can view own profile"
ON public.profiles
FOR SELECT
USING (auth.uid() = id);

-- Policy 2 : Les users peuvent modifier leur propre profil
CREATE POLICY "Users can update own profile"
ON public.profiles
FOR UPDATE
USING (auth.uid() = id);

-- Policy 3 : Les admins voient tous les profils
CREATE POLICY "Admins can view all profiles"
ON public.profiles
FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role = 'admin'
    )
);

-- TABLE : ACCOUNTS

-- Policy 1 : Les clients voient seulement leurs propres comptes
CREATE POLICY "Clients can view own accounts"
ON public.accounts
FOR SELECT
USING (
    user_id = auth.uid()
    OR
    EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role IN ('analyst', 'admin')
    )
);

-- Policy 2 : Les clients peuvent créer leurs propres comptes
CREATE POLICY "Clients can create own accounts"
ON public.accounts
FOR INSERT
WITH CHECK (user_id = auth.uid());

-- Policy 3 : Les clients peuvent modifier leurs propres comptes
CREATE POLICY "Clients can update own accounts"
ON public.accounts
FOR UPDATE
USING (
    user_id = auth.uid()
    OR
    EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role = 'admin'
    )
);

-- Policy 4 : Seuls les admins peuvent supprimer des comptes
CREATE POLICY "Only admins can delete accounts"
ON public.accounts
FOR DELETE
USING (
    EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role = 'admin'
    )
);

-- TABLE : TRANSACTIONS

-- Policy 1 : Les clients voient leurs propres transactions
CREATE POLICY "Clients can view own transactions"
ON public.transactions
FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM public.accounts
        WHERE accounts.account_id = transactions.account_id
        AND accounts.user_id = auth.uid()
    )
    OR
    EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role IN ('analyst', 'admin')
    )
);

-- Policy 2 : Les clients peuvent créer des transactions sur leurs comptes
CREATE POLICY "Clients can create transactions"
ON public.transactions
FOR INSERT
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.accounts
        WHERE accounts.account_id = transactions.account_id
        AND accounts.user_id = auth.uid()
    )
);

-- Policy 3 : Seuls les admins peuvent modifier des transactions
CREATE POLICY "Only admins can update transactions"
ON public.transactions
FOR UPDATE
USING (
    EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role = 'admin'
    )
);

-- Policy 4 : Seuls les admins peuvent supprimer des transactions
CREATE POLICY "Only admins can delete transactions"
ON public.transactions
FOR DELETE
USING (
    EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role = 'admin'
    )
);

-- TABLE : AUDIT_LOGS

-- Policy 1 : Seuls les admins voient les logs
CREATE POLICY "Only admins can view audit logs"
ON public.audit_logs
FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role = 'admin'
    )
);

-- Policy 2 : Système peut créer des logs (pour triggers)
CREATE POLICY "System can insert audit logs"
ON public.audit_logs
FOR INSERT
WITH CHECK (true);

-- RÉSUMÉ DES POLICIES

/*
PROFILES:
- Users : Voir et modifier leur propre profil
- Admins : Voir tous les profils

ACCOUNTS:
- Clients : Voir, créer, modifier leurs propres comptes
- Analysts : Voir tous les comptes
- Admins : Tout (y compris supprimer)

TRANSACTIONS:
- Clients : Voir et créer leurs propres transactions
- Analysts : Voir toutes les transactions
- Admins : Tout (y compris modifier et supprimer)

AUDIT_LOGS:
- Admins uniquement : Voir tous les logs
- Système : Créer des logs
*
-- ROW LEVEL SECURITY POLICIES - DIGITALBANK

-- TABLE : PROFILES

-- Policy 1 : Les users peuvent voir leur propre profil
CREATE POLICY "Users can view own profile"
ON public.profiles
FOR SELECT
USING (auth.uid() = id);

-- Policy 2 : Les users peuvent modifier leur propre profil
CREATE POLICY "Users can update own profile"
ON public.profiles
FOR UPDATE
USING (auth.uid() = id);

-- Policy 3 : Les admins voient tous les profils
CREATE POLICY "Admins can view all profiles"
ON public.profiles
FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role = 'admin'
    )
);

-- TABLE : ACCOUNTS

-- Policy 1 : Les clients voient seulement leurs propres comptes
CREATE POLICY "Clients can view own accounts"
ON public.accounts
FOR SELECT
USING (
    user_id = auth.uid()
    OR
    EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role IN ('analyst', 'admin')
    )
);

-- Policy 2 : Les clients peuvent créer leurs propres comptes
CREATE POLICY "Clients can create own accounts"
ON public.accounts
FOR INSERT
WITH CHECK (user_id = auth.uid());

-- Policy 3 : Les clients peuvent modifier leurs propres comptes
CREATE POLICY "Clients can update own accounts"
ON public.accounts
FOR UPDATE
USING (
    user_id = auth.uid()
    OR
    EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role = 'admin'
    )
);

-- Policy 4 : Seuls les admins peuvent supprimer des comptes
CREATE POLICY "Only admins can delete accounts"
ON public.accounts
FOR DELETE
USING (
    EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role = 'admin'
    )
);

-- TABLE : TRANSACTIONS

-- Policy 1 : Les clients voient leurs propres transactions
CREATE POLICY "Clients can view own transactions"
ON public.transactions
FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM public.accounts
        WHERE accounts.account_id = transactions.account_id
        AND accounts.user_id = auth.uid()
    )
    OR
    EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role IN ('analyst', 'admin')
    )
);

-- Policy 2 : Les clients peuvent créer des transactions sur leurs comptes
CREATE POLICY "Clients can create transactions"
ON public.transactions
FOR INSERT
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.accounts
        WHERE accounts.account_id = transactions.account_id
        AND accounts.user_id = auth.uid()
    )
);

-- Policy 3 : Seuls les admins peuvent modifier des transactions
CREATE POLICY "Only admins can update transactions"
ON public.transactions
FOR UPDATE
USING (
    EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role = 'admin'
    )
);

-- Policy 4 : Seuls les admins peuvent supprimer des transactions
CREATE POLICY "Only admins can delete transactions"
ON public.transactions
FOR DELETE
USING (
    EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role = 'admin'
    )
);

-- TABLE : AUDIT_LOGS

-- Policy 1 : Seuls les admins voient les logs
CREATE POLICY "Only admins can view audit logs"
ON public.audit_logs
FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role = 'admin'
    )
);

-- Policy 2 : Système peut créer des logs (pour triggers)
CREATE POLICY "System can insert audit logs"
ON public.audit_logs
FOR INSERT
WITH CHECK (true);

-- RÉSUMÉ DES POLICIES

/*
PROFILES:
- Users : Voir et modifier leur propre profil
- Admins : Voir tous les profils

ACCOUNTS:
- Clients : Voir, créer, modifier leurs propres comptes
- Analysts : Voir tous les comptes
- Admins : Tout (y compris supprimer)

TRANSACTIONS:
- Clients : Voir et créer leurs propres transactions
- Analysts : Voir toutes les transactions
- Admins : Tout (y compris modifier et supprimer)

AUDIT_LOGS:
- Admins uniquement : Voir tous les logs
- Système : Créer des logs
*/