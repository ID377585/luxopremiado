-- Luxo Premiado - migration inicial
-- Compatível com Supabase Postgres

create extension if not exists pgcrypto;

-- =========================================
-- Helpers
-- =========================================
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace function public.is_admin()
returns boolean
language sql
stable
as $$
  select exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and p.role = 'admin'
  );
$$;

-- =========================================
-- Tabelas
-- =========================================
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text,
  phone text,
  role text not null default 'user' check (role in ('user', 'admin')),
  created_at timestamptz not null default now()
);

create table if not exists public.raffles (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  description text,
  cover_image_url text,
  price_cents int not null check (price_cents > 0),
  total_numbers int not null check (total_numbers > 0),
  draw_date timestamptz,
  draw_method text not null default 'loteria_federal'
    check (draw_method in ('loteria_federal', 'sorteador', 'ao_vivo', 'outro')),
  status text not null default 'draft'
    check (status in ('draft', 'active', 'closed', 'drawn')),
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.raffle_images (
  id uuid primary key default gen_random_uuid(),
  raffle_id uuid not null references public.raffles(id) on delete cascade,
  url text not null,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  raffle_id uuid not null references public.raffles(id) on delete restrict,
  user_id uuid not null references public.profiles(id) on delete restrict,
  status text not null default 'pending'
    check (status in ('pending', 'paid', 'canceled', 'expired', 'refunded')),
  amount_cents int not null default 0 check (amount_cents >= 0),
  expires_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.raffle_numbers (
  id uuid primary key default gen_random_uuid(),
  raffle_id uuid not null references public.raffles(id) on delete cascade,
  number int not null,
  status text not null default 'available'
    check (status in ('available', 'reserved', 'sold')),
  reserved_by uuid references public.profiles(id),
  reserved_until timestamptz,
  order_id uuid references public.orders(id) on delete set null,
  sold_to uuid references public.profiles(id),
  sold_at timestamptz,
  created_at timestamptz not null default now(),
  constraint raffle_numbers_unique unique (raffle_id, number)
);

create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  raffle_number_id uuid not null references public.raffle_numbers(id) on delete restrict,
  created_at timestamptz not null default now(),
  constraint order_items_unique unique (order_id, raffle_number_id)
);

create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  provider text not null check (provider in ('mercadopago', 'asaas', 'pagarme', 'stripe', 'manual')),
  provider_reference text,
  status text not null default 'initiated'
    check (status in ('initiated', 'pending', 'paid', 'failed', 'refunded')),
  pix_qr_code text,
  pix_copy_paste text,
  raw jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.social_proof (
  id uuid primary key default gen_random_uuid(),
  raffle_id uuid not null references public.raffles(id) on delete cascade,
  type text not null check (type in ('winner', 'testimonial', 'print')),
  title text,
  content text,
  media_url text,
  created_at timestamptz not null default now()
);

create table if not exists public.faq (
  id uuid primary key default gen_random_uuid(),
  raffle_id uuid references public.raffles(id) on delete cascade,
  question text not null,
  answer text not null,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.transparency (
  raffle_id uuid primary key references public.raffles(id) on delete cascade,
  draw_method text,
  rules text,
  audit_text text,
  organizer_name text,
  organizer_doc text,
  contact text,
  updated_at timestamptz not null default now()
);

-- =========================================
-- Índices
-- =========================================
create index if not exists raffles_status_idx on public.raffles(status);
create index if not exists raffles_draw_date_idx on public.raffles(draw_date);
create index if not exists raffle_images_raffle_idx on public.raffle_images(raffle_id);
create index if not exists raffle_numbers_raffle_status_idx on public.raffle_numbers(raffle_id, status);
create index if not exists raffle_numbers_reserved_until_idx on public.raffle_numbers(reserved_until);
create index if not exists raffle_numbers_order_idx on public.raffle_numbers(order_id);
create index if not exists orders_user_idx on public.orders(user_id, created_at desc);
create index if not exists orders_raffle_idx on public.orders(raffle_id, created_at desc);
create index if not exists orders_status_idx on public.orders(status);
create index if not exists order_items_order_idx on public.order_items(order_id);
create index if not exists payments_order_idx on public.payments(order_id);
create unique index if not exists payments_provider_ref_unique on public.payments(provider, provider_reference)
where provider_reference is not null;
create index if not exists social_proof_raffle_idx on public.social_proof(raffle_id);
create index if not exists faq_raffle_idx on public.faq(raffle_id, sort_order);

-- =========================================
-- Triggers
-- =========================================
drop trigger if exists trg_raffles_updated_at on public.raffles;
create trigger trg_raffles_updated_at
before update on public.raffles
for each row execute function public.set_updated_at();

drop trigger if exists trg_orders_updated_at on public.orders;
create trigger trg_orders_updated_at
before update on public.orders
for each row execute function public.set_updated_at();

drop trigger if exists trg_payments_updated_at on public.payments;
create trigger trg_payments_updated_at
before update on public.payments
for each row execute function public.set_updated_at();

drop trigger if exists trg_transparency_updated_at on public.transparency;
create trigger trg_transparency_updated_at
before update on public.transparency
for each row execute function public.set_updated_at();

-- =========================================
-- Auto criação de profile
-- =========================================
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'name', split_part(new.email, '@', 1))
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();

-- =========================================
-- RPC: gerar números por rifa
-- =========================================
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

  insert into public.raffle_numbers (raffle_id, number)
  select p_raffle_id, gs
  from generate_series(1, v_total) gs
  on conflict (raffle_id, number) do nothing;
end;
$$;

-- =========================================
-- RPC: reservar números (transacional)
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
begin
  v_user := auth.uid();

  if v_user is null then
    raise exception 'not authenticated';
  end if;

  select r.id, r.price_cents, r.status
    into v_raffle_id, v_price, v_status
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
-- RPC: marcar pedido como pago (idempotente)
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
-- RPC: expirar reservas
-- =========================================
create or replace function public.expire_reservations()
returns int
language plpgsql
security definer
set search_path = public
as $$
declare
  v_count int;
begin
  update public.orders o
  set status = 'expired',
      updated_at = now()
  where o.status = 'pending'
    and o.expires_at is not null
    and o.expires_at < now();

  with to_release as (
    select rn.id
    from public.raffle_numbers rn
    join public.orders o on o.id = rn.order_id
    where rn.status = 'reserved'
      and rn.reserved_until is not null
      and rn.reserved_until < now()
      and o.status in ('pending', 'expired', 'canceled')
  )
  update public.raffle_numbers rn
  set status = 'available',
      reserved_by = null,
      reserved_until = null,
      order_id = null
  where rn.id in (select id from to_release);

  get diagnostics v_count = row_count;
  return v_count;
end;
$$;

-- =========================================
-- View pública de números
-- =========================================
create or replace view public.v_raffle_numbers_public as
select
  rn.raffle_id,
  rn.number,
  rn.status
from public.raffle_numbers rn;

-- =========================================
-- RLS
-- =========================================
alter table public.profiles enable row level security;
alter table public.raffles enable row level security;
alter table public.raffle_images enable row level security;
alter table public.raffle_numbers enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.payments enable row level security;
alter table public.social_proof enable row level security;
alter table public.faq enable row level security;
alter table public.transparency enable row level security;

-- PROFILES
drop policy if exists "profiles_read_own" on public.profiles;
create policy "profiles_read_own"
on public.profiles for select
using (id = auth.uid() or public.is_admin());

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own"
on public.profiles for update
using (id = auth.uid() or public.is_admin())
with check (id = auth.uid() or public.is_admin());

drop policy if exists "profiles_insert_self" on public.profiles;
create policy "profiles_insert_self"
on public.profiles for insert
with check (id = auth.uid());

-- RAFFLES
drop policy if exists "raffles_read_public_active" on public.raffles;
create policy "raffles_read_public_active"
on public.raffles for select
using (status in ('active', 'closed', 'drawn') or public.is_admin());

drop policy if exists "raffles_admin_write" on public.raffles;
create policy "raffles_admin_write"
on public.raffles for all
using (public.is_admin())
with check (public.is_admin());

-- RAFFLE IMAGES
drop policy if exists "raffle_images_read_public" on public.raffle_images;
create policy "raffle_images_read_public"
on public.raffle_images for select
using (
  exists (
    select 1
    from public.raffles r
    where r.id = raffle_images.raffle_id
      and (r.status in ('active', 'closed', 'drawn') or public.is_admin())
  )
);

drop policy if exists "raffle_images_admin_write" on public.raffle_images;
create policy "raffle_images_admin_write"
on public.raffle_images for all
using (public.is_admin())
with check (public.is_admin());

-- RAFFLE NUMBERS
drop policy if exists "raffle_numbers_read_public_limited" on public.raffle_numbers;
create policy "raffle_numbers_read_public_limited"
on public.raffle_numbers for select
using (
  exists (
    select 1
    from public.raffles r
    where r.id = raffle_numbers.raffle_id
      and (r.status in ('active', 'closed', 'drawn') or public.is_admin())
  )
);

drop policy if exists "raffle_numbers_admin_write" on public.raffle_numbers;
create policy "raffle_numbers_admin_write"
on public.raffle_numbers for all
using (public.is_admin())
with check (public.is_admin());

-- ORDERS
drop policy if exists "orders_read_own" on public.orders;
create policy "orders_read_own"
on public.orders for select
using (user_id = auth.uid() or public.is_admin());

drop policy if exists "orders_admin_write" on public.orders;
create policy "orders_admin_write"
on public.orders for all
using (public.is_admin())
with check (public.is_admin());

-- ORDER ITEMS
drop policy if exists "order_items_read_own" on public.order_items;
create policy "order_items_read_own"
on public.order_items for select
using (
  public.is_admin()
  or exists (
    select 1
    from public.orders o
    where o.id = order_items.order_id
      and o.user_id = auth.uid()
  )
);

drop policy if exists "order_items_admin_write" on public.order_items;
create policy "order_items_admin_write"
on public.order_items for all
using (public.is_admin())
with check (public.is_admin());

-- PAYMENTS
drop policy if exists "payments_read_own" on public.payments;
create policy "payments_read_own"
on public.payments for select
using (
  public.is_admin()
  or exists (
    select 1
    from public.orders o
    where o.id = payments.order_id
      and o.user_id = auth.uid()
  )
);

drop policy if exists "payments_admin_write" on public.payments;
create policy "payments_admin_write"
on public.payments for all
using (public.is_admin())
with check (public.is_admin());

-- SOCIAL PROOF
drop policy if exists "social_proof_read_public" on public.social_proof;
create policy "social_proof_read_public"
on public.social_proof for select
using (
  exists (
    select 1
    from public.raffles r
    where r.id = social_proof.raffle_id
      and (r.status in ('active', 'closed', 'drawn') or public.is_admin())
  )
);

drop policy if exists "social_proof_admin_write" on public.social_proof;
create policy "social_proof_admin_write"
on public.social_proof for all
using (public.is_admin())
with check (public.is_admin());

-- FAQ
drop policy if exists "faq_read_public" on public.faq;
create policy "faq_read_public"
on public.faq for select
using (true);

drop policy if exists "faq_admin_write" on public.faq;
create policy "faq_admin_write"
on public.faq for all
using (public.is_admin())
with check (public.is_admin());

-- TRANSPARENCY
drop policy if exists "transparency_read_public" on public.transparency;
create policy "transparency_read_public"
on public.transparency for select
using (
  exists (
    select 1
    from public.raffles r
    where r.id = transparency.raffle_id
      and (r.status in ('active', 'closed', 'drawn') or public.is_admin())
  )
);

drop policy if exists "transparency_admin_write" on public.transparency;
create policy "transparency_admin_write"
on public.transparency for all
using (public.is_admin())
with check (public.is_admin());

-- =========================================
-- Grants
-- =========================================
grant usage on schema public to anon, authenticated;
grant select on public.v_raffle_numbers_public to anon, authenticated;

grant execute on function public.reserve_raffle_numbers(text, int[], int, int) to authenticated;
grant execute on function public.expire_reservations() to service_role;
grant execute on function public.generate_raffle_numbers(uuid) to authenticated;
revoke all on function public.mark_order_paid(uuid, text, text, jsonb) from anon, authenticated;
grant execute on function public.mark_order_paid(uuid, text, text, jsonb) to service_role;
