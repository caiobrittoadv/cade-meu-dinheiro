# 10 — PLANO DE EXECUÇÃO DA FASE 01
## Fundação Técnica do Projeto

**Projeto:** Cadê Meu Dinheiro?
**Documento:** 10 — Plano de Execução da Fase 01
**Versão:** 1.0
**Status:** Plano operacional de implementação
**Base:** Documentos 01–08 + HANDOFF MASTER + Documento 09 — Backlog Mestre de Implementação

---

# 1. FINALIDADE

Este documento transforma a primeira parte do Backlog Mestre em um plano operacional de execução.

Ele não redefine produto, UX, modelo de dados, regras financeiras ou arquitetura.

Sua finalidade é orientar a primeira etapa real de construção:

```text
ESPECIFICAÇÃO
↓
BACKLOG 09
↓
PLANO DE EXECUÇÃO 10
↓
IMPLEMENTAÇÃO
```

A Fase 01 deve produzir uma fundação técnica limpa, reproduzível e preparada para receber o domínio financeiro.

---

# 2. ESCOPO DA FASE 01

A Fase 01 compreende:

```text
F01 — Fundação do Projeto
F02 — Monorepo
F03 — Infraestrutura Local
F04 — Banco + Prisma
```

Ao final da fase, o projeto deverá possuir:

```text
Frontend
+
Backend
+
Packages compartilhados
+
PostgreSQL
+
Redis
+
Object Storage de desenvolvimento
+
Prisma
+
Migrations
+
Environment configuration
+
Health checks
+
Scripts de desenvolvimento
+
Build validado
```

A Fase 01 **não implementa ainda**:

- autenticação completa;
- Financial Space;
- contas;
- categorias;
- Transactions;
- Financial Engine;
- dashboard;
- cartões;
- faturas;
- OCR;
- IA;
- captura;
- Open Finance;
- funcionalidades pós-MVP.

---

# 3. BASE ARQUITETURAL OBRIGATÓRIA

A arquitetura oficial para o MVP é:

```text
Frontend:
Next.js + React + TypeScript

Backend:
NestJS + TypeScript

Database:
PostgreSQL

ORM:
Prisma

Queue/Cache:
Redis + BullMQ

Storage:
S3-compatible Object Storage

Architecture:
Modular Monolith

API:
REST /api/v1
```

A separação entre Financial Engine e Capture + AI deve permanecer preservada.

A arquitetura também determina que UI não acesse banco diretamente, IA não acesse banco diretamente e OCR/documento não criem Transaction diretamente.

---

# 4. OBJETIVO TÉCNICO

O objetivo não é apenas "instalar dependências".

O objetivo é conseguir executar, de maneira reproduzível:

```text
git clone
↓
configurar environment
↓
subir infraestrutura
↓
instalar dependências
↓
rodar migrations
↓
subir API
↓
subir Web
↓
executar health checks
↓
executar lint
↓
executar typecheck
↓
executar testes
↓
executar build
```

Sem depender de configurações ocultas na máquina do desenvolvedor.

---

# 5. REGRA DE PRÉ-EXECUÇÃO

Antes de criar, mover, apagar ou substituir qualquer arquivo, o agente deve:

1. inspecionar o diretório do projeto;
2. identificar se já existe código;
3. identificar o package manager utilizado;
4. identificar arquivos de configuração existentes;
5. identificar se existe Git;
6. identificar se existe Docker;
7. identificar se existe banco ou Prisma;
8. identificar scripts existentes;
9. identificar `.env` e `.env.example`;
10. identificar qualquer implementação anterior.

## Regra

**Não sobrescrever código existente sem primeiro compreender o estado atual.**

Se já existir uma aplicação parcialmente construída, a implementação deve adaptar-se ao estado real do projeto ou propor uma migração controlada.

---

# 6. ORDEM DA FASE

A execução deve seguir esta ordem:

```text
F01.01 — Inspeção do projeto
        ↓
F01.02 — Inicialização/versionamento
        ↓
F01.03 — Estrutura do monorepo
        ↓
F01.04 — Aplicação Web
        ↓
F01.05 — Aplicação API
        ↓
F01.06 — Packages compartilhados
        ↓
F01.07 — Configuração TypeScript
        ↓
F01.08 — Lint / Format / Typecheck
        ↓
F01.09 — Environment
        ↓
F01.10 — Scripts
        ↓
F02 GATE
        ↓
F01.11 — PostgreSQL
        ↓
F01.12 — Redis
        ↓
F01.13 — Object Storage
        ↓
F01.14 — Docker Compose
        ↓
F01.15 — Health Checks
        ↓
F03 GATE
        ↓
F01.16 — Prisma
        ↓
F01.17 — Schema inicial
        ↓
F01.18 — Migrations
        ↓
F01.19 — Seed técnico
        ↓
F01.20 — Validação do banco
        ↓
F04 GATE
        ↓
FASE 01 CONCLUÍDA
```

---

# 7. F01.01 — INSPEÇÃO DO PROJETO

**Prioridade:** P0
**Dependências:** nenhuma

## Objetivo

Determinar o estado real do workspace antes de qualquer alteração.

## O agente deve verificar

```text
- diretório atual;
- arquivos;
- pastas;
- package.json;
- lockfile;
- tsconfig;
- next.config;
- nest-cli;
- Docker;
- docker-compose;
- Prisma;
- .env;
- .env.example;
- Git;
- scripts;
- testes;
- README;
- dependências existentes.
```

## Saída obrigatória

O agente deve produzir internamente um diagnóstico:

```text
Estado encontrado:
- projeto novo / existente;
- stack encontrada;
- package manager;
- aplicações existentes;
- infraestrutura existente;
- riscos de sobrescrita;
- itens que podem ser preservados;
- itens que precisam ser criados.
```

## Critério de aceite

Nenhuma alteração estrutural é realizada antes da inspeção.

---

# 8. F01.02 — INICIALIZAÇÃO / VERSIONAMENTO

**Prioridade:** P0
**Dependência:** F01.01

## Tarefas

- Confirmar repositório Git.
- Verificar branch atual.
- Confirmar `.gitignore`.
- Garantir que secrets não sejam versionados.
- Garantir exclusão de `node_modules`.
- Garantir exclusão de artefatos de build.
- Garantir exclusão de `.env` real.

## Regra

Não criar nova história Git desnecessariamente se o projeto já possuir histórico.

---

# 9. F01.03 — ESTRUTURA DO MONOREPO

**Prioridade:** P0
**Dependência:** F01.02

## Estrutura-alvo

```text
cade-meu-dinheiro/
│
├── apps/
│   ├── web/
│   └── api/
│
├── packages/
│   ├── ui/
│   ├── types/
│   ├── validation/
│   ├── financial-domain/
│   └── config/
│
├── infrastructure/
│   ├── docker/
│   ├── database/
│   └── deployment/
│
├── docs/
│
├── package.json
├── tsconfig.json
├── ...
└── README.md
```

## Regras

- O frontend não deve importar código privado do backend.
- O backend não deve depender da camada de UI.
- Packages compartilhados devem conter somente código realmente compartilhável.
- Não criar abstrações prematuras sem uso.
- Não criar microserviços.

---

# 10. F01.04 — APLICAÇÃO WEB

**Prioridade:** P0
**Dependência:** F01.03

## Tecnologia

Next.js + React + TypeScript.

## Objetivo

Criar apenas a aplicação-base.

## Deve existir

- inicialização;
- entry point;
- layout mínimo;
- configuração TypeScript;
- build;
- execução local.

## Não implementar ainda

- dashboard;
- sidebar final;
- telas financeiras;
- autenticação;
- captura;
- componentes completos do Design System.

A UI completa será construída em etapa posterior.

---

# 11. F01.05 — APLICAÇÃO API

**Prioridade:** P0
**Dependência:** F01.03

## Tecnologia

NestJS + TypeScript.

## Estrutura inicial

A estrutura deve estar preparada para o Modular Monolith.

```text
apps/api/
└── src/
    ├── auth/
    ├── users/
    ├── spaces/
    ├── accounts/
    ├── transactions/
    ├── categories/
    ├── cards/
    ├── invoices/
    ├── installments/
    ├── recurrences/
    ├── goals/
    ├── documents/
    ├── processing/
    ├── extraction/
    ├── proposals/
    ├── duplicates/
    ├── ai/
    ├── notifications/
    ├── audit/
    ├── analytics/
    ├── projections/
    └── shared/
```

## Observação

A criação das pastas não significa implementar todos esses módulos nesta fase.

Elas representam a arquitetura de módulos definida para o backend.

---

# 12. F01.06 — PACKAGES COMPARTILHADOS

**Prioridade:** P0
**Dependência:** F01.03

## Packages

### `packages/ui`

Reservado para componentes compartilhados de interface.

Nesta fase:

- estrutura;
- configuração;
- exportação básica.

### `packages/types`

Reservado para tipos compartilhados.

### `packages/validation`

Reservado para schemas e validações compartilhadas quando necessário.

### `packages/financial-domain`

Reservado para conceitos/regras financeiras compartilháveis.

Nesta fase:

**não implementar o Financial Engine.**

### `packages/config`

Configurações compartilhadas que realmente precisem ser centralizadas.

---

# 13. F01.07 — TYPESCRIPT

**Prioridade:** P0
**Dependência:** F01.04–F01.06

## Tarefas

- Configuração base.
- Configuração web.
- Configuração API.
- Configuração packages.
- aliases quando justificados.
- strict mode.
- consistência de tipos.

## Critério

O workspace deve executar typecheck sem erros.

---

# 14. F01.08 — LINT / FORMAT / TYPECHECK

**Prioridade:** P0
**Dependência:** F01.07

## Tarefas

Configurar:

```text
lint
format
typecheck
```

Os comandos devem ser executáveis na raiz do projeto.

## Critério

```text
lint     → PASS
typecheck → PASS
```

O formatador deve estar definido de maneira consistente.

---

# 15. F01.09 — ENVIRONMENT

**Prioridade:** P0
**Dependência:** F01.07

## Arquivos

```text
.env.example
```

O `.env` real deve permanecer fora do versionamento.

## Variáveis previstas

```text
DATABASE_URL
REDIS_URL

STORAGE_*

AI_PROVIDER_*
OCR_PROVIDER_*

AUTH_*

APP_URL
```

## Regra

Nesta fase, as variáveis de IA/OCR podem permanecer apenas documentadas, caso seus serviços ainda não sejam utilizados.

Não criar integrações prematuras.

---

# 16. F01.10 — SCRIPTS

**Prioridade:** P0
**Dependência:** F01.08–F01.09

## Scripts mínimos esperados

```text
dev
build
lint
typecheck
test
```

E, quando aplicável:

```text
db:generate
db:migrate
db:seed
db:reset
```

Os nomes podem ser adaptados ao package manager/workspace adotado, desde que sejam documentados.

---

# 17. GATE F02 — FUNDAÇÃO VALIDADA

Antes de avançar para infraestrutura, confirmar:

```text
[ ] projeto inspecionado
[ ] Git validado
[ ] monorepo funcional
[ ] web inicia
[ ] API inicia
[ ] packages carregam
[ ] TypeScript passa
[ ] lint passa
[ ] environment documentado
[ ] scripts funcionam
[ ] nenhum secret versionado
```

Se qualquer item crítico falhar:

**não avançar.**

---

# 18. F01.11 — POSTGRESQL

**Prioridade:** P0
**Dependência:** Gate F02

## Objetivo

Disponibilizar PostgreSQL para desenvolvimento.

## Requisitos

- container ou serviço local reproduzível;
- database configurável;
- usuário configurável;
- senha via environment;
- porta configurável;
- health check.

## Regra

PostgreSQL será a fonte primária de verdade do sistema.

---

# 19. F01.12 — REDIS

**Prioridade:** P0
**Dependência:** Gate F02

## Objetivo

Disponibilizar Redis para:

- filas;
- cache;
- locks;
- rate limiting;
- processamento temporário.

## Regra

Redis nunca será tratado como fonte de verdade financeira.

---

# 20. F01.13 — OBJECT STORAGE

**Prioridade:** P0
**Dependência:** Gate F02

## Objetivo

Disponibilizar um storage compatível com S3 para desenvolvimento.

## Estrutura conceitual

```text
storage/
└── spaces/
    └── {space_id}/
        └── documents/
            └── {document_id}/
```

## Regra

Não usar caminhos públicos previsíveis.

Nesta fase, basta garantir conectividade e configuração do storage.

O fluxo completo de Document será implementado posteriormente.

---

# 21. F01.14 — DOCKER COMPOSE

**Prioridade:** P0
**Dependência:** F01.11–F01.13

## Objetivo

Permitir iniciar infraestrutura local de forma reproduzível.

## Serviços

```text
postgres
redis
object-storage
```

## Requisitos

- volumes persistentes de desenvolvimento;
- networks;
- environment;
- health checks;
- nomes previsíveis;
- documentação.

## Comportamento esperado

```text
docker compose up -d
```

deve iniciar os serviços necessários.

---

# 22. F01.15 — HEALTH CHECKS

**Prioridade:** P0
**Dependência:** F01.14

## Objetivo

Confirmar que API e infraestrutura conseguem detectar disponibilidade dos serviços.

## Health checks

No mínimo:

```text
API
PostgreSQL
Redis
Storage
```

## Regra

Health check não deve expor secrets ou informações sensíveis.

---

# 23. GATE F03 — INFRAESTRUTURA VALIDADA

Confirmar:

```text
[ ] PostgreSQL sobe
[ ] Redis sobe
[ ] Object Storage sobe
[ ] Docker Compose reproduz ambiente
[ ] volumes funcionam
[ ] API consegue verificar PostgreSQL
[ ] API consegue verificar Redis
[ ] API consegue verificar Storage
[ ] environment funciona
[ ] health checks funcionam
```

Somente depois avançar para Prisma.

---

# 24. F01.16 — PRISMA

**Prioridade:** P0
**Dependência:** Gate F03

## Objetivo

Integrar Prisma ao PostgreSQL.

## Tarefas

- instalar/configurar Prisma;
- definir conexão;
- criar diretório Prisma;
- configurar schema;
- configurar migrations;
- configurar comandos.

---

# 25. F01.17 — SCHEMA INICIAL

**Prioridade:** P0
**Dependência:** F01.16

## Entidades estruturais iniciais

O schema deve ser preparado conforme Documento 05.

Primeiro núcleo:

```text
User
User Profile
Financial Space
Space Member
Account
Category
Transaction
```

Estruturas relacionadas podem ser preparadas conforme o desenho consolidado:

```text
Card
Invoice
Installment
Recurrence
Goal
Document
Document Processing
Extraction
Financial Proposal
Proposal Item
Duplicate Candidate
Conversation
Message
AI Classification
User Learning
Notification
Audit Log
Goal Contribution
```

## Regra crítica

Não criar regras financeiras apenas porque uma tabela existe.

O Documento 05 define estrutura; o Documento 06 define comportamento financeiro.

---

# 26. F01.18 — MIGRATIONS

**Prioridade:** P0
**Dependência:** F01.17

## Tarefas

- criar migration inicial;
- executar migration em banco vazio;
- testar migration novamente;
- verificar constraints;
- verificar índices;
- verificar foreign keys.

## Critério

Um banco novo deve ser criado exclusivamente a partir das migrations versionadas.

---

# 27. F01.19 — SEED TÉCNICO

**Prioridade:** P1
**Dependência:** F01.18

## Objetivo

Criar apenas dados técnicos necessários ao desenvolvimento.

Possíveis dados:

- categorias padrão, se a estrutura já estiver definida para isso;
- dados mínimos de desenvolvimento.

## Regra

Não utilizar seed para mascarar ausência de implementação.

Não criar dados financeiros falsos como substituição do domínio real.

---

# 28. F01.20 — VALIDAÇÃO DO BANCO

**Prioridade:** P0
**Dependência:** F01.18–F01.19

## Validar

```text
migration up
migration down/reset em ambiente de desenvolvimento
schema generation
seed
conexão API → Prisma → PostgreSQL
```

## Critérios

- Prisma conecta.
- Migrations funcionam.
- Schema é consistente.
- API consegue executar operação técnica simples.
- Banco pode ser recriado.

---

# 29. GATE F04 — BANCO VALIDADO

Antes de considerar a Fase 01 concluída:

```text
[ ] Prisma configurado
[ ] schema criado
[ ] migration criada
[ ] migration executada
[ ] banco recriado com sucesso
[ ] seed técnico funciona
[ ] API conecta ao banco
[ ] constraints verificadas
[ ] foreign keys verificadas
[ ] índices iniciais verificados
[ ] nenhum segredo no Git
```

---

# 30. CRITÉRIOS GLOBAIS DE ACEITE DA FASE 01

A Fase 01 somente estará concluída quando for possível executar, partindo de um ambiente limpo:

```text
1. instalar dependências
2. configurar environment
3. subir infraestrutura
4. executar migrations
5. iniciar API
6. iniciar Web
7. executar lint
8. executar typecheck
9. executar testes
10. executar build
```

Todos os passos devem estar documentados.

---

# 31. ESTRUTURA FINAL ESPERADA

Ao final da Fase 01, a estrutura deverá estar próxima de:

```text
cade-meu-dinheiro/
│
├── apps/
│   ├── web/
│   │   ├── src/
│   │   ├── public/
│   │   └── ...
│   │
│   └── api/
│       ├── src/
│       │   ├── auth/
│       │   ├── users/
│       │   ├── spaces/
│       │   ├── accounts/
│       │   ├── transactions/
│       │   ├── categories/
│       │   ├── cards/
│       │   ├── invoices/
│       │   ├── installments/
│       │   ├── recurrences/
│       │   ├── goals/
│       │   ├── documents/
│       │   ├── processing/
│       │   ├── extraction/
│       │   ├── proposals/
│       │   ├── duplicates/
│       │   ├── ai/
│       │   ├── notifications/
│       │   ├── audit/
│       │   ├── analytics/
│       │   ├── projections/
│       │   └── shared/
│       └── ...
│
├── packages/
│   ├── ui/
│   ├── types/
│   ├── validation/
│   ├── financial-domain/
│   └── config/
│
├── infrastructure/
│   ├── docker/
│   ├── database/
│   └── deployment/
│
├── docs/
│
├── .env.example
├── .gitignore
├── package.json
├── tsconfig.json
└── README.md
```

A estrutura exata de arquivos de configuração pode variar conforme o tooling escolhido, desde que preserve a arquitetura.

---

# 32. NÃO IMPLEMENTAR NESTA FASE

É expressamente proibido antecipar:

```text
Dashboard
Chatbot
IA Financeira
OCR
Capture Engine
Open Finance
Microserviços
Notificações completas
Analytics
Metas completas
Cartões completos
Faturas completas
Design System completo
```

O objetivo é fundação.

---

# 33. DECISÕES QUE O AGENTE NÃO PODE TOMAR SOZINHO

O agente não deve alterar sem revisão:

- stack;
- arquitetura;
- PostgreSQL;
- Prisma;
- Redis/BullMQ;
- S3-compatible storage;
- Modular Monolith;
- separação Financial/Capture/AI;
- REST `/api/v1`;
- estrutura conceitual do banco;
- fluxo de confirmação;
- regras financeiras;
- princípio de isolamento por Financial Space.

Se uma decisão técnica nova for necessária e não estiver definida:

```text
identificar
↓
explicar
↓
propor
↓
aguardar decisão
```

Não transformar uma decisão não especificada em arquitetura permanente silenciosamente.

---

# 34. TESTES DA FASE 01

## Testes de infraestrutura

```text
PostgreSQL disponível
Redis disponível
Storage disponível
```

## Testes de aplicação

```text
Web inicia
API inicia
Health endpoint responde
```

## Testes de qualidade

```text
lint
typecheck
unit tests
build
```

## Testes de banco

```text
migration
connection
schema generation
seed
```

---

# 35. DEFINITION OF DONE — FASE 01

A fase será considerada `DONE` somente quando:

### Código

- [ ] código versionado;
- [ ] estrutura do monorepo funcional;
- [ ] Web funcional em nível de fundação;
- [ ] API funcional em nível de fundação;
- [ ] packages compartilhados configurados.

### Infraestrutura

- [ ] PostgreSQL funcional;
- [ ] Redis funcional;
- [ ] Object Storage funcional;
- [ ] Docker Compose funcional.

### Banco

- [ ] Prisma funcional;
- [ ] schema inicial criado;
- [ ] migrations funcionais;
- [ ] seed técnico funcional;
- [ ] banco recriável.

### Qualidade

- [ ] lint passa;
- [ ] typecheck passa;
- [ ] testes aplicáveis passam;
- [ ] build passa.

### Segurança

- [ ] secrets não versionados;
- [ ] `.env.example` documentado;
- [ ] health checks não expõem secrets;
- [ ] storage de desenvolvimento não cria arquitetura pública insegura.

### Documentação

- [ ] README atualizado;
- [ ] setup local documentado;
- [ ] comandos documentados;
- [ ] variáveis de ambiente documentadas.

---

# 36. GATE DE SAÍDA

A Fase 01 pode ser encerrada somente quando:

```text
┌──────────────────────────────────────────────┐
│          FASE 01 — FUNDAÇÃO                  │
├──────────────────────────────────────────────┤
│                                              │
│  MONOREPO                    ✓               │
│  WEB                         ✓               │
│  API                         ✓               │
│  PACKAGES                    ✓               │
│  POSTGRESQL                  ✓               │
│  REDIS                       ✓               │
│  OBJECT STORAGE              ✓               │
│  DOCKER                      ✓               │
│  PRISMA                      ✓               │
│  MIGRATIONS                  ✓               │
│  ENVIRONMENT                 ✓               │
│  HEALTH CHECKS               ✓               │
│  LINT                        ✓               │
│  TYPECHECK                   ✓               │
│  TESTS                       ✓               │
│  BUILD                       ✓               │
│                                              │
└──────────────────────────────────────────────┘
```

Resultado:

```text
FUNDAÇÃO PRONTA
        ↓
FASE 02
        ↓
AUTENTICAÇÃO
        ↓
FINANCIAL SPACE
        ↓
CONTAS
        ↓
CATEGORIAS
        ↓
TRANSACTIONS
        ↓
FINANCIAL ENGINE
```

---

# 37. PROMPT-MESTRE PARA O AGENTE DE DESENVOLVIMENTO

O prompt abaixo é a instrução operacional para executar a Fase 01.

```text
Você está implementando a Fase 01 — Fundação Técnica do projeto
"Cadê Meu Dinheiro?".

Antes de modificar qualquer arquivo, inspecione completamente o
workspace atual.

Não presuma que o projeto está vazio.

Verifique:
- estrutura atual;
- package manager;
- package.json;
- lockfiles;
- Git;
- TypeScript;
- Next.js;
- NestJS;
- Docker;
- PostgreSQL;
- Redis;
- Prisma;
- environment;
- scripts;
- testes;
- documentação;
- qualquer implementação existente.

Não sobrescreva código existente sem compreender sua finalidade.

OBJETIVO DA FASE

Construir uma fundação técnica reproduzível para o MVP.

STACK OFICIAL

Frontend:
Next.js + React + TypeScript

Backend:
NestJS + TypeScript

Database:
PostgreSQL

ORM:
Prisma

Queue/Cache:
Redis + BullMQ

Storage:
S3-compatible Object Storage

Architecture:
Modular Monolith

API:
REST /api/v1

Não substitua essa arquitetura.

ESTRUTURA

Preparar:

apps/web
apps/api

packages/ui
packages/types
packages/validation
packages/financial-domain
packages/config

infrastructure/docker
infrastructure/database
infrastructure/deployment

docs

BACKEND

Preparar a estrutura modular:

auth
users
spaces
accounts
transactions
categories
cards
invoices
installments
recurrences
goals
documents
processing
extraction
proposals
duplicates
ai
notifications
audit
analytics
projections
shared

Não implementar todos esses módulos agora.
Apenas preparar a arquitetura quando isso for necessário.

INFRAESTRUTURA

Configurar ambiente local reproduzível com:

PostgreSQL
Redis
S3-compatible Object Storage

Docker Compose deve permitir iniciar os serviços.

POSTGRESQL

É a fonte primária de verdade.

REDIS

Pode ser usado para:
- filas;
- cache;
- locks;
- rate limiting;
- processamento temporário.

Nunca trate Redis como fonte de verdade financeira.

STORAGE

Preparar storage compatível com S3.

Não utilizar caminhos públicos previsíveis.

PRISMA

Configurar Prisma e PostgreSQL.

Criar schema inicial compatível com a especificação do
Documento 05.

Não invente regras financeiras.

O Documento 05 define estrutura.
O Documento 06 define regras financeiras.

Nesta fase, prepare a estrutura necessária sem implementar o
Financial Engine.

ENVIRONMENT

Criar .env.example.

Nunca versionar secrets.

Considerar:

DATABASE_URL
REDIS_URL
STORAGE_*
AI_PROVIDER_*
OCR_PROVIDER_*
AUTH_*
APP_URL

As variáveis de IA/OCR podem permanecer apenas documentadas se
a integração ainda não fizer parte desta fase.

QUALIDADE

Configurar:

lint
format
typecheck
test
build

Os comandos devem funcionar a partir da raiz do projeto.

HEALTH CHECKS

Preparar health checks para:

API
PostgreSQL
Redis
Storage

Não expor secrets.

REGRAS ARQUITETURAIS

Não criar microserviços.

Não conectar:
UI → Database
UI → IA
IA → Database
OCR → Transaction
Document → Transaction

O fluxo arquitetural deve permanecer:

UI
↓
API
↓
Domain Service
↓
Financial/Capture Engine
↓
Repository
↓
Database

Nesta fase, os Engines ainda não precisam ser implementados.

SEGURANÇA

Não versionar:
.env
secrets
credentials
tokens
chaves privadas

Atualizar .gitignore.

DOCUMENTAÇÃO

Atualizar README com:

- pré-requisitos;
- instalação;
- configuração de environment;
- inicialização da infraestrutura;
- migrations;
- seed;
- desenvolvimento;
- testes;
- build.

PROCESSO DE EXECUÇÃO

Execute em etapas.

Depois de cada etapa relevante:

1. verifique os arquivos criados;
2. execute os testes aplicáveis;
3. corrija erros;
4. só então avance.

Não marque a tarefa como concluída apenas porque os arquivos
foram criados.

DEFINITION OF DONE

A Fase 01 somente está concluída quando:

- monorepo funciona;
- web inicia;
- API inicia;
- PostgreSQL funciona;
- Redis funciona;
- Object Storage funciona;
- Docker Compose funciona;
- Prisma funciona;
- migrations funcionam;
- banco pode ser recriado;
- environment está documentado;
- health checks funcionam;
- lint passa;
- typecheck passa;
- testes passam;
- build passa;
- README está atualizado;
- nenhum secret está versionado.

Ao final, apresente:

1. resumo do que foi implementado;
2. estrutura final relevante;
3. comandos executados;
4. resultado de cada teste;
5. problemas encontrados;
6. decisões técnicas tomadas;
7. pontos que exigem minha aprovação;
8. confirmação explícita do Definition of Done.

Não avance para autenticação, Financial Space, contas,
Transactions, Financial Engine, dashboard, OCR ou IA.

A Fase 01 termina na fundação técnica.
```

---

# 38. CRITÉRIO PARA O PRÓXIMO PROMPT

O próximo prompt de implementação somente deve ser criado depois que o agente concluir esta fase e apresentar:

```text
Fase 01
✓ implementada
✓ testada
✓ documentada
✓ build validado
```

Se houver erro:

```text
Fase 01
↓
BLOCKED
↓
correção
↓
testes
↓
revalidação
```

Não avançar artificialmente.

---

# 39. PRÓXIMO DOCUMENTO

Depois da conclusão e validação desta fase, o próximo artefato será:

# 11 — PLANO DE EXECUÇÃO DA FASE 02
## Autenticação + Financial Space

Ele deverá detalhar:

```text
User
↓
Profile
↓
Authentication
↓
Session
↓
Authorization
↓
Financial Space
↓
Space Member
↓
Isolamento por Space
```

Somente após esse núcleo estar validado avançaremos para:

```text
Accounts
↓
Categories
↓
Transactions
↓
Financial Engine
```

---

# 40. REGRA FINAL

Esta fase deve ser executada com uma mentalidade simples:

> **Primeiro construir uma fundação que possamos confiar. Depois colocar o produto sobre ela.**

O objetivo da Fase 01 não é impressionar visualmente.

É garantir que, quando o domínio financeiro começar a ser implementado, exista uma infraestrutura estável, reproduzível e coerente com a arquitetura oficial do Cadê Meu Dinheiro?.
