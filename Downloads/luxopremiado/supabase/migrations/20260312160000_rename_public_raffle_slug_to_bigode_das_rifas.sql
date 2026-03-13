do $$
declare
  v_old_id uuid;
  v_new_id uuid;
begin
  select id
  into v_old_id
  from public.raffles
  where slug = 'luxo-premiado'
  limit 1;

  if v_old_id is null then
    return;
  end if;

  select id
  into v_new_id
  from public.raffles
  where slug = 'bigode-das-rifas'
  limit 1;

  if v_new_id is not null and v_new_id <> v_old_id then
    raise exception 'Já existe uma rifa com slug bigode-das-rifas. Resolva o conflito antes de continuar.';
  end if;

  update public.prize_configurations
  set raffle_slug = 'bigode-das-rifas'
  where raffle_slug = 'luxo-premiado';

  update public.auctions
  set raffle_slug = 'bigode-das-rifas'
  where raffle_slug = 'luxo-premiado';

  update public.raffles
  set slug = 'bigode-das-rifas'
  where id = v_old_id;
end $$;
