-- Lecture publique d'une facture par token (page d'acceptation client)
create or replace function public.get_public_invoice(p_token uuid)
returns jsonb language plpgsql security definer set search_path = public
as $$
declare result jsonb;
begin
  select jsonb_build_object(
    'numero', i.numero, 'status', i.status, 'total_ht', i.total_ht,
    'date_emission', i.date_emission, 'echeance', i.echeance,
    'accepted_at', i.accepted_at, 'snapshot', i.snapshot
  ) into result
  from public.invoices i
  where i.public_token = p_token
    and i.status in ('issued','sent','accepted','paid');
  return result;
end;
$$;

create or replace function public.accept_invoice(p_token uuid, p_ip text default null)
returns jsonb language plpgsql security definer set search_path = public
as $$
declare result jsonb;
begin
  update public.invoices
    set status = 'accepted', accepted_at = now(), accepted_ip = p_ip
  where public_token = p_token and status in ('issued','sent')
  returning jsonb_build_object('status', status, 'accepted_at', accepted_at) into result;
  return coalesce(result, jsonb_build_object('error','not_found_or_already_processed'));
end;
$$;

revoke all on function public.get_public_invoice(uuid) from public;
revoke all on function public.accept_invoice(uuid, text) from public;
grant execute on function public.get_public_invoice(uuid) to anon, authenticated;
grant execute on function public.accept_invoice(uuid, text) to anon, authenticated;
