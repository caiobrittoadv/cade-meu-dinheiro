# Cadê Meu Dinheiro?

Organização financeira pessoal com captura inteligente de documentos (foto, PDF, comprovante, fatura) — o usuário não deveria precisar alimentar manualmente sua vida financeira.

Este repositório está na **Fase 02 — Autenticação e Financial Space**. A fundação técnica (Fase 01) está concluída; agora existem cadastro/login/sessão e o isolamento por Financial Space. Contas, categorias, transactions, Financial Engine, dashboard, cartões, faturas, OCR, IA e Capture Engine ainda não foram implementados.

## Stack

| Camada | Tecnologia |
|---|---|
| Frontend | Next.js + React + TypeScript |
| Backend | NestJS + TypeScript |
| Banco | PostgreSQL |
| ORM | Prisma |
| Fila/Cache | Redis (+ BullMQ, a partir da Fase 02) |
| Storage | Object Storage S3-compatible (MinIO em desenvolvimento) |
| Arquitetura | Modular Monolith |
| Monorepo | npm workspaces + Turborepo |

## Estrutura

```text
cade-meu-dinheiro/
├── apps/
│   ├── web/            # Next.js (App Router)
│   └── api/             # NestJS (Modular Monolith)
├── packages/
│   ├── ui/               # Design System compartilhado (reservado)
│   ├── types/            # Tipos TypeScript compartilhados (reservado)
│   ├── validation/        # Schemas/validações compartilhadas (reservado)
│   ├── financial-domain/  # Conceitos do Motor Financeiro (reservado)
│   └── config/            # Configurações compartilhadas (reservado)
├── infrastructure/
│   ├── docker/            # docker-compose.yml (Postgres, Redis, MinIO)
│   ├── database/
│   └── deployment/
└── docs/
```

## Pré-requisitos

- Node.js >= 20 (o npm já vem incluso)
- Docker + Docker Compose (para PostgreSQL, Redis e Object Storage local)

## Instalação

```bash
npm install
```

## Configuração de environment

```bash
cp .env.example .env
```

Preencha `DATABASE_URL`, `REDIS_URL`, `STORAGE_*` e `AUTH_JWT_SECRET`. As variáveis `AI_PROVIDER_*` e `OCR_PROVIDER_*` podem permanecer vazias nesta fase — a integração de IA/OCR não faz parte da Fase 01.

## Infraestrutura local

```bash
npm run infra:up      # sobe PostgreSQL, Redis e MinIO (Object Storage)
npm run infra:logs    # acompanha os logs
npm run infra:down    # derruba os serviços
```

## Banco de dados (Prisma)

```bash
npm run db:generate   # gera o Prisma Client
npm run db:migrate    # cria/aplica migrations em desenvolvimento
npm run db:seed       # roda o seed técnico (apenas valida a conexão nesta fase)
npm run db:reset      # reseta o banco (destrutivo, apenas dev)
```

O schema inicial (`apps/api/prisma/schema.prisma`) cobre o núcleo estrutural do Documento 05 (User, FinancialSpace, Account, Category, Transaction, CreditCard, Invoice, Installment, Recurrence, Goal, Document → Processing → Extraction → Proposal, IA, Notificações e Auditoria). Nenhuma regra financeira (saldo, competência, parcelamento) é implementada nesta fase — isso pertence ao Motor Financeiro (Documento 06).

## Desenvolvimento

```bash
npm run dev        # sobe web (http://localhost:3000) e api (http://localhost:3001) em paralelo
```

Health check da API: `GET http://localhost:3001/api/v1/health`.

> A API exige PostgreSQL acessível para subir (o `PrismaService` conecta no boot). Suba a infraestrutura antes de rodar `npm run dev`.

## Autenticação e Financial Space (Fase 02)

Todas as rotas usam o prefixo `/api/v1`.

| Rota | Método | Autenticação | Descrição |
|---|---|---|---|
| `/auth/register` | POST | — | Cria o usuário, hasheia a senha (bcryptjs) e já cria um Financial Space pessoal (`type: PERSONAL`) com o usuário como `OWNER`. |
| `/auth/login` | POST | — | Autentica e retorna `{ user, accessToken, refreshToken }`. |
| `/auth/refresh` | POST | — | Rotaciona o refresh token (revoga o antigo, emite um novo par). |
| `/auth/logout` | POST | — | Revoga o refresh token informado. |
| `/auth/forgot-password` | POST | — | Gera um token de reset. Sem provedor de e-mail configurado, o link é apenas **logado no console** do servidor nesta fase. Resposta idêntica exista ou não o e-mail (evita enumeração de contas). |
| `/auth/reset-password` | POST | — | Troca a senha e revoga todas as sessões ativas do usuário. |
| `/auth/me` | GET | Bearer | Retorna o usuário autenticado — usada para validar proteção de rota. |
| `/spaces` | POST | Bearer | Cria um Financial Space adicional (owner = usuário autenticado). |
| `/spaces` | GET | Bearer | Lista os Financial Spaces dos quais o usuário é membro. |
| `/spaces/:spaceId` | GET | Bearer + `SpaceMembershipGuard` | Só retorna dados se o usuário for membro ativo daquele espaço — é o mecanismo de isolamento que todo recurso financeiro futuro (`/spaces/:spaceId/accounts`, `/transactions`, etc.) deve reutilizar. |

Sessão: JWT de acesso (`AUTH_JWT_EXPIRES_IN`, padrão 15m) + refresh token opaco armazenado com hash SHA-256 no banco (`AUTH_REFRESH_TOKEN_EXPIRES_IN`, padrão 30d), revogável — por isso um logout ou reset de senha realmente invalida a sessão antes da expiração do token.

## Qualidade

```bash
npm run lint
npm run typecheck
npm test               # testes unitários (não precisam de banco)
npm run test:e2e --workspace=@cade-meu-dinheiro/api   # precisam de Postgres via infra:up + db:migrate
npm run build
```

## Regras arquiteturais

- UI nunca acessa o banco diretamente.
- IA nunca acessa o banco diretamente.
- OCR/Documento nunca cria `Transaction` diretamente — o fluxo é sempre `Documento → Processamento → Extração → Proposta → Confirmação → Motor Financeiro → Transaction`.
- Redis nunca é fonte de verdade financeira; PostgreSQL é a única fonte primária.
- Nenhum secret é versionado — apenas `.env.example`.
- Nenhuma operação financeira pode acessar dados de outro Financial Space — todo recurso `:spaceId`-scoped deve usar `SpaceMembershipGuard`.
- Senha nunca é armazenada em texto puro (bcryptjs, 12 rounds).

## Roadmap

Fase 01 (Fundação) → **Fase 02 — esta (Autenticação + Financial Space)** → Fase 03 (Contas + Categorias + Transactions + Financial Engine) → ... conforme o Backlog Mestre (Documento 09).
