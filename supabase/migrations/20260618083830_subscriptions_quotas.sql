-- Mise à jour du système de quotas et abonnements
-- Gratuit (Free) : 3 factures/mois
-- Freelance : 15€/mois (Illimité)
-- Studio : 35€/mois (Illimité)
-- Enterprise : 75€/mois (Illimité)

-- Ajout des colonnes de quotas dans subscriptions
ALTER TABLE public.subscriptions 
ADD COLUMN IF NOT EXISTS invoice_count_monthly INT DEFAULT 0,
ADD COLUMN IF NOT EXISTS max_invoices_monthly INT DEFAULT 3; -- Par défaut 3 pour le plan 'free'

-- Fonction pour réinitialiser les compteurs chaque mois (à appeler via pg_cron ou au login)
CREATE OR REPLACE FUNCTION public.reset_monthly_quotas()
RETURNS void AS $$
BEGIN
  UPDATE public.subscriptions
  SET invoice_count_monthly = 0
  WHERE current_period_end < now();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger pour incrémenter le compteur lors de la création d'une facture
CREATE OR REPLACE FUNCTION public.check_invoice_quota()
RETURNS TRIGGER AS $$
DECLARE
  current_sub public.subscriptions%ROWTYPE;
BEGIN
  SELECT * INTO current_sub FROM public.subscriptions WHERE user_id = NEW.user_id;
  
  -- Si pas de souscription, on en crée une par défaut en 'free'
  IF NOT FOUND THEN
    INSERT INTO public.subscriptions (user_id, plan, status, max_invoices_monthly)
    VALUES (NEW.user_id, 'free', 'active', 3)
    RETURNING * INTO current_sub;
  END IF;

  -- Vérification du quota
  IF current_sub.max_invoices_monthly IS NOT NULL AND current_sub.invoice_count_monthly >= current_sub.max_invoices_monthly THEN
    RAISE EXCEPTION 'Quota de factures mensuel atteint (%/%)', current_sub.invoice_count_monthly, current_sub.max_invoices_monthly;
  END IF;

  -- Incrémentation
  UPDATE public.subscriptions 
  SET invoice_count_monthly = invoice_count_monthly + 1 
  WHERE user_id = NEW.user_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER tr_check_invoice_quota
BEFORE INSERT ON public.invoices
FOR EACH ROW EXECUTE FUNCTION public.check_invoice_quota();
