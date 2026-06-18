-- Branding / charte graphique par utilisateur
alter table public.business_settings
  add column if not exists logo_url text,
  add column if not exists color_primary text not null default '#14342b',
  add column if not exists color_accent text not null default '#c8a24b',
  add column if not exists color_ink text not null default '#1a1f1c',
  add column if not exists font_display text not null default 'Spectral',
  add column if not exists font_body text not null default 'PT Sans';

-- Codes promo (billing SaaS)
create table if not exists public.promo_codes (
  id uuid primary key default uuid_generate_v4(),
  code text unique not null,
  description text default '',
  percent_off int,
  amount_off numeric,
  duration text not null default 'once',
  max_redemptions int,
  times_redeemed int not null default 0,
  active boolean not null default true,
  stripe_coupon_id text,
  stripe_promo_id text,
  expires_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.promo_redemptions (
  id uuid primary key default uuid_generate_v4(),
  promo_id uuid not null references public.promo_codes(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  redeemed_at timestamptz not null default now(),
  unique (promo_id, user_id)
);

alter table public.promo_codes enable row level security;
alter table public.promo_redemptions enable row level security;

create policy "read active promos" on public.promo_codes
  for select using (active = true);
create policy "own redemptions" on public.promo_redemptions
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Storage : bucket logos / branding
insert into storage.buckets (id, name, public)
  values ('branding', 'branding', true)
  on conflict (id) do nothing;

create policy "branding public read"
  on storage.objects for select using (bucket_id = 'branding');
create policy "branding owner write"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'branding' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "branding owner update"
  on storage.objects for update to authenticated
  using (bucket_id = 'branding' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "branding owner delete"
  on storage.objects for delete to authenticated
  using (bucket_id = 'branding' and (storage.foldername(name))[1] = auth.uid()::text);

-- Auto-création des settings à l'inscription
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public
as $$
begin
  insert into public.business_settings (user_id, nom, email)
  values (new.id, coalesce(new.raw_user_meta_data->>'full_name',''), new.email)
  on conflict (user_id) do nothing;
  insert into public.subscriptions (user_id) values (new.id)
  on conflict (user_id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
