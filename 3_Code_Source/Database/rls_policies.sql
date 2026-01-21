-- TABLE PROFILES
CREATE POLICY "Users can view own profile"
ON public.profiles
FOR SELECT
USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
ON public.profiles
FOR UPDATE
USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles"
ON public.profiles
FOR SELECT
USING (auth.role() = 'admin');  -- 🔹 Utiliser auth.role() au lieu d'un SELECT sur profiles

-- TABLE ACCOUNTS
CREATE POLICY "Clients can view own accounts"
ON public.accounts
FOR SELECT
USING (user_id = auth.uid() OR auth.role() IN ('analyst','admin'));

CREATE POLICY "Clients can create own accounts"
ON public.accounts
FOR INSERT
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Clients can update own accounts"
ON public.accounts
FOR UPDATE
USING (user_id = auth.uid() OR auth.role() = 'admin');

CREATE POLICY "Only admins can delete accounts"
ON public.accounts
FOR DELETE
USING (auth.role() = 'admin');

-- TABLE TRANSACTIONS
CREATE POLICY "Clients can view own transactions"
ON public.transactions
FOR SELECT
USING (EXISTS (
    SELECT 1 FROM public.accounts 
    WHERE accounts.account_id = transactions.account_id AND accounts.user_id = auth.uid()
) OR auth.role() IN ('analyst','admin'));

CREATE POLICY "Clients can create transactions"
ON public.transactions
FOR INSERT
WITH CHECK (EXISTS (
    SELECT 1 FROM public.accounts 
    WHERE accounts.account_id = transactions.account_id AND accounts.user_id = auth.uid()
));

CREATE POLICY "Only admins can update transactions"
ON public.transactions
FOR UPDATE
USING (auth.role() = 'admin');

CREATE POLICY "Only admins can delete transactions"
ON public.transactions
FOR DELETE
USING (auth.role() = 'admin');

-- TABLE AUDIT_LOGS
CREATE POLICY "Only admins can view audit logs"
ON public.audit_logs
FOR SELECT
USING (auth.role() = 'admin');

CREATE POLICY "System can insert audit logs"
ON public.audit_logs
FOR INSERT
WITH CHECK (true);
