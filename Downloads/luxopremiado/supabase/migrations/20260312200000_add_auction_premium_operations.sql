alter table public.auctions
  add column if not exists lot_story text,
  add column if not exists condition_report text,
  add column if not exists authenticity_assets jsonb not null default '[]'::jsonb,
  add column if not exists appraisal_notes text,
  add column if not exists tie_break_rule text not null default 'Em empate de valor, vence o lance registrado primeiro.',
  add column if not exists settlement_deadline_hours integer not null default 24 check (settlement_deadline_hours > 0),
  add column if not exists pause_reason text,
  add column if not exists paused_at timestamptz,
  add column if not exists winner_status text not null default 'pending'
    check (winner_status in ('pending', 'contacted', 'paid', 'delivered', 'defaulted')),
  add column if not exists winner_contacted_at timestamptz,
  add column if not exists winner_paid_at timestamptz,
  add column if not exists winner_delivered_at timestamptz;

alter table public.auction_bids
  add column if not exists source text not null default 'manual'
    check (source in ('manual', 'proxy', 'admin')),
  add column if not exists disqualified_at timestamptz,
  add column if not exists disqualified_reason text,
  add column if not exists disqualified_by_user_id uuid;

create index if not exists auction_bids_valid_idx
  on public.auction_bids (auction_id, disqualified_at, amount_cents desc, created_at asc);

create table if not exists public.auction_auto_bids (
  id uuid primary key default gen_random_uuid(),
  auction_id uuid not null references public.auctions(id) on delete cascade,
  bidder_user_id uuid,
  bidder_name text,
  bidder_contact text,
  max_amount_cents integer not null check (max_amount_cents > 0),
  is_active boolean not null default true,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create unique index if not exists auction_auto_bids_identity_idx
  on public.auction_auto_bids (
    auction_id,
    coalesce(bidder_user_id::text, bidder_contact)
  );

create index if not exists auction_auto_bids_active_idx
  on public.auction_auto_bids (auction_id, is_active, max_amount_cents desc, created_at asc);

create table if not exists public.auction_timeline_events (
  id uuid primary key default gen_random_uuid(),
  auction_id uuid not null references public.auctions(id) on delete cascade,
  actor_user_id uuid,
  event_type text not null,
  headline text not null,
  description text,
  amount_cents integer,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now())
);

create index if not exists auction_timeline_events_auction_idx
  on public.auction_timeline_events (auction_id, created_at desc);

create table if not exists public.auction_visit_sessions (
  id uuid primary key default gen_random_uuid(),
  auction_id uuid not null references public.auctions(id) on delete cascade,
  visitor_key text not null,
  user_id uuid,
  first_seen_at timestamptz not null default timezone('utc', now()),
  last_seen_at timestamptz not null default timezone('utc', now()),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint auction_visit_sessions_unique unique (auction_id, visitor_key)
);

create index if not exists auction_visit_sessions_auction_idx
  on public.auction_visit_sessions (auction_id, last_seen_at desc);

create or replace function public.log_auction_event(
  p_auction_id uuid,
  p_event_type text,
  p_headline text,
  p_description text default null,
  p_amount_cents integer default null,
  p_payload jsonb default '{}'::jsonb,
  p_actor_user_id uuid default null
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_id uuid;
begin
  insert into public.auction_timeline_events (
    auction_id,
    actor_user_id,
    event_type,
    headline,
    description,
    amount_cents,
    payload
  )
  values (
    p_auction_id,
    p_actor_user_id,
    p_event_type,
    p_headline,
    p_description,
    p_amount_cents,
    coalesce(p_payload, '{}'::jsonb)
  )
  returning id into v_id;

  return v_id;
end;
$$;

create or replace function public.register_auction_visit(
  p_auction_id uuid,
  p_visitor_key text,
  p_user_id uuid default null
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_now timestamptz := timezone('utc', now());
begin
  if p_auction_id is null or coalesce(trim(p_visitor_key), '') = '' then
    return;
  end if;

  insert into public.auction_visit_sessions (
    auction_id,
    visitor_key,
    user_id,
    first_seen_at,
    last_seen_at,
    created_at,
    updated_at
  )
  values (
    p_auction_id,
    trim(p_visitor_key),
    p_user_id,
    v_now,
    v_now,
    v_now,
    v_now
  )
  on conflict (auction_id, visitor_key) do update
  set
    user_id = coalesce(excluded.user_id, public.auction_visit_sessions.user_id),
    last_seen_at = v_now,
    updated_at = v_now;
end;
$$;

create or replace function public.recalculate_auction_snapshot(
  p_auction_id uuid
)
returns public.auctions
language plpgsql
security definer
set search_path = public
as $$
declare
  v_result public.auctions%rowtype;
begin
  with ranked_bids as (
    select
      b.auction_id,
      b.bidder_user_id,
      b.bidder_name,
      b.bidder_contact,
      b.amount_cents,
      b.created_at,
      row_number() over (
        partition by b.auction_id
        order by b.amount_cents desc, b.created_at asc
      ) as bid_rank
    from public.auction_bids b
    where b.auction_id = p_auction_id
      and b.disqualified_at is null
  ),
  aggregated as (
    select
      b.auction_id,
      count(*)::integer as total_bids,
      count(distinct coalesce(b.bidder_user_id::text, b.bidder_contact, 'anon-' || b.id::text))::integer as unique_bidder_count,
      max(b.created_at) as last_bid_at
    from public.auction_bids b
    where b.auction_id = p_auction_id
      and b.disqualified_at is null
    group by b.auction_id
  )
  update public.auctions a
  set
    total_bids = coalesce(agg.total_bids, 0),
    unique_bidder_count = coalesce(agg.unique_bidder_count, 0),
    last_bid_at = agg.last_bid_at,
    leading_bidder_user_id = leader.bidder_user_id,
    leading_bidder_name = leader.bidder_name,
    leading_bidder_contact = leader.bidder_contact,
    current_bid_cents = coalesce(leader.amount_cents, 0),
    updated_at = timezone('utc', now())
  from aggregated agg
  left join ranked_bids leader
    on leader.auction_id = agg.auction_id
   and leader.bid_rank = 1
  where a.id = p_auction_id
    and a.id = agg.auction_id;

  if not found then
    update public.auctions a
    set
      total_bids = 0,
      unique_bidder_count = 0,
      last_bid_at = null,
      leading_bidder_user_id = null,
      leading_bidder_name = null,
      leading_bidder_contact = null,
      current_bid_cents = 0,
      updated_at = timezone('utc', now())
    where a.id = p_auction_id;
  end if;

  select *
  into v_result
  from public.auctions
  where id = p_auction_id;

  return v_result;
end;
$$;

create or replace function public.sync_auction_state(
  p_raffle_slug text default null,
  p_slug text default null
)
returns setof public.auctions
language plpgsql
security definer
set search_path = public
as $$
declare
  v_now timestamptz := timezone('utc', now());
begin
  with top_bids as (
    select distinct on (b.auction_id)
      b.auction_id,
      b.bidder_user_id,
      b.bidder_name,
      b.bidder_contact,
      b.amount_cents
    from public.auction_bids b
    where b.disqualified_at is null
    order by b.auction_id, b.amount_cents desc, b.created_at asc
  )
  update public.auctions a
  set
    status = case when tb.auction_id is null then 'closed' else 'settled' end,
    winner_user_id = tb.bidder_user_id,
    winner_name = tb.bidder_name,
    winner_contact = tb.bidder_contact,
    winner_bid_cents = tb.amount_cents,
    winner_status = case when tb.auction_id is null then a.winner_status else 'pending' end,
    finalized_at = coalesce(a.finalized_at, v_now),
    updated_at = v_now
  from top_bids tb
  where a.status in ('open', 'scheduled')
    and a.ends_at <= v_now
    and (p_raffle_slug is null or a.raffle_slug = p_raffle_slug)
    and (p_slug is null or a.slug = p_slug)
    and tb.auction_id = a.id;

  update public.auctions a
  set
    status = 'closed',
    finalized_at = coalesce(a.finalized_at, v_now),
    updated_at = v_now
  where a.status in ('open', 'scheduled')
    and a.ends_at <= v_now
    and (p_raffle_slug is null or a.raffle_slug = p_raffle_slug)
    and (p_slug is null or a.slug = p_slug)
    and not exists (
      select 1
      from public.auction_bids b
      where b.auction_id = a.id
        and b.disqualified_at is null
    );

  return query
  select a.*
  from public.auctions a
  where (p_raffle_slug is null or a.raffle_slug = p_raffle_slug)
    and (p_slug is null or a.slug = p_slug)
  order by a.updated_at desc nulls last, a.created_at desc;
end;
$$;

create or replace function public.place_auction_bid(
  p_raffle_slug text,
  p_slug text,
  p_bidder_user_id uuid,
  p_bidder_name text,
  p_bidder_contact text,
  p_amount_cents integer,
  p_source text default 'manual'
)
returns table (
  ok boolean,
  error_code text,
  error_message text,
  auction_id uuid,
  current_bid_cents integer,
  next_min_bid_cents integer,
  ends_at timestamptz,
  status text,
  reserve_met boolean,
  extended boolean
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_auction public.auctions%rowtype;
  v_now timestamptz := timezone('utc', now());
  v_next_min integer;
  v_new_ends_at timestamptz;
  v_is_new_participant boolean := false;
  v_extended boolean := false;
  v_normalized_name text := nullif(trim(p_bidder_name), '');
  v_identity text := coalesce(p_bidder_user_id::text, nullif(trim(p_bidder_contact), ''));
  v_source text := case when p_source in ('proxy', 'admin') then p_source else 'manual' end;
begin
  if coalesce(trim(p_raffle_slug), '') = '' then
    return query select false, 'auction_not_found', 'Leilão não encontrado.', null::uuid, null::integer, null::integer, null::timestamptz, null::text, false, false;
    return;
  end if;

  perform public.sync_auction_state(p_raffle_slug, nullif(trim(p_slug), ''));

  if nullif(trim(p_slug), '') is null then
    select *
    into v_auction
    from public.auctions
    where raffle_slug = p_raffle_slug
    order by
      case status when 'open' then 0 when 'scheduled' then 1 when 'settled' then 2 else 3 end,
      ends_at asc,
      updated_at desc
    limit 1
    for update;
  else
    select *
    into v_auction
    from public.auctions
    where raffle_slug = p_raffle_slug
      and slug = trim(p_slug)
    limit 1
    for update;
  end if;

  if not found then
    return query select false, 'auction_not_found', 'Leilão não encontrado.', null::uuid, null::integer, null::integer, null::timestamptz, null::text, false, false;
    return;
  end if;

  if v_auction.status <> 'open' or v_auction.paused_at is not null then
    return query select false, 'auction_closed', 'Leilão indisponível para novos lances.', v_auction.id, v_auction.current_bid_cents, null::integer, v_auction.ends_at, v_auction.status, coalesce(v_auction.reserve_price_cents, 0) = 0 or v_auction.current_bid_cents >= coalesce(v_auction.reserve_price_cents, 0), false;
    return;
  end if;

  if v_auction.ends_at <= v_now then
    perform public.sync_auction_state(v_auction.raffle_slug, v_auction.slug);
    return query select false, 'auction_closed', 'Leilão encerrado.', v_auction.id, v_auction.current_bid_cents, null::integer, v_auction.ends_at, 'closed', coalesce(v_auction.reserve_price_cents, 0) = 0 or v_auction.current_bid_cents >= coalesce(v_auction.reserve_price_cents, 0), false;
    return;
  end if;

  v_next_min := greatest(
    coalesce(v_auction.current_bid_cents, 0) + greatest(1, coalesce(v_auction.min_increment_cents, 1)),
    coalesce(v_auction.opening_bid_cents, 0)
  );

  if p_amount_cents is null or p_amount_cents < v_next_min then
    return query select false, 'bid_too_low', format('Lance mínimo agora é %s.', (v_next_min::numeric / 100)::text), v_auction.id, v_auction.current_bid_cents, v_next_min, v_auction.ends_at, v_auction.status, coalesce(v_auction.reserve_price_cents, 0) = 0 or v_auction.current_bid_cents >= coalesce(v_auction.reserve_price_cents, 0), false;
    return;
  end if;

  if v_identity is not null then
    select not exists (
      select 1
      from public.auction_bids b
      where b.auction_id = v_auction.id
        and b.disqualified_at is null
        and (
          (p_bidder_user_id is not null and b.bidder_user_id = p_bidder_user_id)
          or (p_bidder_user_id is null and nullif(trim(p_bidder_contact), '') is not null and b.bidder_contact = nullif(trim(p_bidder_contact), ''))
        )
    )
    into v_is_new_participant;
  end if;

  insert into public.auction_bids (
    auction_id,
    bidder_user_id,
    bidder_name,
    bidder_contact,
    amount_cents,
    source
  )
  values (
    v_auction.id,
    p_bidder_user_id,
    v_normalized_name,
    nullif(trim(p_bidder_contact), ''),
    p_amount_cents,
    v_source
  );

  v_new_ends_at := v_auction.ends_at;
  if v_auction.bid_extension_window_seconds > 0
    and v_auction.bid_extension_seconds > 0
    and v_auction.ends_at - v_now <= make_interval(secs => v_auction.bid_extension_window_seconds)
  then
    v_new_ends_at := greatest(v_auction.ends_at, v_now) + make_interval(secs => v_auction.bid_extension_seconds);
    v_extended := true;
  end if;

  update public.auctions
  set
    current_bid_cents = p_amount_cents,
    leading_bidder_user_id = p_bidder_user_id,
    leading_bidder_name = coalesce(v_normalized_name, leading_bidder_name, 'Participante'),
    leading_bidder_contact = nullif(trim(p_bidder_contact), ''),
    last_bid_at = v_now,
    total_bids = total_bids + 1,
    unique_bidder_count = unique_bidder_count + case when v_is_new_participant then 1 else 0 end,
    ends_at = v_new_ends_at,
    updated_at = v_now
  where id = v_auction.id;

  perform public.log_auction_event(
    v_auction.id,
    case when v_source = 'proxy' then 'proxy_bid' else 'bid' end,
    case when v_source = 'proxy' then 'Auto-bid reagiu na disputa.' else 'Novo lance confirmado.' end,
    coalesce(v_normalized_name, 'Participante') || ' levou o lote para ' || (p_amount_cents::numeric / 100)::text,
    p_amount_cents,
    jsonb_build_object('extended', v_extended, 'source', v_source),
    p_bidder_user_id
  );

  return query
  select
    true,
    null::text,
    null::text,
    v_auction.id,
    p_amount_cents,
    p_amount_cents + greatest(1, coalesce(v_auction.min_increment_cents, 1)),
    v_new_ends_at,
    'open',
    coalesce(v_auction.reserve_price_cents, 0) = 0 or p_amount_cents >= coalesce(v_auction.reserve_price_cents, 0),
    v_extended;
end;
$$;
