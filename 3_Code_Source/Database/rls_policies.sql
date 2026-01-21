-- TABLE PROFILES
CREATE POLICY "Users can view own profile"
ON public.profiles
FOR SELECT
USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
ON public.profiles
FOR UPDATE
USING (auth.uid() = id);
…CREATE POLICY "System can insert audit logs"
ON public.audit_logs
FOR INSERT
WITH CHECK (true);
