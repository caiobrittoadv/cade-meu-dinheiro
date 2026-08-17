# 08 --- Arquitetura Técnica e Plano de Desenvolvimento

## Cadê Meu Dinheiro?

**Versão:** 1.0\
**Status:** Arquitetura técnica de referência\
**Projeto:** Cadê Meu Dinheiro?\
**Base:** Documentos 01--07

------------------------------------------------------------------------

# 1. Objetivo

Este documento transforma toda a especificação funcional, financeira e
de inteligência do Cadê Meu Dinheiro? em uma arquitetura técnica
implementável.

Ele define:

-   arquitetura geral;
-   stack recomendada;
-   frontend;
-   backend;
-   banco de dados;
-   storage;
-   filas;
-   workers;
-   processamento de documentos;
-   IA;
-   autenticação;
-   autorização;
-   segurança;
-   APIs;
-   observabilidade;
-   ambientes;
-   deploy;
-   CI/CD;
-   custos;
-   estrutura do projeto;
-   módulos;
-   ordem de desenvolvimento;
-   critérios de conclusão;
-   roadmap do MVP e pós-MVP.

A arquitetura deve preservar os princípios estabelecidos nos documentos
anteriores.

------------------------------------------------------------------------

# 2. Princípio Arquitetural Central

O sistema deve ser construído em torno de quatro núcleos:

``` text
┌───────────────────────────────────────┐
│              FRONTEND                 │
│       Web + Mobile / Responsive       │
└───────────────────┬───────────────────┘
                    │
                    ▼
┌───────────────────────────────────────┐
│               API                     │
│        Autenticação + Domínio         │
└───────┬───────────────┬───────────────┘
        │               │
        ▼               ▼
┌───────────────┐ ┌─────────────────────┐
│ FINANCIAL     │ │ CAPTURE + AI        │
│ ENGINE        │ │                     │
└───────┬───────┘ └──────────┬──────────┘
        │                    │
        └──────────┬─────────┘
                   ▼
          ┌──────────────────┐
          │ DATABASE/STORAGE │
          └──────────────────┘
```

A separação entre **Motor Financeiro** e **Motor de Captura + IA** é
obrigatória.

------------------------------------------------------------------------

# 3. Stack Recomendada

A arquitetura recomendada para o MVP é:

## Frontend Web

**Next.js + React + TypeScript**

## Mobile

Inicialmente:

**PWA / Web responsivo**

Posteriormente:

**React Native / Expo**, caso a experiência de câmera, compartilhamento
e notificações justifique um aplicativo nativo.

## Backend

**TypeScript + NestJS**

## Banco

**PostgreSQL**

## ORM

**Prisma**

## Cache / filas

**Redis**

## Object Storage

Storage compatível com **S3**

## Jobs

**BullMQ + Redis**

## OCR / Document AI

Camada abstrata de provedores, permitindo trocar o fornecedor sem
alterar o domínio.

## LLM

Camada abstrata de IA, também desacoplada do provedor.

## Observabilidade

**OpenTelemetry + serviço de logs/erros**

## Deploy

Containers em infraestrutura gerenciada.

------------------------------------------------------------------------

# 4. Por que TypeScript no Backend

O mesmo ecossistema pode ser utilizado no frontend e backend.

Benefícios:

-   tipagem compartilhada;
-   contratos consistentes;
-   menor troca de contexto;
-   validação de schemas;
-   facilidade de contratação;
-   grande ecossistema;
-   integração natural com APIs de IA.

------------------------------------------------------------------------

# 5. Por que PostgreSQL

O domínio possui relações fortes:

-   usuário;
-   espaço financeiro;
-   contas;
-   cartões;
-   faturas;
-   transações;
-   parcelas;
-   categorias;
-   documentos;
-   propostas.

Isso favorece banco relacional.

PostgreSQL oferece:

-   transações ACID;
-   constraints;
-   índices;
-   JSONB;
-   queries analíticas;
-   excelente maturidade;
-   escalabilidade suficiente para o produto.

------------------------------------------------------------------------

# 6. Por que não começar com NoSQL

O núcleo financeiro exige consistência relacional.

Não há benefício suficiente no MVP para transformar:

``` text
Transaction
Invoice
Installment
Account
Transfer
```

em estruturas independentes sem relações fortes.

PostgreSQL deve ser a fonte de verdade.

------------------------------------------------------------------------

# 7. Arquitetura de Aplicação

Recomenda-se um **modular monolith** no início.

Não começar com dezenas de microserviços.

``` text
                    APPLICATION
                         │
        ┌────────────────┼────────────────┐
        ▼                ▼                ▼
   AUTH MODULE      FINANCE MODULE    CAPTURE MODULE
        │                │                │
        └────────────────┼────────────────┘
                         ▼
                  DATABASE / STORAGE
```

Esse modelo permite velocidade sem abandonar separação de domínio.

------------------------------------------------------------------------

# 8. Por que Modular Monolith

Microserviços prematuros aumentariam:

-   complexidade;
-   deploys;
-   observabilidade;
-   custos;
-   comunicação;
-   debugging;
-   consistência transacional.

O produto ainda precisa validar:

> **As pessoas realmente usam a captura automática para controlar o
> dinheiro?**

Primeiro validar o produto.

Depois extrair serviços que realmente precisarem escalar separadamente.

------------------------------------------------------------------------

# 9. Módulos do Backend

Estrutura inicial:

``` text
src/
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

------------------------------------------------------------------------

# 10. Financial Domain

O módulo financeiro deve conter:

``` text
accounts
transactions
transfers
cards
invoices
installments
recurrences
goals
categories
projections
analytics
```

Ele é o núcleo do produto.

------------------------------------------------------------------------

# 11. Capture Domain

O módulo de captura deve conter:

``` text
documents
processing
ocr
extraction
normalization
classification
proposals
duplicates
```

Ele nunca deve ignorar o Financial Engine.

------------------------------------------------------------------------

# 12. AI Domain

O módulo de IA deve conter:

``` text
capture-ai
financial-ai
tools
prompts
model-routing
guardrails
ai-usage
```

------------------------------------------------------------------------

# 13. Camadas Internas

Cada módulo deve seguir aproximadamente:

``` text
Controller
    ↓
Application Service
    ↓
Domain Service
    ↓
Repository
    ↓
Database
```

Exemplo:

``` text
POST /proposals/:id/confirm
        ↓
ProposalController
        ↓
ConfirmProposalService
        ↓
FinancialEngine
        ↓
TransactionRepository
        ↓
PostgreSQL
```

------------------------------------------------------------------------

# 14. Frontend

O frontend deve ser organizado por domínio, não apenas por tipo de
arquivo.

Exemplo:

``` text
app/
├── dashboard/
├── transactions/
├── accounts/
├── cards/
├── invoices/
├── goals/
├── analysis/
├── ai/
├── capture/
└── settings/
```

Componentes compartilhados:

``` text
components/
├── ui/
├── financial/
├── capture/
├── charts/
└── navigation/
```

------------------------------------------------------------------------

# 15. Design System

O frontend deve implementar o Design System definido no Brandbook e utilizar exclusivamente os **Design Tokens oficiais do Cadê Meu Dinheiro?**.

As cores abaixo constituem a identidade visual oficial do produto e devem ser centralizadas em tokens reutilizáveis. O frontend não deve espalhar códigos HEX diretamente nos componentes.

## 15.1. Paleta Oficial

| Token | Nome | HEX | Uso principal |
|---|---|---|---|
| `color.primary` | Roxo C.M.D. | `#6C3BFF` | Cor primária, CTAs, ações e elementos de destaque |
| `color.primaryDark` | Purple Dark | `#4B22B8` | Estados escuros, contraste e variações da primária |
| `color.primarySoft` | Purple Soft | `#EDE7FF` | Fundos suaves, badges e destaques secundários |
| `color.dark.background` | Obsidian | `#0D0D12` | Fundo principal do Dark Mode |
| `color.dark.surface` | Graphite | `#17171F` | Cards, painéis e superfícies do Dark Mode |
| `color.light.background` | Off White | `#F7F7FA` | Fundo principal do Light Mode |
| `color.light.surface` | White | `#FFFFFF` | Cards, modais e superfícies do Light Mode |
| `color.text.primary` | Ink | `#17171F` | Texto principal no Light Mode |
| `color.text.secondary` | Slate | `#6F7180` | Texto secundário, descrições e metadados |

## 15.2. Light Mode

```text
Background:       #F7F7FA  — Off White
Surface:          #FFFFFF  — White
Primary:          #6C3BFF  — Roxo C.M.D.
Primary Dark:     #4B22B8  — Purple Dark
Primary Soft:     #EDE7FF  — Purple Soft
Text Primary:     #17171F  — Ink
Text Secondary:   #6F7180  — Slate
```

## 15.3. Dark Mode

```text
Background:       #0D0D12  — Obsidian
Surface:          #17171F  — Graphite
Primary:          #6C3BFF  — Roxo C.M.D.
Primary Dark:     #4B22B8  — Purple Dark
Primary Soft:     #EDE7FF  — Purple Soft
Text Primary:     #FFFFFF  — White
Text Secondary:   #6F7180  — Slate
```

## 15.4. Regras de Implementação

Os tokens devem ser definidos em uma camada central do Design System.

Exemplo conceitual:

```text
tokens/
├── colors
├── typography
├── spacing
├── radius
├── shadows
└── breakpoints
```

Componentes devem consumir:

```text
color.primary
color.light.background
color.dark.background
color.text.primary
```

e não:

```text
#6C3BFF
#0D0D12
#FFFFFF
```

diretamente dentro de cada componente.

Isso permite alterar a identidade visual no futuro sem reescrever a interface.

## 15.5. Princípio Visual

A identidade deve trabalhar com o contraste entre:

```text
ROXO
+
ESCURO
+
SUPERFÍCIES NEUTRAS
```

O roxo é a cor de ação e identidade. Preto, grafite, off-white e branco funcionam como base estrutural.

A identidade não deve reproduzir literalmente a identidade visual de outra instituição financeira. A referência conceitual é a categoria de produtos financeiros digitais, mas a paleta oficial do Cadê Meu Dinheiro? é a definida acima.

Light Mode e Dark Mode devem utilizar os mesmos tokens sem duplicar lógica.

------------------------------------------------------------------------

# 16. API

Recomendação:

**REST API**

com contratos tipados.

Exemplo:

``` text
/api/v1/auth
/api/v1/users
/api/v1/spaces
/api/v1/accounts
/api/v1/transactions
/api/v1/cards
/api/v1/invoices
/api/v1/documents
/api/v1/proposals
/api/v1/goals
/api/v1/analytics
/api/v1/ai
```

------------------------------------------------------------------------

# 17. Versionamento da API

Sempre utilizar versão:

``` text
/api/v1/
```

Isso permite evolução futura sem quebrar clientes existentes.

------------------------------------------------------------------------

# 18. Contratos

Os contratos de entrada e saída devem ser validados.

Exemplo:

``` text
Frontend
   ↓
DTO
   ↓
Schema Validation
   ↓
Application Service
```

Nenhuma informação deve chegar ao domínio sem validação.

------------------------------------------------------------------------

# 19. Autenticação

Recomendação:

-   e-mail + senha;
-   sessão segura;
-   recuperação de senha;
-   verificação de e-mail;
-   opção futura de login social.

Tokens/sessões devem ser armazenados de maneira segura.

------------------------------------------------------------------------

# 20. Autorização

Toda requisição deve validar:

``` text
usuário
↓
membership
↓
financial_space
↓
permissão
↓
recurso
```

Nunca confiar apenas no ID enviado pelo frontend.

------------------------------------------------------------------------

# 21. Multi-Tenancy

O isolamento deve ocorrer pelo:

``` text
financial_space_id
```

Toda entidade financeira deve possuir vínculo com o espaço, diretamente
ou por relação segura.

------------------------------------------------------------------------

# 22. Banco de Dados

Banco principal:

``` text
PostgreSQL
```

Responsável por:

-   usuários;
-   espaços;
-   contas;
-   transações;
-   cartões;
-   faturas;
-   documentos metadata;
-   propostas;
-   categorias;
-   metas;
-   auditoria;
-   configurações.

------------------------------------------------------------------------

# 23. Redis

Redis deve ser utilizado para:

-   filas;
-   jobs;
-   locks;
-   cache;
-   rate limiting;
-   processamento temporário.

Redis não deve ser a fonte primária dos dados financeiros.

------------------------------------------------------------------------

# 24. Object Storage

Documentos devem ser armazenados em object storage.

Exemplo conceitual:

``` text
storage/
└── spaces/
    └── {space_id}/
        └── documents/
            └── {document_id}/
```

Nunca usar caminhos públicos previsíveis.

------------------------------------------------------------------------

# 25. Upload Seguro

Fluxo recomendado:

``` text
Frontend
   ↓
Request upload
   ↓
Backend autoriza
   ↓
Upload temporário/assinado
   ↓
Storage
   ↓
Document criado
   ↓
Job de processamento
```

------------------------------------------------------------------------

# 26. Processamento Assíncrono

Documentos não devem bloquear a requisição HTTP.

``` text
POST /documents
       ↓
document criado
       ↓
job
       ↓
202 Accepted
```

Depois:

``` text
worker
↓
processamento
↓
proposal
```

------------------------------------------------------------------------

# 27. Filas

Filas recomendadas:

``` text
document-classification
ocr-processing
document-extraction
merchant-normalization
category-classification
duplicate-detection
invoice-processing
notifications
analytics
```

------------------------------------------------------------------------

# 28. Workers

Workers são responsáveis por:

-   consumir jobs;
-   executar processamento;
-   atualizar status;
-   registrar erros;
-   repetir quando apropriado.

------------------------------------------------------------------------

# 29. Idempotência dos Workers

Cada job deve possuir uma chave idempotente.

Exemplo:

``` text
document_id + processing_id
```

Se o worker for executado duas vezes:

``` text
não duplicar resultado
```

------------------------------------------------------------------------

# 30. OCR Provider Abstraction

Não acoplar o domínio a um fornecedor.

Interface conceitual:

``` ts
interface OcrProvider {
  extract(input: OcrInput): Promise<OcrResult>
}
```

Implementações:

``` text
ProviderA
ProviderB
ProviderLocal
```

Isso permite substituição futura.

------------------------------------------------------------------------

# 31. AI Provider Abstraction

Mesmo princípio:

``` ts
interface AiProvider {
  generate(input: AiInput): Promise<AiResult>
}
```

O domínio não deve depender diretamente de uma API específica.

------------------------------------------------------------------------

# 32. Model Router

Um componente deve decidir qual modelo utilizar.

``` text
Task
 ↓
Complexity
 ↓
Cost Policy
 ↓
Model
```

Exemplo:

``` text
Classificação simples
→ modelo econômico

Documento complexo
→ modelo multimodal avançado
```

------------------------------------------------------------------------

# 33. Prompt Registry

Prompts importantes devem ser versionados.

Exemplo:

``` text
capture-document-v1
expense-category-v2
invoice-extraction-v1
financial-assistant-v1
```

Não deixar prompts críticos espalhados pelo código.

------------------------------------------------------------------------

# 34. Structured Output

Modelos devem retornar estruturas validadas.

Fluxo:

``` text
LLM
 ↓
JSON
 ↓
Schema Validation
 ↓
Normalized Object
```

Se inválido:

``` text
retry
ou
REVIEW_REQUIRED
```

------------------------------------------------------------------------

# 35. Financial Engine

O Financial Engine deve ser independente da IA.

Responsabilidades:

-   saldo;
-   transações;
-   transferências;
-   cartões;
-   faturas;
-   parcelas;
-   recorrências;
-   projeções;
-   metas;
-   fechamento;
-   indicadores.

------------------------------------------------------------------------

# 36. Capture Engine

Responsabilidades:

-   receber documento;
-   processar;
-   extrair;
-   normalizar;
-   classificar;
-   detectar duplicidade;
-   criar proposal.

Não cria transaction diretamente.

------------------------------------------------------------------------

# 37. Proposal Service

Responsabilidades:

-   criar proposta;
-   atualizar proposta;
-   revisar;
-   confirmar;
-   rejeitar;
-   vincular origem.

Ao confirmar:

``` text
Proposal
↓
Financial Engine
↓
Transaction
```

------------------------------------------------------------------------

# 38. AI Financial Tools

As ferramentas devem chamar serviços internos.

Exemplo:

``` text
get_current_balance
     ↓
AccountService

get_period_summary
     ↓
AnalyticsService

get_card_commitment
     ↓
CardService
```

------------------------------------------------------------------------

# 39. Nunca Permitir SQL pela IA

Arquitetura:

``` text
LLM
↓
Tool
↓
Service
↓
Repository
↓
DB
```

Nunca:

``` text
LLM
↓
SQL
↓
DB
```

------------------------------------------------------------------------

# 40. Segurança da IA

Guardrails:

-   não inventar valores;
-   usar tools para números;
-   confirmar ações;
-   respeitar espaço;
-   não expor dados de outros usuários;
-   não executar SQL;
-   não criar transferência sem autorização;
-   não apagar silenciosamente.

------------------------------------------------------------------------

# 41. Observabilidade

O sistema deve observar:

-   erros;
-   latência;
-   jobs;
-   OCR;
-   IA;
-   banco;
-   filas;
-   uploads;
-   APIs.

------------------------------------------------------------------------

# 42. Logs

Logs estruturados.

Exemplo:

``` json
{
  "event": "proposal_confirmed",
  "space_id": "...",
  "proposal_id": "...",
  "transaction_id": "...",
  "timestamp": "..."
}
```

Nunca registrar:

-   senha;
-   tokens;
-   documentos completos;
-   dados financeiros desnecessários;
-   conteúdo integral de prompts com PII.

------------------------------------------------------------------------

# 43. Error Tracking

Erros de aplicação devem ser centralizados.

Exemplo de categorias:

``` text
AUTH_ERROR
DATABASE_ERROR
OCR_ERROR
AI_ERROR
VALIDATION_ERROR
UPLOAD_ERROR
FINANCIAL_RULE_ERROR
```

------------------------------------------------------------------------

# 44. Métricas Técnicas

Monitorar:

``` text
API latency
API error rate
job success rate
job latency
OCR success rate
AI success rate
duplicate rate
proposal confirmation rate
database latency
queue depth
storage usage
AI cost
```

------------------------------------------------------------------------

# 45. Tracing

Operações complexas devem possuir trace.

Exemplo:

``` text
upload
 ↓
document
 ↓
job
 ↓
OCR
 ↓
AI
 ↓
proposal
```

Isso permite identificar onde o processo ficou lento.

------------------------------------------------------------------------

# 46. Segurança de Dados

Obrigatório:

-   HTTPS;
-   criptografia em repouso;
-   secrets fora do código;
-   acesso mínimo;
-   backups;
-   rotação de credenciais;
-   controle de sessão;
-   rate limiting.

------------------------------------------------------------------------

# 47. LGPD

O sistema deve ser desenhado considerando:

-   finalidade;
-   necessidade;
-   transparência;
-   segurança;
-   direitos do titular;
-   eliminação;
-   portabilidade quando aplicável;
-   controle de acesso;
-   registro de tratamento.

A implementação jurídica definitiva deve ser validada com política de
privacidade e documentação própria.

------------------------------------------------------------------------

# 48. Retenção de Documentos

Deve existir política configurável para:

-   documentos originais;
-   OCR;
-   extrações;
-   logs;
-   conversas.

O produto não deve manter arquivos indefinidamente sem necessidade.

------------------------------------------------------------------------

# 49. Exclusão da Conta

Ao solicitar exclusão:

``` text
usuário
↓
confirmação
↓
política de retenção
↓
anonimização/exclusão
↓
storage cleanup
```

Deve ser possível rastrear a conclusão do processo sem manter dados
desnecessários.

------------------------------------------------------------------------

# 50. Backup

Banco:

-   backups automáticos;
-   retenção;
-   testes de restauração.

Storage:

-   versionamento quando útil;
-   redundância;
-   política de retenção.

Backup sem teste de restauração não deve ser considerado suficiente.

------------------------------------------------------------------------

# 51. Disaster Recovery

Definir:

``` text
RPO
RTO
```

para o estágio de produção.

A prioridade é:

1.  banco financeiro;
2.  documentos;
3.  configurações;
4.  demais dados.

------------------------------------------------------------------------

# 52. Ambientes

Mínimo:

``` text
development
staging
production
```

Não testar mudanças experimentais diretamente em produção.

------------------------------------------------------------------------

# 53. Variáveis de Ambiente

Separar:

``` text
DATABASE_URL
REDIS_URL
STORAGE_*
AI_PROVIDER_*
OCR_PROVIDER_*
AUTH_*
APP_URL
```

Nunca versionar secrets.

------------------------------------------------------------------------

# 54. CI/CD

Pipeline:

``` text
git push
   ↓
lint
   ↓
typecheck
   ↓
unit tests
   ↓
integration tests
   ↓
build
   ↓
security checks
   ↓
deploy staging
   ↓
smoke tests
   ↓
production
```

------------------------------------------------------------------------

# 55. Branch Strategy

Estratégia simples:

``` text
main
develop
feature/*
fix/*
```

Ou trunk-based development quando a equipe estiver madura.

O importante é evitar complexidade desnecessária.

------------------------------------------------------------------------

# 56. Testes

Pirâmide:

``` text
        E2E
       /      Integration
     /          Unit Tests
```

Prioridade de testes:

1.  Motor Financeiro;
2.  Captura;
3.  propostas;
4.  autenticação;
5.  API;
6.  UI crítica.

------------------------------------------------------------------------

# 57. Testes do Motor Financeiro

Obrigatórios:

-   saldo;
-   receita;
-   despesa;
-   transferência;
-   cartão;
-   fatura;
-   pagamento;
-   parcela;
-   recorrência;
-   estorno;
-   projeção;
-   fechamento.

------------------------------------------------------------------------

# 58. Testes da Captura

Obrigatórios:

-   nota;
-   PIX;
-   fatura;
-   extrato;
-   PDF;
-   imagem ruim;
-   duplicidade;
-   baixa confiança;
-   reprocessamento.

------------------------------------------------------------------------

# 59. Testes de Segurança

Testar:

-   acesso cruzado;
-   autorização;
-   upload;
-   sessão;
-   rate limiting;
-   exposição de dados;
-   IA;
-   ferramentas.

------------------------------------------------------------------------

# 60. Estrutura do Repositório

Recomendação de monorepo:

``` text
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
└── package.json
```

------------------------------------------------------------------------

# 61. Shared Types

Tipos compartilhados podem incluir:

``` text
Transaction
Category
Account
Card
Invoice
Proposal
Document
Goal
```

Mas o frontend não deve receber entidades internas indiscriminadamente.

Preferir DTOs específicos.

------------------------------------------------------------------------

# 62. Database Migrations

Toda alteração de banco deve ser versionada.

``` text
migration_001
migration_002
migration_003
```

Nunca editar produção manualmente como prática normal.

------------------------------------------------------------------------

# 63. Seed

O projeto deve possuir seed para:

-   categorias padrão;
-   instituições;
-   dados de desenvolvimento;
-   usuário de teste.

Não usar dados reais no ambiente de desenvolvimento.

------------------------------------------------------------------------

# 64. Feature Flags

Funcionalidades de risco podem ser controladas por flags.

Exemplos:

``` text
AI_AUTO_CATEGORY
AI_AUTO_CONFIRM
NEW_DASHBOARD
OPEN_FINANCE
SMART_DUPLICATE
```

Isso permite ativar progressivamente.

------------------------------------------------------------------------

# 65. Arquitetura de Deploy

Conceitualmente:

``` text
                    INTERNET
                       │
                       ▼
                CDN / EDGE
                       │
                       ▼
                WEB FRONTEND
                       │
                       ▼
                  API / LB
                       │
             ┌─────────┴─────────┐
             ▼                   ▼
          API APP              WORKERS
             │                   │
             └─────────┬─────────┘
                       ▼
                 PostgreSQL
                       │
             ┌─────────┴─────────┐
             ▼                   ▼
           Redis              Object Storage
```

------------------------------------------------------------------------

# 66. Escalabilidade

Começar pequeno.

Quando necessário:

``` text
API
→ horizontal scaling

Workers
→ horizontal scaling

PostgreSQL
→ vertical / read replicas

Storage
→ escala própria

Redis
→ escala conforme necessidade
```

------------------------------------------------------------------------

# 67. O que não fazer inicialmente

Evitar:

-   Kubernetes;
-   dezenas de microserviços;
-   event sourcing completo;
-   CQRS completo;
-   banco distribuído;
-   modelo de IA próprio;
-   infraestrutura excessivamente complexa.

O produto precisa de velocidade e confiabilidade.

------------------------------------------------------------------------

# 68. Arquitetura Event-Driven

O sistema pode utilizar eventos internos sem ser totalmente orientado a
eventos.

Exemplos:

``` text
DocumentProcessed
ProposalCreated
ProposalConfirmed
InvoiceImported
TransactionCreated
GoalUpdated
```

Eventos podem alimentar:

-   notificações;
-   analytics;
-   auditoria;
-   jobs.

------------------------------------------------------------------------

# 69. Outbox Pattern

Quando eventos precisarem de confiabilidade, utilizar Outbox.

Exemplo:

``` text
BEGIN
 transaction
 outbox_event
COMMIT
```

Depois:

``` text
Outbox Worker
↓
fila/event bus
```

Isso evita perder eventos após commit.

------------------------------------------------------------------------

# 70. Cache Strategy

Cachear somente informações reconstruíveis.

Exemplos:

-   resumo mensal;
-   categorias;
-   dashboards;
-   consultas frequentes.

Nunca usar cache como única fonte de saldo.

------------------------------------------------------------------------

# 71. Rate Limiting

Aplicar limites principalmente em:

-   login;
-   recuperação de senha;
-   upload;
-   processamento de IA;
-   endpoints públicos;
-   criação de jobs.

------------------------------------------------------------------------

# 72. Limite de IA

Cada usuário/espaço pode possuir:

-   limite diário;
-   limite mensal;
-   limite de documentos;
-   limite de páginas.

Isso protege contra abuso e custos inesperados.

------------------------------------------------------------------------

# 73. Controle de Custos

Registrar por operação:

``` text
provider
model
tokens/input
tokens/output
document
processing
estimated_cost
```

Isso permite conhecer:

> quanto custa processar um usuário ativo.

------------------------------------------------------------------------

# 74. Economia de IA

Princípios:

``` text
Parser antes de LLM
OCR adequado
Model routing
Cache
Batch
Não reprocessar
Prompts curtos
Structured outputs
```

------------------------------------------------------------------------

# 75. SLOs Iniciais

Metas iniciais podem ser:

``` text
API p95 < 500ms
operações simples
```

Para processamento assíncrono:

``` text
documento comum
→ conclusão em poucos segundos quando possível
```

Os valores definitivos devem ser calibrados com infraestrutura real.

------------------------------------------------------------------------

# 76. Disponibilidade

O núcleo financeiro deve receber prioridade de disponibilidade.

Mesmo que a IA esteja indisponível:

``` text
usuário ainda consegue
consultar
editar
criar lançamentos
```

A IA não pode ser ponto único de falha do aplicativo.

------------------------------------------------------------------------

# 77. Degradação Elegante

Se OCR estiver indisponível:

> Permitir lançamento manual.

Se IA financeira estiver indisponível:

> Dashboard continua funcionando.

Se notificações falharem:

> Dados continuam salvos.

------------------------------------------------------------------------

# 78. Ordem de Implementação

## Fase 1 --- Fundação

-   monorepo;
-   frontend;
-   backend;
-   PostgreSQL;
-   autenticação;
-   Financial Space;
-   CI/CD.

## Fase 2 --- Núcleo Financeiro

-   contas;
-   categorias;
-   transactions;
-   transferências;
-   dashboard;
-   saldo.

## Fase 3 --- Cartões

-   cartões;
-   faturas;
-   parcelas;
-   pagamento.

## Fase 4 --- Captura

-   upload;
-   storage;
-   OCR;
-   documentos;
-   proposals;
-   confirmação.

## Fase 5 --- Inteligência

-   categorização;
-   duplicidade;
-   faturas inteligentes;
-   PIX;
-   aprendizado.

## Fase 6 --- IA Financeira

-   tools;
-   chat;
-   análises;
-   explicações.

## Fase 7 --- Refinamento

-   notificações;
-   metas;
-   projeções;
-   performance;
-   segurança;
-   observabilidade.

------------------------------------------------------------------------

# 79. MVP Real

O MVP deve responder a uma pergunta:

> **O usuário consegue parar de cadastrar manualmente suas despesas e
> ainda assim entender para onde o dinheiro está indo?**

Para isso, o MVP precisa de:

``` text
Conta
+
Receita
+
Despesa
+
Dashboard
+
Foto
+
OCR
+
Proposta
+
Confirmação
+
Fatura
+
Categoria
+
Análise
```

Não precisa começar com tudo.

------------------------------------------------------------------------

# 80. MVP --- Fluxo Principal

``` text
Usuário recebe salário
        ↓
Registra/identifica receita
        ↓
Recebe comprovante/nota
        ↓
Fotografa
        ↓
IA lê
        ↓
Sistema sugere
        ↓
Usuário confirma
        ↓
Transaction
        ↓
Dashboard
        ↓
“Para onde foi?”
```

Esse é o coração do produto.

------------------------------------------------------------------------

# 81. MVP --- Fatura

``` text
Usuário recebe fatura
        ↓
Upload PDF
        ↓
Sistema lê
        ↓
Extrai lançamentos
        ↓
Classifica
        ↓
Detecta exceções
        ↓
Usuário revisa
        ↓
Confirma
        ↓
Dashboard
```

------------------------------------------------------------------------

# 82. Pós-MVP --- Open Finance

Somente depois da validação do comportamento principal.

Fluxo:

``` text
Conexão bancária
↓
Sync
↓
Transactions
↓
Matching
↓
Conciliação
```

Open Finance pode reduzir ainda mais o trabalho manual, mas aumenta
significativamente a complexidade de segurança, integração e suporte.

------------------------------------------------------------------------

# 83. Pós-MVP --- Automação

Depois que houver confiança:

``` text
Merchant conhecido
+
regra do usuário
+
alta confiança
+
sem duplicidade
↓
auto-confirm
```

------------------------------------------------------------------------

# 84. Pós-MVP --- Aplicativo Nativo

A decisão de construir React Native/Expo deve ser baseada em:

-   uso da câmera;
-   compartilhamento de comprovantes;
-   notificações;
-   experiência offline;
-   frequência mobile.

Não criar aplicativo nativo apenas por percepção de mercado.

------------------------------------------------------------------------

# 85. Pós-MVP --- Open Finance

Depois:

-   contas conectadas;
-   sincronização automática;
-   conciliação;
-   categorização automática;
-   saldo real;
-   alertas.

------------------------------------------------------------------------

# 86. Pós-MVP --- Inteligência Avançada

Possibilidades:

-   previsão de gastos;
-   detecção de anomalias;
-   recomendação contextual;
-   orçamento adaptativo;
-   metas inteligentes;
-   agente financeiro;
-   automações.

------------------------------------------------------------------------

# 87. Roadmap

``` text
ETAPA 1
Fundação técnica
        ↓
ETAPA 2
Núcleo financeiro
        ↓
ETAPA 3
UX principal
        ↓
ETAPA 4
Captura inteligente
        ↓
ETAPA 5
Fatura + PIX
        ↓
ETAPA 6
IA financeira
        ↓
ETAPA 7
Validação com usuários
        ↓
ETAPA 8
Open Finance
        ↓
ETAPA 9
Automação avançada
```

------------------------------------------------------------------------

# 88. Critérios para Considerar o MVP Pronto

O MVP só deve ser considerado pronto quando:

-   usuário consegue criar conta;
-   consegue cadastrar conta;
-   consegue registrar receita;
-   consegue registrar despesa;
-   consegue consultar saldo;
-   consegue fotografar documento;
-   documento é processado;
-   sistema cria proposta;
-   usuário confirma;
-   lançamento aparece no dashboard;
-   fatura pode ser importada;
-   lançamentos da fatura podem ser revisados;
-   duplicidades são tratadas;
-   categorias funcionam;
-   fechamento mensal funciona;
-   dados ficam isolados por usuário;
-   operações financeiras críticas possuem testes.

------------------------------------------------------------------------

# 89. Critérios de Qualidade

O produto não deve ser liberado somente porque:

> "funciona no meu computador."

Deve possuir:

-   testes;
-   logs;
-   backup;
-   segurança;
-   recuperação;
-   validação de dados;
-   tratamento de erros;
-   observabilidade.

------------------------------------------------------------------------

# 90. Definition of Done --- Feature

Uma funcionalidade só está concluída quando:

``` text
Código
+
Teste
+
Validação
+
UI
+
Tratamento de erro
+
Autorização
+
Logs
+
Documentação
```

------------------------------------------------------------------------

# 91. Definition of Done --- Financeiro

Uma regra financeira só está concluída quando:

``` text
regra definida
+
teste unitário
+
teste de integração
+
cenário de borda
+
reconstruibilidade
+
auditoria
```

------------------------------------------------------------------------

# 92. Definition of Done --- IA

Uma função de IA só está concluída quando:

``` text
prompt
+
schema
+
validação
+
fallback
+
teste
+
métrica
+
controle de custo
+
guardrail
```

------------------------------------------------------------------------

# 93. Riscos Técnicos Principais

## Risco 1 --- OCR ruim

Mitigação:

-   múltiplos provedores;
-   revisão humana;
-   score;
-   reprocessamento.

## Risco 2 --- IA inventar dados

Mitigação:

-   tools;
-   structured output;
-   validação;
-   guardrails.

## Risco 3 --- duplicidade

Mitigação:

-   matching;
-   checksum;
-   external reference;
-   confirmação.

## Risco 4 --- dupla contagem de cartão

Mitigação:

-   Financial Engine;
-   testes específicos.

## Risco 5 --- vazamento de dados

Mitigação:

-   isolamento por space;
-   autorização;
-   storage privado;
-   criptografia.

------------------------------------------------------------------------

# 94. Risco de Complexidade

O maior risco do projeto não é técnico isoladamente.

É construir funcionalidades demais antes de validar a proposta:

> **"Você não precisa ficar alimentando manualmente sua vida
> financeira."**

A arquitetura deve permitir começar pequeno.

------------------------------------------------------------------------

# 95. Decisão Estratégica

A arquitetura não deve ser construída para suportar milhões de usuários
desde o primeiro dia.

Deve ser construída para:

> **não precisar ser descartada quando o produto provar que funciona.**

Isso significa:

-   PostgreSQL;
-   modular monolith;
-   filas;
-   abstração de IA;
-   storage separado;
-   Financial Engine independente;
-   Capture Engine independente;
-   contratos bem definidos.

------------------------------------------------------------------------

# 96. Arquitetura Final

``` text
                         USER
                          │
                          ▼
                ┌─────────────────┐
                │ WEB / MOBILE    │
                └────────┬────────┘
                         │
                         ▼
                ┌─────────────────┐
                │ API GATEWAY     │
                │ AUTH + RATE     │
                └────────┬────────┘
                         │
             ┌───────────┼───────────┐
             ▼           ▼           ▼
          FINANCE      CAPTURE       AI
             │           │           │
             │           ▼           │
             │        DOCUMENT       │
             │           │           │
             │        OCR/PARSER     │
             │           │           │
             │       EXTRACTION      │
             │           │           │
             │       PROPOSAL        │
             │           │           │
             └──────┬────┴───────────┘
                    ▼
             FINANCIAL ENGINE
                    │
          ┌─────────┼─────────┐
          ▼         ▼         ▼
       BALANCES   CARDS    ANALYTICS
          │         │         │
          └─────────┼─────────┘
                    ▼
               POSTGRESQL
                    │
          ┌─────────┴─────────┐
          ▼                   ▼
       REDIS              STORAGE
          │
       WORKERS
```

------------------------------------------------------------------------

# 97. Decisões Arquiteturais Definitivas

Para o MVP:

``` text
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
S3-compatible

Architecture:
Modular Monolith

API:
REST /v1

Documents:
Async processing

AI:
Provider abstraction + model routing

Finance:
Dedicated Financial Engine

Capture:
Dedicated Capture Engine

Deployment:
Containerized managed infrastructure
```

------------------------------------------------------------------------

# 98. O que não deve ser acoplado

Não acoplar:

``` text
UI → Database
UI → IA
IA → Database
OCR → Transaction
Document → Transaction
```

O fluxo correto é:

``` text
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
```

------------------------------------------------------------------------

# 99. Princípio Final de Arquitetura

> **A tecnologia deve desaparecer para o usuário.**

O usuário deve perceber apenas:

``` text
“Eu mandei minha nota.”
        ↓
“O aplicativo entendeu.”
        ↓
“Eu confirmei.”
        ↓
“Agora eu sei para onde meu dinheiro foi.”
```

Todo o restante --- OCR, filas, IA, banco, workers, validação, matching
e regras financeiras --- deve trabalhar nos bastidores.

------------------------------------------------------------------------

# 100. Conclusão

Os documentos 01--08 formam agora uma especificação completa do produto:

``` text
01 — Engenharia Reversa
        ↓
02 — Brandbook
        ↓
03 — PRD + MVP
        ↓
04 — Telas + UX
        ↓
05 — Banco de Dados
        ↓
06 — Motor Financeiro
        ↓
07 — Captura + IA
        ↓
08 — Arquitetura Técnica
```

A partir deste ponto, o projeto deixa de ser apenas uma ideia ou um
conjunto de telas.

Existe uma definição coerente de:

-   produto;
-   experiência;
-   dados;
-   regras financeiras;
-   inteligência;
-   infraestrutura;
-   segurança;
-   desenvolvimento.

------------------------------------------------------------------------

# 101. Próxima Etapa --- Construção

O próximo trabalho não deve ser simplesmente:

> "Começar a programar."

A implementação deve começar pela transformação desta documentação em um
**backlog técnico executável**.

Ordem recomendada:

``` text
Especificação
    ↓
Backlog
    ↓
Setup do projeto
    ↓
Banco
    ↓
Backend
    ↓
Financial Engine
    ↓
Frontend
    ↓
Capture Engine
    ↓
IA
    ↓
Integração
    ↓
Testes
    ↓
Staging
    ↓
Validação
    ↓
Produção
```

O primeiro código deve nascer do domínio financeiro e da estrutura de
dados, e não do dashboard.

Isso reduz significativamente o risco de construir uma interface bonita
sobre regras financeiras frágeis.
