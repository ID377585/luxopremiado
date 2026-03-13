alter table public.auctions
  add column if not exists raffle_slug text,
  add column if not exists lot_label text,
  add column if not exists subtitle text,
  add column if not exists highlight_badge text,
  add column if not exists opening_bid_cents integer not null default 0 check (opening_bid_cents >= 0),
  add column if not exists reserve_price_cents integer check (reserve_price_cents >= 0),
  add column if not exists market_value_cents integer check (market_value_cents >= 0),
  add column if not exists gallery_urls jsonb not null default '[]'::jsonb,
  add column if not exists feature_bullets jsonb not null default '[]'::jsonb,
  add column if not exists video_url text,
  add column if not exists condition_summary text,
  add column if not exists shipping_info text,
  add column if not exists pickup_info text,
  add column if not exists authenticity_info text,
  add column if not exists invoice_info text,
  add column if not exists total_bids integer not null default 0 check (total_bids >= 0),
  add column if not exists unique_bidder_count integer not null default 0 check (unique_bidder_count >= 0),
  add column if not exists bid_extension_window_seconds integer not null default 120 check (bid_extension_window_seconds >= 0),
  add column if not exists bid_extension_seconds integer not null default 120 check (bid_extension_seconds >= 0),
  add column if not exists leading_bidder_user_id uuid,
  add column if not exists leading_bidder_name text,
  add column if not exists leading_bidder_contact text,
  add column if not exists last_bid_at timestamptz,
  add column if not exists winner_user_id uuid,
  add column if not exists winner_name text,
  add column if not exists winner_contact text,
  add column if not exists winner_bid_cents integer check (winner_bid_cents >= 0),
  add column if not exists finalized_at timestamptz;

update public.auctions
set raffle_slug = coalesce(raffle_slug, 'luxo-premiado')
where raffle_slug is null;

alter table public.auctions
  alter column raffle_slug set not null;

update public.auctions
set opening_bid_cents = greatest(opening_bid_cents, current_bid_cents, 0)
where opening_bid_cents < current_bid_cents;

update public.auction_bids
set bidder_name = nullif(trim(bidder_name), '')
where bidder_name is not null;

alter table public.auction_bids
  add column if not exists bidder_user_id uuid;

do $$
begin
  if exists (
    select 1
    from information_schema.table_constraints
    where table_schema = 'public'
      and table_name = 'auctions'
      and constraint_name = 'auctions_slug_key'
  ) then
    alter table public.auctions drop constraint auctions_slug_key;
  end if;
end $$;

do $$
begin
  if exists (
    select 1
    from information_schema.table_constraints
    where table_schema = 'public'
      and table_name = 'auctions'
      and constraint_name = 'auctions_status_check'
  ) then
    alter table public.auctions drop constraint auctions_status_check;
  end if;
end $$;

alter table public.auctions
  add constraint auctions_status_check check (status in ('scheduled', 'open', 'closed', 'settled'));

create unique index if not exists auctions_raffle_slug_slug_idx
  on public.auctions (raffle_slug, slug);

create index if not exists auctions_raffle_status_idx
  on public.auctions (raffle_slug, status, ends_at);

create index if not exists auction_bids_auction_amount_idx
  on public.auction_bids (auction_id, amount_cents desc, created_at desc);

create index if not exists auction_bids_auction_bidder_idx
  on public.auction_bids (auction_id, bidder_user_id, bidder_contact);

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
),
aggregated as (
  select
    b.auction_id,
    count(*)::integer as total_bids,
    count(distinct coalesce(b.bidder_user_id::text, b.bidder_contact, 'anon-' || b.id::text))::integer as unique_bidder_count,
    max(b.created_at) as last_bid_at
  from public.auction_bids b
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
  current_bid_cents = greatest(a.current_bid_cents, coalesce(leader.amount_cents, 0))
from aggregated agg
left join ranked_bids leader
  on leader.auction_id = agg.auction_id
 and leader.bid_rank = 1
where a.id = agg.auction_id;

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
    order by b.auction_id, b.amount_cents desc, b.created_at asc
  )
  update public.auctions a
  set
    status = case when tb.auction_id is null then 'closed' else 'settled' end,
    winner_user_id = tb.bidder_user_id,
    winner_name = tb.bidder_name,
    winner_contact = tb.bidder_contact,
    winner_bid_cents = tb.amount_cents,
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
  p_amount_cents integer
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

  if v_auction.status <> 'open' then
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
    amount_cents
  )
  values (
    v_auction.id,
    p_bidder_user_id,
    v_normalized_name,
    nullif(trim(p_bidder_contact), ''),
    p_amount_cents
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
