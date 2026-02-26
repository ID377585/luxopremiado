-- Validate provider contract after legacy normalization.

begin;

update public.payments
set provider = case
  when provider = 'pagarme' then 'mercadopago'
  when provider = 'manual' then 'mercadopago'
  else provider
end
where provider in ('pagarme', 'manual');

do $$
declare
  v_invalid_count int;
begin
  select count(*)
  into v_invalid_count
  from public.payments
  where provider not in ('mercadopago', 'asaas', 'stripe');

  if v_invalid_count > 0 then
    raise exception 'payments.provider possui % registros fora do contrato permitido', v_invalid_count;
  end if;
end;
$$;

alter table public.payments
  validate constraint payments_provider_check;

select pg_notify('pgrst', 'reload schema');

commit;
