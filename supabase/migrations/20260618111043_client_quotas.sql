-- Tarification par paliers selon le NOMBRE DE CLIENTS
-- free       : 1 client     0 €
-- starter    : 10 clients   9 €/mois
-- pro        : 50 clients  19 €/mois
-- unlimited  : illimite    39 €/mois  (max_clients = NULL)

-- 1. colonne max_clients sur subscriptions (NULL = illimite)
alter table public.subscriptions
  add column if not exists max_clients int default 1;

-- 2. remap des lignes existantes selon le plan
update public.subscriptions set max_clients = case
  when plan = 'starter'   then 10
  when plan = 'pro'       then 50
  when plan = 'unlimited' then null
  else 1
end;

-- 3. le gating passe du nb de factures au nb de clients : on retire l'ancien quota factures
drop trigger if exists tr_check_invoice_quota on public.invoices;

-- 4. controle du quota clients a l'insertion d'un client
create or replace function public.check_client_quota()
returns trigger as $$
declare
  sub public.subscriptions%rowtype;
  nb  int;
begin
  select * into sub from public.subscriptions where user_id = new.user_id;

  -- aucune souscription -> on cree un free (1 client)
  if not found then
    insert into public.subscriptions (user_id, plan, status, max_clients)
    values (new.user_id, 'free', 'active', 1)
    returning * into sub;
  end if;

  -- plan illimite
  if sub.max_clients is null then
    return new;
  end if;

  select count(*) into nb from public.clients where user_id = new.user_id;

  if nb >= sub.max_clients then
    raise exception 'CLIENT_QUOTA_REACHED:%/%', nb, sub.max_clients
      using errcode = 'check_violation';
  end if;

  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists tr_check_client_quota on public.clients;
create trigger tr_check_client_quota
  before insert on public.clients
  for each row execute function public.check_client_quota();
