# Cadê Meu Dinheiro?

Organização financeira pessoal com captura inteligente de documentos (foto, PDF, comprovante, fatura) — o usuário não deveria precisar alimentar manualmente sua vida financeira.

Este repositório está na **Fase 01 — Fundação Técnica**. Dashboard, autenticação completa, OCR, IA e demais funcionalidades de produto ainda não foram implementados: o objetivo desta fase é apenas uma base técnica reproduzível (monorepo, apps, infraestrutura local, banco e schema inicial).

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

## Qualidade

```bash
npm run lint
npm run typecheck
npm test
npm run build
```

## Regras arquiteturais desta fase

- UI nunca acessa o banco diretamente.
- IA nunca acessa o banco diretamente.
- OCR/Documento nunca cria `Transaction` diretamente — o fluxo é sempre `Documento → Processamento → Extração → Proposta → Confirmação → Motor Financeiro → Transaction`.
- Redis nunca é fonte de verdade financeira; PostgreSQL é a única fonte primária.
- Nenhum secret é versionado — apenas `.env.example`.

## Roadmap

Fase 01 (esta) → Fase 02 (Autenticação + Financial Space + Contas + Categorias + Transactions + Motor Financeiro) → ... conforme o Backlog Mestre (Documento 09).
