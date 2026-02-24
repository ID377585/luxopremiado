-- Expand raffle numbers to 12-digit domain (000000000000..999999999999)

begin;

-- Recreate dependent view after type change

drop view if exists public.v_raffle_numbers_public;

alter table public.raffle_numbers
  alter column number type bigint using number::bigint;

alter table public.raffle_numbers
  drop constraint if exists raffle_numbers_number_range_chk;

alter table public.raffle_numbers
  add constraint raffle_numbers_number_range_chk
  check (number >= 0 and number <= 999999999999);

-- Keep generation deterministic and compatible with 12-digit formatting.
-- For total_numbers = 10000, generated range will be 0..9999.
create or replace function public.generate_raffle_numbers(p_raffle_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_total int;
begin
  if not public.is_admin() then
    raise exception 'not authorized';
  end if;

  select total_numbers into v_total
  from public.raffles
  where id = p_raffle_id;

  if v_total is null then
    raise exception 'raffle not found';
  end if;

  if v_total <= 0 then
    raise exception 'total_numbers must be greater than zero';
  end if;

  insert into public.raffle_numbers (raffle_id, number)
  select p_raffle_id, gs::bigint
  from generate_series(0, v_total - 1) as gs
  on conflict (raffle_id, number) do nothing;
end;
$$;

-- Replace reserve RPC signature to bigint[] to support 12-digit numbers.

drop function if exists public.reserve_raffle_numbers(text, int[], int, int);
drop function if exists public.reserve_raffle_numbers(text, bigint[], int, int);

create or replace function public.reserve_raffle_numbers(
  p_raffle_slug text,
  p_numbers bigint[] default null,
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
language plpgsql
security definer
set search_path = public
as $$
declare
  v_raffle_id uuid;
  v_price int;
  v_status text;
  v_user uuid;
  v_order_id uuid;
  v_expires timestamptz;
  v_numbers bigint[];
  v_count int;
  v_user_limit int;
  v_user_current_total int;
begin
  v_user := auth.uid();

  if v_user is null then
    raise exception 'not authenticated';
  end if;

  select r.id, r.price_cents, r.status, r.max_numbers_per_user
    into v_raffle_id, v_price, v_status, v_user_limit
  from public.raffles r
  where r.slug = p_raffle_slug;

  if v_raffle_id is null then
    raise exception 'raffle not found';
  end if;

  if v_status <> 'active' then
    raise exception 'raffle not active';
  end if;

  if (p_numbers is null and p_qty is null) or (p_numbers is not null and p_qty is not null) then
    raise exception 'provide either p_numbers OR p_qty';
  end if;

  v_expires := now() + make_interval(mins => p_reserve_minutes);

  perform pg_advisory_xact_lock(hashtext(v_raffle_id::text));

  if p_numbers is not null then
    select array_agg(distinct n order by n)
      into v_numbers
    from unnest(p_numbers) as n
    where n >= 0
      and n <= 999999999999;

    if v_numbers is null or array_length(v_numbers, 1) is null then
      raise exception 'invalid numbers';
    end if;
  else
    select array_agg(n.number)
      into v_numbers
    from (
      select rn.number
      from public.raffle_numbers rn
      where rn.raffle_id = v_raffle_id
        and rn.status = 'available'
      order by random()
      limit p_qty
      for update
    ) n;

    if v_numbers is null or array_length(v_numbers, 1) is null then
      raise exception 'no available numbers';
    end if;
  end if;

  v_count := array_length(v_numbers, 1);
  if v_count is null or v_count <= 0 then
    raise exception 'invalid numbers';
  end if;

  if v_user_limit > 0 then
    select count(*)::int
      into v_user_current_total
    from public.raffle_numbers rn
    left join public.orders o on o.id = rn.order_id
    where rn.raffle_id = v_raffle_id
      and (
        (rn.status = 'sold' and rn.sold_to = v_user)
        or (
          rn.status = 'reserved'
          and rn.reserved_by = v_user
          and (rn.reserved_until is null or rn.reserved_until > now())
          and (o.status is null or o.status = 'pending')
        )
      );

    if coalesce(v_user_current_total, 0) + v_count > v_user_limit then
      raise exception 'purchase limit exceeded for this raffle';
    end if;
  end if;

  perform 1
  from public.raffle_numbers rn
  where rn.raffle_id = v_raffle_id
    and rn.number = any(v_numbers)
  for update;

  if (
    select count(*)
    from public.raffle_numbers rn
    where rn.raffle_id = v_raffle_id
      and rn.number = any(v_numbers)
      and rn.status = 'available'
  ) <> v_count then
    raise exception 'one or more numbers not available';
  end if;

  insert into public.orders (raffle_id, user_id, status, amount_cents, expires_at)
  values (v_raffle_id, v_user, 'pending', v_price * v_count, v_expires)
  returning id into v_order_id;

  update public.raffle_numbers rn
  set status = 'reserved',
      reserved_by = v_user,
      reserved_until = v_expires,
      order_id = v_order_id
  where rn.raffle_id = v_raffle_id
    and rn.number = any(v_numbers)
    and rn.status = 'available';

  insert into public.order_items (order_id, raffle_number_id)
  select v_order_id, rn.id
  from public.raffle_numbers rn
  where rn.order_id = v_order_id;

  order_id := v_order_id;
  raffle_id := v_raffle_id;
  reserved_numbers := v_numbers;
  amount_cents := v_price * v_count;
  expires_at := v_expires;

  return next;
end;
$$;

create or replace view public.v_raffle_numbers_public as
select
  rn.raffle_id,
  rn.number,
  rn.status
from public.raffle_numbers rn;

grant select on public.v_raffle_numbers_public to anon, authenticated;
grant execute on function public.generate_raffle_numbers(uuid) to authenticated;
grant execute on function public.reserve_raffle_numbers(text, bigint[], int, int) to authenticated;

commit;
