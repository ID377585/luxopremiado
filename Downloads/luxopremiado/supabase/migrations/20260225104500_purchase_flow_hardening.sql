-- Purchase flow hardening
-- 1) Prevent order from becoming paid without reserved numbers
-- 2) Ensure raffle_numbers is in realtime publication
-- 3) Ensure old/new status payload is available for realtime updates

begin;

create or replace function public.mark_order_paid(
  p_order_id uuid,
  p_provider text,
  p_provider_reference text,
  p_raw jsonb default null
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_order public.orders%rowtype;
  v_sold_count int := 0;
begin
  select * into v_order
  from public.orders
  where id = p_order_id
  for update;

  if v_order.id is null then
    raise exception 'order not found';
  end if;

  if v_order.status = 'paid' then
    return;
  end if;

  if v_order.status <> 'pending' then
    raise exception 'order status is not payable';
  end if;

  -- Lock reserved numbers first and only then transition order to paid.
  perform 1
  from public.raffle_numbers rn
  where rn.order_id = p_order_id
    and rn.status = 'reserved'
  for update;

  update public.raffle_numbers rn
  set status = 'sold',
      sold_to = v_order.user_id,
      sold_at = now(),
      reserved_until = null
  where rn.order_id = p_order_id
    and rn.status = 'reserved';

  get diagnostics v_sold_count = row_count;

  if coalesce(v_sold_count, 0) <= 0 then
    raise exception 'no reserved numbers linked to order';
  end if;

  update public.orders
  set status = 'paid',
      updated_at = now()
  where id = p_order_id
    and status = 'pending';

  if not found then
    raise exception 'order status changed before payment confirmation';
  end if;

  if to_regclass('public.order_affiliates') is not null then
    update public.order_affiliates
    set status = 'approved',
        updated_at = now()
    where order_id = p_order_id
      and status = 'pending';
  end if;

  insert into public.payments (order_id, provider, provider_reference, status, raw)
  values (p_order_id, p_provider, p_provider_reference, 'paid', p_raw)
  on conflict (provider, provider_reference)
  do update set
    status = 'paid',
    raw = excluded.raw,
    updated_at = now();
end;
$$;

-- Keep webhook path restricted to service role for this RPC.
revoke all on function public.mark_order_paid(uuid, text, text, jsonb) from anon, authenticated;
grant execute on function public.mark_order_paid(uuid, text, text, jsonb) to service_role;

-- Ensure realtime publication contains raffle_numbers (idempotent).
do $$
begin
  begin
    alter publication supabase_realtime add table public.raffle_numbers;
  exception
    when duplicate_object then
      null;
    when undefined_object then
      null;
  end;
end
$$;

-- We rely on old/new status transitions in the UI counters.
alter table public.raffle_numbers replica identity full;

select pg_notify('pgrst', 'reload schema');

commit;
