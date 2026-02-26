-- Ensure at least one active raffle exists for default landing slug.
-- This avoids production 404 on /r/luxo-premiado when environment is freshly provisioned.

begin;

do $$
declare
  v_raffle_id uuid;
  v_total_numbers int;
begin
  insert into public.raffles (
    slug,
    title,
    description,
    cover_image_url,
    price_cents,
    total_numbers,
    max_numbers_per_user,
    draw_date,
    draw_method,
    status
  )
  values (
    'luxo-premiado',
    'Jeep Compass Série S 0km',
    'Campanha oficial Luxo Premiado com compra de números e sorteio auditável.',
    '/images/prize/compass-main.svg',
    1990,
    10000,
    50,
    now() + interval '45 days',
    'loteria_federal',
    'active'
  )
  on conflict (slug) do nothing;

  select id, total_numbers
  into v_raffle_id, v_total_numbers
  from public.raffles
  where slug = 'luxo-premiado'
  limit 1;

  if v_raffle_id is null then
    raise exception 'Falha ao localizar ou criar rifa padrão luxo-premiado';
  end if;

  insert into public.raffle_numbers (raffle_id, number, status)
  select v_raffle_id, gs::bigint, 'available'
  from generate_series(0, greatest(v_total_numbers - 1, 0)) as gs
  on conflict (raffle_id, number) do nothing;

  insert into public.transparency (
    raffle_id,
    draw_method,
    rules,
    organizer_name,
    organizer_doc,
    contact
  )
  values (
    v_raffle_id,
    'Loteria Federal',
    'Participação válida após confirmação do pagamento e cumprimento dos termos da campanha.',
    'Luxo Premiado',
    '00.000.000/0001-00',
    'suporte@luxopremiado.com.br'
  )
  on conflict (raffle_id) do nothing;
end
$$;

select pg_notify('pgrst', 'reload schema');

commit;
