-- Phase 1 : 3 parcours (entreprise | asso | particulier) + asso 1901 gratuite

alter table public.business_settings
  add column if not exists profile_type text not null default 'entreprise', -- entreprise | asso | particulier
  add column if not exists onboarded boolean not null default false,
  add column if not exists rna text default '',                              -- n RNA association (W + 9 chiffres)
  add column if not exists asso_proof_url text,                              -- chemin du justificatif dans le storage
  add column if not exists asso_verified boolean not null default false;     -- controle admin a posteriori

-- bucket PRIVE pour les preuves d'association
insert into storage.buckets (id, name, public)
  values ('asso-proofs', 'asso-proofs', false)
  on conflict (id) do nothing;

create policy "asso_proofs_owner_read"
  on storage.objects for select to authenticated
  using (bucket_id = 'asso-proofs' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "asso_proofs_owner_write"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'asso-proofs' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "asso_proofs_owner_update"
  on storage.objects for update to authenticated
  using (bucket_id = 'asso-proofs' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "asso_proofs_owner_delete"
  on storage.objects for delete to authenticated
  using (bucket_id = 'asso-proofs' and (storage.foldername(name))[1] = auth.uid()::text);
