-- Growth features
-- Realtime + anti-bot support + limite por usuário + afiliados + ranking

alter table public.raffles
  add column if not exists max_numbers_per_user int not null default 0 check (max_numbers_per_user >= 0);

alter table public.orders
  add column if not exists affiliate_code text;

create table if not exists public.affiliates (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  code text not null unique,
  display_name text,
  commission_bps int not null default 500 check (commission_bps >= 0 and commission_bps <= 10000),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint affiliates_user_unique unique (user_id)
);

create table if not exists public.order_affiliates (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null unique references public.orders(id) on delete cascade,
  affiliate_id uuid not null references public.affiliates(id) on delete restrict,
  code text not null,
  commission_cents int not null default 0 check (commission_cents >= 0),
  status text not null default 'pending' check (status in ('pending', 'approved', 'paid', 'canceled')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists affiliates_code_idx on public.affiliates(code);
create index if not exists order_affiliates_affiliate_idx on public.order_affiliates(affiliate_id);
create index if not exists order_affiliates_status_idx on public.order_affiliates(status);

alter table public.affiliates enable row level security;
alter table public.order_affiliates enable row level security;

drop trigger if exists trg_affiliates_updated_at on public.affiliates;
create trigger trg_affiliates_updated_at
before update on public.affiliates
for each row execute function public.set_updated_at();

drop trigger if exists trg_order_affiliates_updated_at on public.order_affiliates;
create trigger trg_order_affiliates_updated_at
before update on public.order_affiliates
for each row execute function public.set_updated_at();

-- =========================================
-- RLS - AFFILIATES
-- =========================================
drop policy if exists "affiliates_read_active_or_own" on public.affiliates;
create policy "affiliates_read_active_or_own"
on public.affiliates for select
using (is_active = true or user_id = auth.uid() or public.is_admin());

drop policy if exists "affiliates_insert_own" on public.affiliates;
create policy "affiliates_insert_own"
on public.affiliates for insert
with check (user_id = auth.uid() or public.is_admin());

drop policy if exists "affiliates_update_own" on public.affiliates;
create policy "affiliates_update_own"
on public.affiliates for update
using (user_id = auth.uid() or public.is_admin())
with check (user_id = auth.uid() or public.is_admin());

drop policy if exists "affiliates_delete_admin" on public.affiliates;
create policy "affiliates_delete_admin"
on public.affiliates for delete
using (public.is_admin());

-- =========================================
-- RLS - ORDER_AFFILIATES
-- =========================================
drop policy if exists "order_affiliates_read_related" on public.order_affiliates;
create policy "order_affiliates_read_related"
on public.order_affiliates for select
using (
  public.is_admin()
  or exists (
    select 1
    from public.orders o
    where o.id = order_affiliates.order_id
      and o.user_id = auth.uid()
  )
  or exists (
    select 1
    from public.affiliates a
    where a.id = order_affiliates.affiliate_id
      and a.user_id = auth.uid()
  )
);

drop policy if exists "order_affiliates_admin_write" on public.order_affiliates;
create policy "order_affiliates_admin_write"
on public.order_affiliates for all
using (public.is_admin())
with check (public.is_admin());

-- =========================================
-- Funções de afiliado
-- =========================================
create or replace function public.ensure_affiliate_for_user(
  p_preferred_code text default null
)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user uuid;
  v_code text;
  v_try int;
begin
  v_user := auth.uid();

  if v_user is null then
    raise exception 'not authenticated';
  end if;

  select code into v_code
  from public.affiliates
  where user_id = v_user;

  if v_code is not null then
    return v_code;
  end if;

  if p_preferred_code is not null and btrim(p_preferred_code) <> '' then
    v_code := lower(btrim(p_preferred_code));

    if v_code !~ '^[a-z0-9_-]{3,40}$' then
      raise exception 'invalid affiliate code';
    end if;

    if exists(select 1 from public.affiliates where lower(code) = v_code) then
      raise exception 'affiliate code already in use';
    end if;

    insert into public.affiliates (user_id, code, is_active)
    values (v_user, v_code, true);

    return v_code;
  end if;

  for v_try in 1..8 loop
    v_code := lower('lp' || substr(md5(v_user::text || clock_timestamp()::text || v_try::text), 1, 8));

    begin
      insert into public.affiliates (user_id, code, is_active)
      values (v_user, v_code, true);

      return v_code;
    exception when unique_violation then
      continue;
    end;
  end loop;

  raise exception 'could not generate affiliate code';
end;
$$;

create or replace function public.link_affiliate_to_order(
  p_order_id uuid,
  p_affiliate_code text
)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_order public.orders%rowtype;
  v_affiliate public.affiliates%rowtype;
  v_normalized_code text;
  v_commission int;
begin
  if p_order_id is null or p_affiliate_code is null then
    return false;
  end if;

  v_normalized_code := lower(btrim(p_affiliate_code));

  if v_normalized_code = '' or v_normalized_code !~ '^[a-z0-9_-]{3,40}$' then
    return false;
  end if;

  select * into v_order
  from public.orders
  where id = p_order_id
  for update;

  if v_order.id is null then
    return false;
  end if;

  if v_order.status <> 'pending' then
    return false;
  end if;

  if exists(select 1 from public.order_affiliates where order_id = p_order_id) then
    return true;
  end if;

  select * into v_affiliate
  from public.affiliates
  where lower(code) = v_normalized_code
    and is_active = true
  limit 1;

  if v_affiliate.id is null then
    return false;
  end if;

  -- evita autoindicação
  if v_affiliate.user_id = v_order.user_id then
    return false;
  end if;

  v_commission := floor((v_order.amount_cents * v_affiliate.commission_bps)::numeric / 10000)::int;

  insert into public.order_affiliates (order_id, affiliate_id, code, commission_cents, status)
  values (p_order_id, v_affiliate.id, v_affiliate.code, v_commission, 'pending')
  on conflict (order_id)
  do nothing;

  update public.orders
  set affiliate_code = v_affiliate.code
  where id = p_order_id;

  return true;
end;
$$;

-- =========================================
-- Ranking de compradores
-- =========================================
create or replace function public.get_raffle_buyer_ranking(
  p_raffle_id uuid,
  p_limit int default 10
)
returns table (
  position int,
  participant text,
  total_numbers int
)
language sql
security definer
set search_path = public
as $$
  with grouped as (
    select
      rn.sold_to as user_id,
      count(*)::int as total_numbers
    from public.raffle_numbers rn
    where rn.raffle_id = p_raffle_id
      and rn.status = 'sold'
      and rn.sold_to is not null
    group by rn.sold_to
  ),
  ranked as (
    select
      row_number() over(order by g.total_numbers desc, g.user_id::text asc)::int as position,
      case
        when p.name is null or btrim(p.name) = ''
          then 'Participante #' || upper(substr(g.user_id::text, 1, 6))
        else split_part(p.name, ' ', 1) || ' #' || upper(substr(md5(g.user_id::text), 1, 3))
      end as participant,
      g.total_numbers
    from grouped g
    left join public.profiles p on p.id = g.user_id
  )
  select
    r.position,
    r.participant,
    r.total_numbers
  from ranked r
  order by r.position
  limit greatest(p_limit, 1);
$$;

-- =========================================
-- Atualiza função de reserva com limite por usuário
-- =========================================
create or replace function public.reserve_raffle_numbers(
  p_raffle_slug text,
  p_numbers int[] default null,
  p_qty int default null,
  p_reserve_minutes int default 15
)
returns table (
  order_id uuid,
  raffle_id uuid,
  reserved_numbers int[],
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
  v_numbers int[];
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
    v_numbers := p_numbers;
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

-- =========================================
-- Atualiza confirmação de pagamento para aprovar comissão de afiliado
-- =========================================
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

  update public.orders
  set status = 'paid',
      updated_at = now()
  where id = p_order_id;

  update public.raffle_numbers rn
  set status = 'sold',
      sold_to = v_order.user_id,
      sold_at = now(),
      reserved_until = null
  where rn.order_id = p_order_id
    and rn.status in ('reserved', 'available');

  update public.order_affiliates
  set status = 'approved',
      updated_at = now()
  where order_id = p_order_id
    and status = 'pending';

  insert into public.payments (order_id, provider, provider_reference, status, raw)
  values (p_order_id, p_provider, p_provider_reference, 'paid', p_raw)
  on conflict (provider, provider_reference)
  do update set
    status = 'paid',
    raw = excluded.raw,
    updated_at = now();
end;
$$;

-- =========================================
-- Grants
-- =========================================
grant execute on function public.ensure_affiliate_for_user(text) to authenticated;
grant execute on function public.link_affiliate_to_order(uuid, text) to authenticated, service_role;
grant execute on function public.get_raffle_buyer_ranking(uuid, int) to anon, authenticated;
grant execute on function public.reserve_raffle_numbers(text, int[], int, int) to authenticated;
