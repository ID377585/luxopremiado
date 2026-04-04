# Bigode das Rifas

Plataforma de rifas online com pagamento via PIX, sistema VIP, leilões e painel administrativo completo. Construída com Next.js, Supabase e Vercel.

**Site ao vivo:** [www.bigodedasrifas.com](https://www.bigodedasrifas.com)

---

## Visão geral

O Bigode das Rifas é uma plataforma onde participantes escolhem números, pagam via PIX e acompanham campanhas de rifa com total transparência. O sistema suporta múltiplas modalidades de campanha — rifas, sorteios, leilões e bônus promocionais — com controle de acesso por nível VIP, painel do usuário e área administrativa.

---

## Stack tecnológica

| Camada | Tecnologia |
|---|---|
| Frontend / Backend | Next.js 15 (App Router, Server Actions, Turbopack) |
| Banco de dados | Supabase (PostgreSQL 17) |
| Autenticação | Supabase Auth |
| Deploy | Vercel |
| Runtime | Node.js 24.x |
| Domínio | www.bigodedasrifas.com |

---

## Funcionalidades

### Participante
- Cadastro e login com e-mail e senha
- Escolha de pacotes de números com desconto por volume
- Pagamento via PIX com confirmação automática
- Painel pessoal com histórico de pedidos e números reservados
- Acompanhamento em tempo real do progresso da campanha

### Sistema VIP
- Níveis `none`, `vip` e `elite` por usuário
- Carteira VIP com saldos de cashback, bônus, rakeback e free spins
- Pontuação XP acumulada por pedidos
- Ledger de auditoria de todas as movimentações VIP
- Solicitações de saque com aprovação administrativa
- Operações VIP: host, eventos, torneios e odds
- Configurações globais do programa VIP via painel admin

### Campanhas e rifas
- Múltiplas rifas com slug único, status (`draft`, `active`, `closed`, `drawn`) e método de sorteio
- Configuração de prêmios com imagens, data de sorteio e número da sorte
- Reserva atômica de números via função `reserve_raffle_numbers()`
- Expiração automática de reservas via pg_cron (a cada minuto)
- Galeria de imagens por rifa

### Leilões
- Leilões com lances em tempo real via `place_auction_bid()`
- Extensão automática de tempo por lance de última hora
- Sincronização de estado via `sync_auction_state()`
- Histórico completo de lances

### Transparência e prova social
- Seção pública com regras, organizador e critérios de apuração por rifa
- Depoimentos de vencedores e prints de contemplados
- FAQ por campanha

### Administração
- Gerenciamento de rifas, prêmios e pacotes
- Configuração de leilões com galeria e detalhes
- Painel de operações VIP e saques
- Views de auditoria e monitoramento (`raffle_audit_summary`, `raffle_operations_dashboard`)

---

## Estrutura do banco de dados

O banco roda no Supabase (região `sa-east-1`, São Paulo) com Row Level Security ativo em todas as 18 tabelas públicas.

### Tabelas principais

```
profiles              — perfis de usuário (vinculado ao auth.users)
raffles               — campanhas de rifa
raffle_numbers        — 10.000+ números por campanha
raffle_images         — galeria de imagens por rifa
orders                — pedidos de compra
order_items           — itens de cada pedido (números reservados)
payments              — pagamentos PIX (Mercado Pago / Asaas / Pagar.me)
prize_configurations  — configuração de prêmios por campanha
social_proof          — depoimentos, prints e vencedores
faq                   — perguntas frequentes por campanha
transparency          — dados públicos de transparência por rifa
auctions              — leilões com estado e vencedor
auction_bids          — histórico de lances
```

### Tabelas VIP

```
vip_wallets             — carteira por usuário (cashback, bônus, rakeback, XP)
vip_ledger_entries      — ledger de auditoria de movimentações VIP
vip_program_settings    — configurações globais do programa VIP
vip_withdrawal_requests — solicitações de saque
vip_operations          — operações VIP (host, eventos, torneios, odds)
```

### Functions e automações

| Function | Descrição |
|---|---|
| `handle_new_user()` | Trigger: cria `profile` + `vip_wallet` ao registrar usuário |
| `reserve_raffle_numbers()` | Reserva atômica de números evitando conflito de concorrência |
| `expire_reservations()` | Libera reservas expiradas (chamada via pg_cron a cada minuto) |
| `place_auction_bid()` | Registra lance e sincroniza estado do leilão |
| `sync_auction_state()` | Atualiza estado e vencedor do leilão |
| `audit_raffle_integrity()` | Auditoria de integridade de números e pedidos |
| `repair_raffle_integrity()` | Corrige inconsistências detectadas pela auditoria |
| `refresh_raffle_monitoring_views()` | Atualiza as materialized views de monitoramento |

---

## Estrutura de rotas (Next.js App Router)

```
/                        — Home com acesso rápido
/r/[slug]                — Página da campanha (prêmios, pacotes, transparência)
/rifas                   — Listagem de rifas ativas
/login                   — Login / área do participante
/cadastro                — Cadastro de novo usuário
/recuperar-senha         — Recuperação de senha
/app                     — Painel do usuário (protegido)
/app/vip/experiencias    — Página de benefícios VIP
/sobre                   — Sobre a plataforma
/contato                 — Contato
/privacidade             — Política de privacidade
/termos                  — Termos de uso
```

---

## Variáveis de ambiente

Crie um arquivo `.env.local` na raiz do projeto com as seguintes variáveis:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://<project-ref>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon-key>
SUPABASE_SERVICE_ROLE_KEY=<service-role-key>

# Gateway de pagamento (Mercado Pago ou Asaas)
PAYMENT_PROVIDER_KEY=<chave-da-api-do-provedor>
PAYMENT_WEBHOOK_SECRET=<secret-para-validar-webhook>

# URL pública da aplicação
NEXT_PUBLIC_APP_URL=https://www.bigodedasrifas.com
```

> **Atenção:** nunca exponha `SUPABASE_SERVICE_ROLE_KEY` ou `PAYMENT_PROVIDER_KEY` em variáveis prefixadas com `NEXT_PUBLIC_`. Essas chaves devem ser usadas apenas em Server Actions e rotas de API.

---

## Como rodar localmente

```bash
# 1. Clonar o repositório
git clone https://github.com/ID377585/luxopremiado.git
cd luxopremiado

# 2. Instalar dependências
npm install

# 3. Configurar variáveis de ambiente
cp .env.example .env.local
# edite .env.local com suas chaves

# 4. Rodar em desenvolvimento
npm run dev
```

O servidor estará disponível em `http://localhost:3000`.

---

## Deploy

O projeto é implantado automaticamente na Vercel a cada push para a branch `main`. Branches de feature (`feat/*`, `fix/*`) geram previews automáticos.

```bash
# Deploy manual via CLI Vercel
vercel --prod
```

> Configure `"regions": ["gru1"]` no `vercel.json` para reduzir a latência entre a aplicação (Vercel) e o banco (Supabase São Paulo).

---

## Segurança

- Row Level Security (RLS) ativo em todas as 18 tabelas
- Políticas separadas por operação (SELECT, INSERT, UPDATE, DELETE)
- Verificação de role `admin` via subquery `(select auth.uid())` para evitar reavaliação por linha
- Trigger `on_auth_user_created` com `SECURITY DEFINER` para criação segura de perfis
- Webhook de pagamento validado via `PAYMENT_WEBHOOK_SECRET`

---

## Branches e convenções

| Branch | Propósito |
|---|---|
| `main` | Produção (www.bigodedasrifas.com) |
| `feat/*` | Novas funcionalidades |
| `fix/*` | Correções de bugs |

Commits seguem o padrão [Conventional Commits](https://www.conventionalcommits.org/):

```
feat(vip): adiciona página de experiências VIP
fix(admin): corrige tipagem na resposta do endpoint de configuração
refactor(checkout): melhora UX e validação do formulário de pacotes
```

---

## Licença

Projeto privado. Todos os direitos reservados © Bigode das Rifas.
