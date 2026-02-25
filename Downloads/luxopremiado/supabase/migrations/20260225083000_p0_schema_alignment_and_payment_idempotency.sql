-- P0 alignment
-- - Keep reserve RPC compatible with int[] and bigint[] callers
-- - Enforce one open payment per (order, provider)
-- - Remove "manual" from allowed providers for new writes
-- - Ask PostgREST to reload schema cache

begin;

-- Keep historical rows untouched while enforcing provider set for new writes.
alter table public.payments
  drop constraint if exists payments_provider_check;

alter table public.payments
  add constraint payments_provider_check
  check (provider in ('mercadopago', 'asaas', 'pagarme', 'stripe'))
  not valid;

-- Close duplicate open payments and keep only the most recent one per order/provider.
with ranked_open as (
  select
    p.id,
    row_number() over (
      partition by p.order_id, p.provider
      order by p.created_at desc, p.id desc
    ) as rn
  from public.payments p
  where p.status in ('initiated', 'pending')
)
update public.payments p
set
  status = 'failed',
  updated_at = now(),
  raw = coalesce(p.raw, '{}'::jsonb) || jsonb_build_object('deduped_open_payment', true, 'deduped_at', now())
from ranked_open ro
where p.id = ro.id
  and ro.rn > 1;

create unique index if not exists payments_open_per_order_provider_unique
on public.payments(order_id, provider)
where status in ('initiated', 'pending');

-- Compatibility wrapper: old int[] callers still work while core function stays bigint[].
drop function if exists public.reserve_raffle_numbers(text, int[], int, int);

create or replace function public.reserve_raffle_numbers(
  p_raffle_slug text,
  p_numbers int[] default null,
  p_qty int default null,
  p_reserve_minutes int default 15
)
returns table (
  order_id uuid,
  raffle_id uuid,
  reserved_numbers bigint[],
  amount_cents int,
  expires_at timestamptz
)
language sql
security definer
set search_path = public
as $$
  select *
  from public.reserve_raffle_numbers(
    p_raffle_slug,
    case
      when p_numbers is null then null::bigint[]
      else (
        select array_agg(value::bigint order by ord)
        from unnest(p_numbers) with ordinality as typed(value, ord)
      )
    end,
    p_qty,
    p_reserve_minutes
  );
$$;

grant execute on function public.reserve_raffle_numbers(text, bigint[], int, int) to authenticated;
grant execute on function public.reserve_raffle_numbers(text, int[], int, int) to authenticated;

-- Force PostgREST schema cache refresh after function/index/constraint changes.
select pg_notify('pgrst', 'reload schema');

commit;
