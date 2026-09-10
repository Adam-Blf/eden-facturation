-- Allow authenticated users to insert their own email log entries.
-- The SELECT policy already exists (20260618083846_mailing_setup.sql).
CREATE POLICY "insert own email logs"
  ON public.email_logs
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);
