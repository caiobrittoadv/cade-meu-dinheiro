# 05 --- Modelo de Dados e Banco de Dados

## Cadê Meu Dinheiro?

**Versão:** 1.0\
**Status:** Especificação estrutural\
**Projeto:** Cadê Meu Dinheiro?\
**Base:** PRD v2.0 + Mapa de Telas, Fluxos e UX

------------------------------------------------------------------------

# 1. Objetivo

Este documento define o modelo de dados que sustentará o Cadê Meu
Dinheiro?.

O objetivo não é apenas listar tabelas.

É estabelecer:

-   entidades;
-   relacionamentos;
-   responsabilidades;
-   identificadores;
-   estados;
-   origem dos dados;
-   rastreabilidade;
-   integridade;
-   separação entre documento e lançamento financeiro;
-   preparação para IA;
-   preparação para integrações futuras;
-   requisitos de auditoria.

A arquitetura de dados deve permitir que o sistema cresça sem precisar
reconstruir o núcleo financeiro.

------------------------------------------------------------------------

# 2. Princípio Fundamental

O sistema deve separar claramente:

> **o que o usuário enviou**

de:

> **o que o sistema entendeu**

e de:

> **o que foi efetivamente registrado no financeiro.**

Portanto:

``` text
DOCUMENTO ORIGINAL
       ↓
PROCESSAMENTO
       ↓
DADOS EXTRAÍDOS
       ↓
LANÇAMENTO PROPOSTO
       ↓
CONFIRMAÇÃO
       ↓
LANÇAMENTO FINANCEIRO
```

Essas etapas não devem ser representadas como uma única tabela ou
objeto.

------------------------------------------------------------------------

# 3. Princípios do Modelo

## 3.1. Isolamento por usuário

Nenhum usuário pode acessar dados financeiros de outro usuário.

## 3.2. Rastreabilidade

Todo lançamento deve permitir identificar sua origem.

## 3.3. Imutabilidade do histórico crítico

Alterações financeiras importantes devem ser auditáveis.

## 3.4. Separação entre documento e dado financeiro

Um PDF não é um lançamento.

Uma fatura é um documento que pode originar diversos lançamentos.

## 3.5. IA não é fonte da verdade financeira

A IA pode sugerir.

O sistema financeiro determina o estado efetivo.

## 3.6. Preparação para múltiplas fontes

O mesmo lançamento poderá futuramente vir de:

-   usuário;
-   documento;
-   Open Finance;
-   banco;
-   API;
-   importação.

------------------------------------------------------------------------

# 4. Arquitetura Conceitual

``` text
                         USER
                          │
                          ▼
                  FINANCIAL SPACE
                          │
        ┌─────────────────┼─────────────────┐
        ▼                 ▼                 ▼
      ACCOUNTS          CARDS             GOALS
        │                 │
        │                 ▼
        │              INVOICES
        │                 │
        └────────┬────────┘
                 ▼
            TRANSACTIONS
                 │
        ┌────────┼────────┐
        ▼        ▼        ▼
   CATEGORIES  INSTALLMENTS  TRANSFERS
                 │
                 ▼
             FINANCIAL
              ENGINE

DOCUMENTS
    │
    ▼
PROCESSING
    │
    ▼
EXTRACTIONS
    │
    ▼
PROPOSALS
    │
    ▼
TRANSACTIONS
```

------------------------------------------------------------------------

# 5. Conceito de Financial Space

O sistema deve utilizar uma entidade intermediária chamada:

**Financial Space**

Ela representa o ambiente financeiro do usuário.

No MVP, normalmente haverá:

``` text
1 usuário
   ↓
1 espaço financeiro
   ↓
contas
cartões
lançamentos
metas
categorias
documentos
```

Isso é melhor do que vincular todos os dados diretamente ao usuário.

## Benefícios

Permite futuramente:

-   múltiplos espaços;
-   PF e PJ;
-   compartilhamento;
-   membros;
-   permissões;
-   ambientes separados.

------------------------------------------------------------------------

# 6. Entidade User

Representa a identidade de autenticação.

### Campos principais

``` text
id
name
email
password_hash
status
created_at
updated_at
last_login_at
```

### Status

``` text
ACTIVE
SUSPENDED
PENDING
DELETED
```

Nunca armazenar senha em texto puro.

------------------------------------------------------------------------

# 7. Entidade User Profile

Informações adicionais do usuário.

### Campos

``` text
id
user_id
display_name
avatar_url
locale
timezone
currency
created_at
updated_at
```

Separar perfil de autenticação permite evolução futura.

------------------------------------------------------------------------

# 8. Entidade Financial Space

Representa o ambiente financeiro.

### Campos

``` text
id
name
type
currency
owner_user_id
status
created_at
updated_at
```

### Type

Inicial:

``` text
PERSONAL
```

Futuro:

``` text
BUSINESS
SHARED
```

### Status

``` text
ACTIVE
ARCHIVED
DELETED
```

------------------------------------------------------------------------

# 9. Entidade Space Member

Mesmo que o MVP tenha apenas um usuário, o modelo deve estar preparado
para membros.

### Campos

``` text
id
space_id
user_id
role
status
created_at
updated_at
```

### Roles futuras

``` text
OWNER
ADMIN
MEMBER
VIEWER
```

------------------------------------------------------------------------

# 10. Entidade Account

Representa uma conta ou local onde o dinheiro está.

### Tipos

``` text
CHECKING
SAVINGS
DIGITAL
CASH
OTHER
```

### Campos

``` text
id
space_id
name
institution_name
institution_code
type
initial_balance
currency
status
created_at
updated_at
archived_at
```

O saldo atual não deve depender de edição manual.

Ele deve ser derivado do saldo inicial + movimentos.

------------------------------------------------------------------------

# 11. Entidade Account Balance Snapshot

Pode ser utilizada para performance.

### Campos

``` text
id
account_id
balance
reference_date
created_at
```

Essa entidade não é a fonte financeira primária.

Serve para:

-   cache;
-   relatórios;
-   histórico;
-   performance.

------------------------------------------------------------------------

# 12. Entidade Category

Representa categorias financeiras.

### Campos

``` text
id
space_id
name
type
parent_id
icon
color
is_system
status
created_at
updated_at
```

### Type

``` text
INCOME
EXPENSE
BOTH
```

### Parent

Permite:

``` text
Alimentação
├── Mercado
├── Restaurantes
├── Delivery
└── Outros
```

No MVP, subcategorias podem ser opcionais.

------------------------------------------------------------------------

# 13. Entidade Financial Institution

Representa instituições financeiras.

### Campos

``` text
id
name
code
logo_url
type
status
created_at
updated_at
```

Tipos:

``` text
BANK
CARD
WALLET
OTHER
```

A separação permite reutilização entre contas e cartões.

------------------------------------------------------------------------

# 14. Entidade Credit Card

Representa um cartão de crédito.

### Campos

``` text
id
space_id
institution_id
name
last_four_digits
credit_limit
closing_day
due_day
status
created_at
updated_at
```

Nunca armazenar dados completos desnecessários do cartão.

------------------------------------------------------------------------

# 15. Entidade Credit Card Invoice

Representa uma fatura.

### Campos

``` text
id
credit_card_id
reference_month
closing_date
due_date
total_amount
status
created_at
updated_at
```

### Status

``` text
OPEN
CLOSED
PAID
OVERDUE
CANCELLED
```

------------------------------------------------------------------------

# 16. Entidade Transaction

Esta é uma das entidades centrais do sistema.

Representa um evento financeiro efetivamente registrado.

### Campos principais

``` text
id
space_id
account_id
credit_card_id
invoice_id
category_id
type
description
amount
transaction_date
competence_date
payment_date
status
source_type
source_id
notes
created_by
created_at
updated_at
deleted_at
```

### Type

``` text
INCOME
EXPENSE
TRANSFER
```

### Status

``` text
CONFIRMED
PENDING
CANCELLED
```

------------------------------------------------------------------------

# 17. Origem da Transaction

Todo lançamento deverá possuir origem.

### Source Type

``` text
MANUAL
DOCUMENT
INVOICE_IMPORT
BANK_IMPORT
OPEN_FINANCE
SYSTEM
```

O `source_id` referencia a entidade correspondente.

Exemplo:

``` text
source_type = DOCUMENT
source_id = abc123
```

Isso permite saber que determinado lançamento veio de um documento.

------------------------------------------------------------------------

# 18. Transaction Metadata

Informações adicionais que não precisam estar diretamente no núcleo da
transaction.

Exemplos:

``` text
merchant_name
merchant_document
payment_method
original_description
confidence_score
external_reference
```

Pode ser implementado como tabela separada ou JSON estruturado, conforme
decisão arquitetural.

------------------------------------------------------------------------

# 19. Transfer

Transferências devem possuir representação própria.

### Campos

``` text
id
space_id
from_account_id
to_account_id
amount
transaction_date
description
status
created_at
updated_at
```

Opcionalmente, duas transactions podem ser associadas à mesma
transferência.

A transferência deve ser tratada como evento único para evitar
duplicação contábil.

------------------------------------------------------------------------

# 20. Installment Plan

Representa o plano de parcelamento.

### Campos

``` text
id
space_id
description
total_amount
installments_count
installment_amount
start_date
status
created_at
updated_at
```

### Status

``` text
ACTIVE
COMPLETED
CANCELLED
```

------------------------------------------------------------------------

# 21. Installment

Representa cada parcela.

### Campos

``` text
id
installment_plan_id
invoice_id
transaction_id
installment_number
amount
due_date
status
created_at
updated_at
```

Exemplo:

``` text
Plano:
R$ 1.200
12 parcelas

Parcela:
1/12 = R$ 100
2/12 = R$ 100
...
```

------------------------------------------------------------------------

# 22. Recurrence

Representa um padrão recorrente.

### Campos

``` text
id
space_id
type
description
amount
frequency
start_date
end_date
next_occurrence
category_id
account_id
credit_card_id
status
created_at
updated_at
```

### Frequency

``` text
MONTHLY
WEEKLY
YEARLY
CUSTOM
```

------------------------------------------------------------------------

# 23. Goal

Representa uma meta financeira.

### Campos

``` text
id
space_id
name
target_amount
current_amount
target_date
category_id
status
created_at
updated_at
```

### Status

``` text
ACTIVE
COMPLETED
PAUSED
CANCELLED
```

------------------------------------------------------------------------

# 24. Goal Contribution

Representa cada aporte.

### Campos

``` text
id
goal_id
transaction_id
amount
date
created_at
```

O histórico dos aportes deve ser preservado.

------------------------------------------------------------------------

# 25. Document

Esta entidade representa o arquivo enviado pelo usuário.

Exemplos:

-   nota;
-   cupom;
-   comprovante;
-   fatura;
-   extrato;
-   PDF;
-   imagem.

### Campos

``` text
id
space_id
uploaded_by
document_type
file_name
mime_type
storage_key
file_size
checksum
status
created_at
deleted_at
```

### Document Type

``` text
RECEIPT
INVOICE
BANK_STATEMENT
CARD_STATEMENT
PIX_RECEIPT
BILL
OTHER
UNKNOWN
```

------------------------------------------------------------------------

# 26. Document Processing

Representa uma tentativa de processamento.

Um documento pode ser processado mais de uma vez.

### Campos

``` text
id
document_id
processor
processor_version
status
started_at
completed_at
error_code
error_message
created_at
```

### Status

``` text
QUEUED
PROCESSING
COMPLETED
FAILED
CANCELLED
```

Isso é importante porque o mesmo documento poderá passar por diferentes
processadores no futuro.

------------------------------------------------------------------------

# 27. Document Extraction

Representa o resultado estruturado da extração.

### Campos

``` text
id
processing_id
raw_text
structured_data
confidence_score
created_at
```

`structured_data` poderá armazenar JSON normalizado.

Exemplo:

``` json
{
  "merchant": "Supermercado X",
  "date": "2026-08-16",
  "total": 187.42,
  "items": []
}
```

------------------------------------------------------------------------

# 28. Extracted Field

Para maior rastreabilidade, campos críticos podem possuir representação
própria.

### Campos

``` text
id
extraction_id
field_name
field_value
confidence_score
source_text
bounding_box
created_at
```

Isso permite futuramente mostrar de onde uma informação foi extraída no
documento.

------------------------------------------------------------------------

# 29. Financial Proposal

Esta é uma entidade fundamental.

Representa o que o sistema **acha** que deve virar lançamento.

### Campos

``` text
id
space_id
document_id
extraction_id
type
description
amount
date
category_id
account_id
credit_card_id
invoice_id
confidence_score
status
created_at
updated_at
```

### Status

``` text
PROPOSED
REVIEW_REQUIRED
CONFIRMED
REJECTED
DUPLICATE
```

Uma proposta não é ainda uma transaction.

------------------------------------------------------------------------

# 30. Proposal Item

Necessário quando uma única nota possui múltiplos itens.

### Campos

``` text
id
proposal_id
description
quantity
unit_price
total_price
suggested_category_id
confirmed_category_id
confidence_score
created_at
updated_at
```

Isso permite:

``` text
Nota
R$ 187,42

Itens
├── Arroz
├── Carne
├── Limpeza
└── Higiene
```

------------------------------------------------------------------------

# 31. Duplicate Candidate

Representa uma possível duplicidade.

### Campos

``` text
id
space_id
source_transaction_id
candidate_transaction_id
similarity_score
reason
status
created_at
resolved_at
```

### Status

``` text
PENDING
CONFIRMED_DUPLICATE
NOT_DUPLICATE
IGNORED
```

------------------------------------------------------------------------

# 32. AI Classification

Registra sugestões feitas por modelos de IA.

### Campos

``` text
id
space_id
entity_type
entity_id
model
model_version
input_hash
suggestion_type
suggested_value
confidence_score
accepted
created_at
```

Isso permite auditar:

-   qual modelo sugeriu;
-   qual versão;
-   o que sugeriu;
-   se o usuário aceitou.

------------------------------------------------------------------------

# 33. User Learning / Preference

O sistema poderá aprender com correções.

### Campos

``` text
id
space_id
pattern_type
pattern_key
preferred_category_id
confidence
created_at
updated_at
```

Exemplo:

``` text
pattern:
merchant = UBER

preferred_category:
TRANSPORTE
```

O aprendizado deve ser limitado ao espaço financeiro do usuário.

------------------------------------------------------------------------

# 34. Notification

### Campos

``` text
id
user_id
space_id
type
title
message
reference_type
reference_id
read_at
created_at
```

Tipos:

``` text
DOCUMENT_READY
REVIEW_REQUIRED
DUPLICATE_FOUND
INVOICE_IMPORTED
MONTHLY_CLOSING
ALERT
```

------------------------------------------------------------------------

# 35. AI Conversation

Para a IA financeira.

### Conversation

``` text
id
user_id
space_id
title
created_at
updated_at
```

### Message

``` text
id
conversation_id
role
content
created_at
```

Roles:

``` text
USER
ASSISTANT
SYSTEM
TOOL
```

------------------------------------------------------------------------

# 36. Audit Log

A auditoria é importante para dados financeiros.

### Campos

``` text
id
space_id
user_id
entity_type
entity_id
action
old_data
new_data
created_at
```

### Actions

``` text
CREATE
UPDATE
DELETE
CONFIRM
REJECT
IMPORT
PROCESS
```

Nem toda alteração precisa armazenar o objeto inteiro; a estratégia
definitiva dependerá da arquitetura.

------------------------------------------------------------------------

# 37. Relações Principais

``` text
USER
 │
 ├── USER_PROFILE
 │
 └── FINANCIAL_SPACE
       │
       ├── SPACE_MEMBER
       │
       ├── ACCOUNT
       │      │
       │      └── TRANSACTION
       │
       ├── CREDIT_CARD
       │      │
       │      └── INVOICE
       │             │
       │             └── TRANSACTION
       │
       ├── CATEGORY
       │
       ├── GOAL
       │
       ├── DOCUMENT
       │      │
       │      └── PROCESSING
       │             │
       │             └── EXTRACTION
       │                    │
       │                    └── PROPOSAL
       │                           │
       │                           └── TRANSACTION
       │
       ├── RECURRENCE
       ├── INSTALLMENT_PLAN
       ├── TRANSFER
       ├── NOTIFICATION
       └── AUDIT_LOG
```

------------------------------------------------------------------------

# 38. Modelo Simplificado de Transaction

A transaction deve ser o núcleo do motor financeiro.

Conceitualmente:

``` text
Transaction
│
├── identificação
├── tipo
├── valor
├── datas
├── categoria
├── conta/cartão
├── origem
├── status
├── documento
├── parcelamento
├── recorrência
└── auditoria
```

Não devemos permitir que o dashboard calcule valores financeiros
diretamente de documentos.

O dashboard consulta o **núcleo financeiro**.

------------------------------------------------------------------------

# 39. Fluxo de Documento até Transaction

``` text
Documento
   │
   ▼
Document Processing
   │
   ▼
Extraction
   │
   ▼
Financial Proposal
   │
   ├── REJECTED
   │
   ├── DUPLICATE
   │
   └── CONFIRMED
           │
           ▼
      Transaction
```

Esse desenho impede que um OCR defeituoso altere diretamente o saldo.

------------------------------------------------------------------------

# 40. Estados de Dados

## Documento

``` text
UPLOADED
PROCESSING
PROCESSED
REVIEW_REQUIRED
COMPLETED
FAILED
DELETED
```

## Proposta

``` text
PROPOSED
REVIEW_REQUIRED
CONFIRMED
REJECTED
DUPLICATE
```

## Transaction

``` text
PENDING
CONFIRMED
CANCELLED
```

------------------------------------------------------------------------

# 41. Integridade Financeira

O banco de dados deve impedir ou dificultar:

-   valores inválidos;
-   referências inexistentes;
-   transações sem espaço financeiro;
-   parcelas sem plano;
-   faturas sem cartão;
-   categorias pertencentes a outro espaço;
-   transferências entre espaços diferentes;
-   acesso cruzado entre usuários.

As regras matemáticas ficarão no Motor Financeiro.

------------------------------------------------------------------------

# 42. Soft Delete

Entidades financeiras importantes não devem ser simplesmente apagadas
fisicamente.

Preferência:

``` text
deleted_at
```

Isso permite:

-   recuperação;
-   auditoria;
-   rastreabilidade;
-   prevenção de inconsistências.

O comportamento definitivo será definido no documento do Motor
Financeiro.

------------------------------------------------------------------------

# 43. Valores Monetários

Nunca utilizar `float` para valores financeiros.

Preferência:

``` text
DECIMAL
```

ou representação inteira em unidade mínima, conforme decisão da
arquitetura.

Exemplo:

``` text
R$ 187,42
```

deve ser armazenado sem erro de ponto flutuante.

------------------------------------------------------------------------

# 44. Datas

O sistema precisa diferenciar:

-   data da transação;
-   data de competência;
-   data de pagamento;
-   data de fechamento;
-   data de vencimento;
-   data de importação;
-   data de processamento.

Não usar um único campo `date` para todos esses conceitos.

------------------------------------------------------------------------

# 45. Moeda

O MVP pode operar prioritariamente com:

``` text
BRL
```

Mas as entidades financeiras devem possuir `currency` quando aplicável.

Isso evita reconstrução futura para múltiplas moedas.

------------------------------------------------------------------------

# 46. Document Storage

O banco não deve armazenar diretamente arquivos grandes.

Arquivos devem ficar em object storage.

Banco:

``` text
storage_key
mime_type
file_size
checksum
```

Storage:

``` text
imagem
PDF
documento
```

Isso permite escalabilidade.

------------------------------------------------------------------------

# 47. Segurança de Documentos

Documentos devem possuir:

-   acesso privado;
-   URLs temporárias quando necessário;
-   controle de autorização;
-   criptografia;
-   checksum;
-   política de retenção.

O documento nunca deve ficar acessível apenas porque alguém conhece seu
nome ou caminho.

------------------------------------------------------------------------

# 48. Índices Importantes

Índices deverão ser criados principalmente para:

-   `space_id`;
-   `user_id`;
-   `transaction_date`;
-   `category_id`;
-   `account_id`;
-   `credit_card_id`;
-   `invoice_id`;
-   `status`;
-   `source_type`;
-   `document_id`;
-   `created_at`.

Índices compostos serão necessários para consultas frequentes, como:

``` text
space_id + transaction_date
space_id + type + transaction_date
credit_card_id + invoice_id
space_id + status
```

A lista definitiva será validada após definição do banco e dos padrões
reais de consulta.

------------------------------------------------------------------------

# 49. Multi-Tenancy

Mesmo sendo inicialmente um aplicativo pessoal, o sistema deve ser
estruturado como multi-tenant lógico.

A regra principal:

> **Toda informação financeira pertence a um Financial Space.**

Isso reduz o risco de vazamento entre usuários e prepara o sistema para:

-   PF;
-   PJ;
-   contas compartilhadas;
-   múltiplos espaços.

------------------------------------------------------------------------

# 50. API e Modelo de Dados

A API não deve expor diretamente a estrutura interna do banco.

Exemplo ruim:

``` text
POST /transactions
```

recebendo qualquer campo interno.

Preferir contratos de domínio:

``` text
POST /financial/transactions
POST /documents
POST /documents/{id}/process
POST /proposals/{id}/confirm
POST /proposals/{id}/reject
POST /invoices/import
```

Isso permite evolução do banco sem quebrar a interface.

------------------------------------------------------------------------

# 51. Importação de Fatura

O modelo precisa suportar:

``` text
Document
    ↓
Document Processing
    ↓
Extraction
    ↓
Multiple Proposals
    ↓
Multiple Transactions
    ↓
Invoice
```

Uma única fatura pode gerar dezenas de transactions.

------------------------------------------------------------------------

# 52. Uma Nota Pode Gerar Vários Lançamentos

Exemplo:

``` text
Documento:
Supermercado
R$ 187,42

Proposal:
└── compra total

OU

Proposal:
├── Alimentação R$ 86,80
├── Limpeza R$ 35,60
├── Higiene R$ 27,50
└── Outros R$ 37,52
```

A arquitetura deve suportar os dois modelos.

------------------------------------------------------------------------

# 53. Fonte de Verdade

Hierarquia:

``` text
DOCUMENTO
    ↓
EXTRAÇÃO
    ↓
PROPOSTA
    ↓
CONFIRMAÇÃO
    ↓
TRANSACTION
    ↓
MOTOR FINANCEIRO
    ↓
DASHBOARD
```

O dashboard nunca deve considerar diretamente uma proposta não
confirmada.

------------------------------------------------------------------------

# 54. Histórico de Alterações

Exemplo:

Usuário confirma:

``` text
Categoria:
Alimentação
```

Depois altera para:

``` text
Lazer
```

O sistema deve registrar:

``` text
ANTES
Alimentação

DEPOIS
Lazer

QUEM
Usuário

QUANDO
Data/hora
```

Isso será importante para auditoria e aprendizado.

------------------------------------------------------------------------

# 55. Modelo para IA Financeira

A IA deverá consultar serviços financeiros, não acessar diretamente
todas as tabelas.

Exemplo:

``` text
IA
 ↓
Financial Tools
 ↓
get_income()
get_expenses()
get_category_totals()
get_card_commitment()
get_month_comparison()
 ↓
Resultado estruturado
 ↓
LLM
 ↓
Resposta
```

Isso evita que a IA interprete livremente o banco.

------------------------------------------------------------------------

# 56. Modelo para IA de Captura

A IA de captura deverá retornar estrutura validável.

Exemplo:

``` json
{
  "document_type": "RECEIPT",
  "merchant": "Supermercado X",
  "date": "2026-08-16",
  "total": 187.42,
  "currency": "BRL",
  "items": [],
  "payment_method": null,
  "confidence": {
    "merchant": 0.98,
    "date": 0.99,
    "total": 0.99
  }
}
```

Essa saída deve passar por validação antes de criar uma proposta.

------------------------------------------------------------------------

# 57. Não Confiar no JSON da IA

Mesmo que a IA retorne estrutura correta, o backend deve validar:

-   tipos;
-   valores;
-   datas;
-   moeda;
-   campos obrigatórios;
-   limites;
-   consistência.

A IA produz uma **sugestão estruturada**, não uma operação de banco.

------------------------------------------------------------------------

# 58. Consistência e Transações de Banco

Operações financeiras críticas devem utilizar transações de banco.

Exemplo:

Confirmar uma proposta:

``` text
BEGIN
   criar transaction
   associar documento
   atualizar proposta
   registrar auditoria
COMMIT
```

Se qualquer etapa falhar:

``` text
ROLLBACK
```

Não pode existir uma transaction criada enquanto a proposta continua
marcada como pendente devido a uma falha parcial.

------------------------------------------------------------------------

# 59. Idempotência

Importações devem ser idempotentes quando possível.

Se o usuário enviar a mesma fatura duas vezes, o sistema não deve criar
duas faturas idênticas silenciosamente.

O modelo deve suportar identificadores como:

-   checksum do arquivo;
-   hash do documento;
-   referência externa;
-   período;
-   cartão;
-   identificador da fatura.

------------------------------------------------------------------------

# 60. Preparação para Open Finance

O modelo deverá permitir futuramente:

``` text
Integration
Connection
External Account
External Transaction
Sync
```

Essas entidades não precisam estar completas no MVP.

Mas `source_type` e `external_reference` devem ser previstos.

------------------------------------------------------------------------

# 61. Preparação para PJ

O conceito de Financial Space permite:

``` text
Usuário
├── Espaço Pessoal
└── Espaço Empresarial
```

Sem misturar:

-   contas;
-   categorias;
-   lançamentos;
-   documentos;
-   usuários;
-   relatórios.

Isso deve ser considerado desde o início.

------------------------------------------------------------------------

# 62. Diagrama Consolidado

``` text
                           USER
                            │
                   ┌────────┴────────┐
                   ▼                 ▼
             USER PROFILE      FINANCIAL SPACE
                                      │
                         ┌────────────┼─────────────┐
                         ▼            ▼             ▼
                      ACCOUNTS     CARDS          GOALS
                         │            │
                         │            ▼
                         │         INVOICES
                         │            │
                         └──────┬─────┘
                                ▼
                           TRANSACTIONS
                                │
                    ┌───────────┼───────────┐
                    ▼           ▼           ▼
                CATEGORIES  INSTALLMENTS  TRANSFERS

DOCUMENTS
    │
    ▼
PROCESSINGS
    │
    ▼
EXTRACTIONS
    │
    ▼
PROPOSALS
    │
    ├───────────────┐
    ▼               ▼
DUPLICATES      TRANSACTIONS

AI
│
├── CLASSIFICATIONS
├── USER LEARNING
└── CONVERSATIONS

SYSTEM
│
├── NOTIFICATIONS
└── AUDIT LOG
```

------------------------------------------------------------------------

# 63. Prioridade de Implementação do Banco

## Fase 1 --- Núcleo

-   User;
-   User Profile;
-   Financial Space;
-   Space Member;
-   Account;
-   Category;
-   Transaction.

## Fase 2 --- Crédito

-   Credit Card;
-   Invoice;
-   Installment Plan;
-   Installment.

## Fase 3 --- Captura

-   Document;
-   Document Processing;
-   Extraction;
-   Financial Proposal;
-   Proposal Item;
-   Duplicate Candidate.

## Fase 4 --- Inteligência

-   AI Classification;
-   User Learning;
-   Conversation;
-   Message.

## Fase 5 --- Produto

-   Goal;
-   Goal Contribution;
-   Recurrence;
-   Notification;
-   Audit Log.

------------------------------------------------------------------------

# 64. Regras que não devem ser decididas neste documento

Este documento define estrutura.

Não deve fechar ainda:

-   cálculo definitivo de saldo;
-   tratamento de competência;
-   reconhecimento de fatura;
-   regras de parcelamento;
-   disponibilidade do cartão;
-   estornos;
-   recorrências;
-   conciliação;
-   fechamento mensal;
-   projeções.

Esses pontos serão definidos no:

# 06 --- Motor Financeiro + Regras de Negócio

------------------------------------------------------------------------

# 65. Resultado Esperado

Ao final deste documento, temos uma estrutura capaz de suportar:

``` text
USUÁRIO
   ↓
ESPAÇO FINANCEIRO
   ↓
CONTAS / CARTÕES
   ↓
DOCUMENTOS
   ↓
IA / OCR
   ↓
PROPOSTAS
   ↓
CONFIRMAÇÃO
   ↓
TRANSAÇÕES
   ↓
MOTOR FINANCEIRO
   ↓
DASHBOARD / RELATÓRIOS / IA
```

A principal decisão arquitetural de dados é:

> **O sistema nunca deve confundir a informação que foi capturada com a
> informação que foi confirmada financeiramente.**

Essa separação será uma das bases de confiabilidade do Cadê Meu
Dinheiro?.

------------------------------------------------------------------------

# 66. Próximo Documento

## 06 --- Motor Financeiro + Regras de Negócio

O próximo documento deverá definir matematicamente e operacionalmente:

-   saldo;
-   saldo disponível;
-   saldo projetado;
-   receitas;
-   despesas;
-   transferências;
-   cartões;
-   faturas;
-   fechamento;
-   vencimento;
-   competência;
-   parcelamento;
-   recorrência;
-   estorno;
-   cancelamento;
-   duplicidade;
-   importação;
-   conciliação;
-   metas;
-   comprometimentos futuros;
-   indicadores;
-   fechamento mensal.

Esse documento será a **fonte oficial das regras financeiras do
sistema**.
