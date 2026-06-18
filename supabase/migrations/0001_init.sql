-- EDEN · schéma initial (multi-tenant, RLS par utilisateur)
-- Régime micro-entreprise : factures sans TVA (293 B), compta encaissement.

create extension if not exists "uuid-ossp";

-- ---------- business settings (1 par user) ----------
create table if not exists public.business_settings (
  user_id uuid primary key references auth.users(id) on delete cascade,
  marque text not null default 'EDEN',
  tagline text not null default '',
  spine text not null default '',
  nom text not null default '',
  forme text not null default 'Entrepreneur Individuel (EI)',
  adresse1 text default '',
  adresse2 text default '',
  email text default '',
  tel text default '',
  siren text default '',
  rcs text default '',
  iban text default '',
  bic text default '',
  mediateur text default '',
  cotisation_rate numeric not null default 0.212,
  versement_liberatoire boolean not null default false,
  vfr_rate numeric not null default 0.017,
  updated_at timestamptz not null default now()
);

-- ---------- clients ----------
create table if not exists public.clients (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  nom text not null,
  adresse1 text default '',
  adresse2 text default '',
  email text default '',
  particulier boolean not null default true,
  created_at timestamptz not null default now()
);
create index if not exists clients_user_idx on public.clients(user_id);

-- ---------- invoices ----------
-- draft = brouillon · issued = validée (verrouillée) · sent = envoyée au client
-- accepted = acceptée par le client · paid = payée · overdue = en retard
create type invoice_status as enum ('draft','issued','sent','accepted','paid','overdue','cancelled');

create table if not exists public.invoices (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  client_id uuid references public.clients(id) on delete set null,
  numero text not null,
  date_emission text not null,
  date_prestation text default '',
  echeance text default '',
  reglement text default 'Virement bancaire',
  status invoice_status not null default 'draft',
  note text default '',
  -- snapshot émetteur + client pour figer la facture émise
  snapshot jsonb,
  total_ht numeric not null default 0,
  -- flux validation -> envoi -> acceptation client
  public_token uuid not null default uuid_generate_v4(),
  issued_at timestamptz,
  sent_at timestamptz,
  accepted_at timestamptz,
  accepted_ip text,
  created_at timestamptz not null default now(),
  unique (user_id, numero)
);
create index if not exists invoices_user_idx on public.invoices(user_id);

-- ---------- invoice lines ----------
create table if not exists public.invoice_lines (
  id uuid primary key default uuid_generate_v4(),
  invoice_id uuid not null references public.invoices(id) on delete cascade,
  position int not null default 0,
  titre text not null,
  details text[] not null default '{}',
  qte numeric not null default 1,
  pu numeric not null default 0
);
create index if not exists invoice_lines_invoice_idx on public.invoice_lines(invoice_id);

-- ---------- payments (compta encaissement) ----------
create table if not exists public.payments (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  invoice_id uuid references public.invoices(id) on delete set null,
  amount numeric not null,
  paid_at date not null default current_date,
  method text default 'virement',
  created_at timestamptz not null default now()
);
create index if not exists payments_user_idx on public.payments(user_id);

-- ---------- expenses (charges) ----------
create table if not exists public.expenses (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  label text not null,
  amount numeric not null,
  category text default 'divers',
  spent_at date not null default current_date,
  created_at timestamptz not null default now()
);
create index if not exists expenses_user_idx on public.expenses(user_id);

-- ---------- subscriptions (billing SaaS via Stripe) ----------
create table if not exists public.subscriptions (
  user_id uuid primary key references auth.users(id) on delete cascade,
  stripe_customer_id text,
  stripe_subscription_id text,
  plan text default 'free',
  status text default 'inactive',
  current_period_end timestamptz,
  updated_at timestamptz not null default now()
);

-- ---------- RLS ----------
alter table public.business_settings enable row level security;
alter table public.clients enable row level security;
alter table public.invoices enable row level security;
alter table public.invoice_lines enable row level security;
alter table public.payments enable row level security;
alter table public.expenses enable row level security;
alter table public.subscriptions enable row level security;

create policy "own settings" on public.business_settings
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own clients" on public.clients
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own invoices" on public.invoices
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own invoice_lines" on public.invoice_lines
  for all using (
    exists (select 1 from public.invoices i where i.id = invoice_id and i.user_id = auth.uid())
  ) with check (
    exists (select 1 from public.invoices i where i.id = invoice_id and i.user_id = auth.uid())
  );
create policy "own payments" on public.payments
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own expenses" on public.expenses
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own subscription" on public.subscriptions
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
