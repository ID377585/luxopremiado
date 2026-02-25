-- Provider contract strictness
-- Remove pagarme from accepted provider set to match API/runtime implementation.

begin;

alter table public.payments
  drop constraint if exists payments_provider_check;

alter table public.payments
  add constraint payments_provider_check
  check (provider in ('mercadopago', 'asaas', 'stripe'))
  not valid;

select pg_notify('pgrst', 'reload schema');

commit;
