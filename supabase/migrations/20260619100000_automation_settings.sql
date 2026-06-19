-- Configuration des envois automatiques (factures & déclarations)
-- Stockée sur business_settings pour rester liée au profil émetteur.

alter table public.business_settings
  add column if not exists auto_send_on_issue boolean not null default false, -- envoyer la facture au client dès validation
  add column if not exists auto_relance boolean not null default false,       -- relances auto sur échéance dépassée
  add column if not exists relance_delai_jours int not null default 7,        -- délai (jours) avant relance
  add column if not exists auto_declaration boolean not null default false,   -- transmission auto du récap de déclaration
  add column if not exists declaration_email text default '';                 -- destinataire du récap (ex. comptable)
