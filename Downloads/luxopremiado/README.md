# Luxo Premiado (`luxopremiado.com.br`)

Plataforma de rifas premium com:

- Landing completa: Hero -> Prêmio -> Como Funciona -> Área do Usuário -> Escolher Números -> Pagamento -> Transparência -> Prova Social -> FAQ -> Rodapé
- Auth com Supabase: login, cadastro, recuperar senha e reset de senha
- Área do usuário: `/app`, `/app/minhas-rifas`, `/app/perfil`, `/app/pagamentos`
- Área admin: `/admin`, `/admin/rifas`, `/admin/provas`, `/admin/transparencia`
- Fluxo backend: reserva transacional de números + criação de pagamento + webhook idempotente
- SQL completo: schema + RLS + RPCs para Supabase Postgres

## Stack

- Next.js (App Router)
- TypeScript
- CSS/HTML (CSS Modules + estilos globais)
- Supabase (Postgres + Auth + RLS)

## Rodar local

1. Instale dependências:

```bash
npm install
```

2. Configure variáveis de ambiente:

```bash
cp .env.example .env.local
```

3. Preencha no `.env.local`:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `NEXT_PUBLIC_SITE_URL`
- `WEBHOOK_SECRET` (opcional)
- `CRON_SECRET` (opcional)

4. Rode o projeto:

```bash
npm run dev
```

## Banco (Supabase)

### Migration

Execute no SQL Editor do Supabase:

- `supabase/migrations/20260223152000_init_luxo_premiado.sql`

### Seed opcional

- `supabase/seed.sql`

Depois de criar a rifa, gere os números:

```sql
select public.generate_raffle_numbers('<RAFFLE_ID>');
```

## Rotas principais

- Landing: `/r/[slug]`
- Login: `/login`
- Cadastro: `/cadastro`
- Recuperar senha: `/recuperar-senha`
- Reset senha: `/reset-senha`
- Área do usuário: `/app/*`
- Admin: `/admin/*`

## APIs

- `POST /api/raffles/[slug]/reserve`
- `POST /api/payments/create`
- `POST /api/webhooks/[provider]`
- `POST /api/cron/expire-reservations`

## Fluxo crítico

1. Reserva números via RPC `reserve_raffle_numbers`.
2. Cria pedido `pending` com `expires_at`.
3. Inicia pagamento no provider.
4. Webhook confirma e chama RPC `mark_order_paid`.
5. Job periódico chama `expire_reservations` para liberar reservas vencidas.

## Observações

- Sem variáveis de Supabase configuradas, o frontend funciona em modo demo com dados fallback.
- Em produção, mantenha `SUPABASE_SERVICE_ROLE_KEY` apenas no backend.
