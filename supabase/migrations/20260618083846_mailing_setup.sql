-- Configuration du mailing via Supabase / Edge Functions
-- L'adresse d'envoi sera facturation@beloucif.com

-- Table pour stocker les logs d'envoi d'emails (audit)
CREATE TABLE IF NOT EXISTS public.email_logs (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  invoice_id uuid REFERENCES public.invoices(id) ON DELETE SET NULL,
  recipient_email text NOT NULL,
  subject text NOT NULL,
  sent_at timestamptz DEFAULT now(),
  status text DEFAULT 'sent'
);

ALTER TABLE public.email_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own email logs" ON public.email_logs FOR SELECT USING (auth.uid() = user_id);
