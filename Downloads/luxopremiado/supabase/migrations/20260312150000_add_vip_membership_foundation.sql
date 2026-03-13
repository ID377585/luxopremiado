alter table public.profiles
  add column if not exists vip_tier text not null default 'none'
    check (vip_tier in ('none', 'vip', 'elite')),
  add column if not exists vip_points integer not null default 0
    check (vip_points >= 0),
  add column if not exists vip_manual_override boolean not null default false,
  add column if not exists vip_unlocked_at timestamptz,
  add column if not exists vip_notes text;

comment on column public.profiles.vip_tier is 'Nível VIP manual do usuário. none = sem acesso';
comment on column public.profiles.vip_points is 'Pontuação VIP persistida para auditoria e ajustes futuros';
comment on column public.profiles.vip_manual_override is 'Quando true, o nível VIP do perfil prevalece sobre a regra automática';
comment on column public.profiles.vip_unlocked_at is 'Data de liberação do acesso VIP';
comment on column public.profiles.vip_notes is 'Observações internas sobre upgrade VIP';
