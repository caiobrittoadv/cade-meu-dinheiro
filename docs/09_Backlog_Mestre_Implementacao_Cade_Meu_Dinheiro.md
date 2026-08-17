# 09 — BACKLOG MESTRE DE IMPLEMENTAÇÃO
## Cadê Meu Dinheiro?

**Versão:** 1.0
**Status:** Backlog técnico mestre
**Projeto:** Cadê Meu Dinheiro?
**Base:** Documentos 01–08 + HANDOFF MASTER
**Objetivo:** transformar a especificação consolidada do produto em uma sequência executável de implementação, preservando dependências, regras de domínio, critérios de aceite e Definition of Done.

---

# 1. FINALIDADE DO DOCUMENTO

Este documento é o plano operacional de implementação do Cadê Meu Dinheiro?.

Os documentos 01–08 permanecem como especificações de referência. Este documento não substitui esses documentos e não redefine suas regras. Sua função é responder:

- o que deve ser implementado;
- em qual ordem;
- quais dependências existem;
- o que precisa estar pronto antes da próxima etapa;
- como saber que uma etapa foi concluída;
- quais testes são obrigatórios;
- quais decisões não podem ser tomadas pelo implementador sem revisão.

A implementação deve preservar a separação entre:

1. Produto;
2. UX/UI;
3. Banco de dados;
4. Motor Financeiro;
5. Motor de Captura;
6. Inteligência Artificial;
7. Arquitetura técnica.

---

# 2. DOCUMENTOS-FONTE

O backlog é derivado dos seguintes documentos:

| Documento | Função |
|---|---|
| 01 — Engenharia Reversa | Estrutura funcional e referências de produto |
| 02 — Brandbook | Marca, identidade visual, linguagem e paleta |
| 03 — PRD + MVP v2 | Produto, público, proposta de valor e escopo do MVP |
| 04 — Telas, Fluxos e UX | Navegação, telas, fluxos, estados e experiência |
| 05 — Modelo de Dados + Banco | Entidades, relacionamentos, estados e rastreabilidade |
| 06 — Motor Financeiro + Regras | Regras financeiras e invariantes |
| 07 — Motor de Captura + IA | Pipeline de documentos, OCR, IA e propostas |
| 08 — Arquitetura Técnica + Plano | Stack, módulos, infraestrutura, segurança e desenvolvimento |

O HANDOFF MASTER funciona como documento de continuidade e consolidação.

---

# 3. PRINCÍPIOS DE IMPLEMENTAÇÃO

## 3.1. Regra de precedência

Quando houver dúvida:

**Documento 06 — Motor Financeiro** prevalece para regras financeiras.

**Documento 05 — Modelo de Dados** prevalece para estrutura de dados.

**Documento 07 — Motor de Captura + IA** prevalece para captura e IA.

**Documento 04 — UX** prevalece para comportamento e fluxo da interface.

**Documento 08 — Arquitetura Técnica** prevalece para arquitetura e infraestrutura.

Nenhum implementador deve substituir uma regra definida nesses documentos por um atalho local.

---

## 3.2. Princípio financeiro

Toda informação financeira deve passar por uma regra de domínio antes de produzir efeito financeiro.

O fluxo correto é:

```text
Entrada
↓
Domínio
↓
Validação
↓
Financial Engine
↓
Transaction
```

---

## 3.3. Princípio da captura

A captura não cria diretamente uma Transaction.

Fluxo obrigatório:

```text
Documento
↓
Processing
↓
Extraction
↓
Normalization
↓
Proposal
↓
Confirmation
↓
Financial Engine
↓
Transaction
```

---

## 3.4. Princípio da IA

A IA interpreta e explica.

O sistema financeiro calcula e decide.

A IA nunca deve:

- consultar SQL diretamente;
- inventar saldo;
- inventar receita;
- inventar despesa;
- inventar fatura;
- inventar parcela;
- gravar diretamente uma Transaction;
- substituir o Financial Engine.

---

## 3.5. Princípio de UX

O usuário deve:

> digitar o mínimo possível, confirmar o necessário e entender o máximo possível.

A captura automática deve ser priorizada em relação ao lançamento manual.

---

# 4. STACK CONSOLIDADA

## Frontend

- Next.js
- React
- TypeScript
- PWA / Web responsivo no MVP

## Backend

- NestJS
- TypeScript
- Modular Monolith

## Banco

- PostgreSQL
- Prisma

## Filas e processamento

- Redis
- BullMQ

## Storage

- S3-compatible Object Storage

## API

- REST `/api/v1`

## OCR / Document AI

- camada de abstração de provedores

## IA

- camada de abstração de provedores
- model routing

## Observabilidade

- OpenTelemetry + serviço de logs/erros

## Deploy

- containers em infraestrutura gerenciada

---

# 5. ESTRUTURA DO BACKLOG

Cada item possui:

- ID;
- prioridade;
- dependências;
- objetivo;
- tarefas;
- critérios de aceite;
- testes;
- Definition of Done.

## Prioridades

### P0 — Bloqueante

Sem esta etapa, o restante do sistema não deve avançar.

### P1 — Essencial para MVP

Necessária para o MVP definido.

### P2 — MVP complementar

Importante, mas não bloqueia o núcleo inicial.

### P3 — Pós-MVP

Não deve ser antecipada sem necessidade.

---

# 6. VISÃO GERAL DA ORDEM

```text
01 Fundação
02 Monorepo
03 Infraestrutura local
04 Banco e Prisma
05 Autenticação
06 Financial Space
07 Contas
08 Categorias
09 Transactions
10 Financial Engine — núcleo
11 Financial Engine — avançado
12 Testes financeiros
13 API financeira
14 Design System
15 Application Shell
16 Onboarding
17 Lançamento manual
18 Dashboard
19 Cartões
20 Faturas e parcelas
21 Upload e Storage
22 Document Processing
23 OCR / Parser
24 Extraction
25 Normalization + Classification
26 Duplicate Detection
27 Financial Proposal
28 Capture Review
29 Integração Capture → Financial Engine
30 Captura MVP ponta a ponta
31 Análises
32 Metas
33 IA Financeira
34 Notificações
35 Auditoria
36 Segurança
37 Observabilidade
38 Testes de integração
39 Staging
40 Produção
```

---

# 7. ÉPICO E01 — FUNDAÇÃO DO PROJETO

**Prioridade:** P0
**Dependências:** nenhuma

## Objetivo

Criar a base técnica sobre a qual todo o projeto será construído.

## Tarefas

- Inicializar repositório.
- Configurar TypeScript.
- Configurar gerenciamento de dependências.
- Definir scripts de desenvolvimento.
- Configurar lint.
- Configurar typecheck.
- Configurar formatação.
- Configurar variáveis de ambiente.
- Definir convenções de nomes.
- Definir estrutura inicial de documentação.
- Criar `.env.example`.
- Definir comandos de desenvolvimento e build.

## Critérios de aceite

- Projeto inicia localmente.
- Typecheck executa sem erro.
- Lint executa sem erro.
- Build executa sem erro.
- Variáveis de ambiente estão documentadas.
- Nenhum segredo está versionado.

## Testes

- lint;
- typecheck;
- build.

## Definition of Done

Código versionado, documentação mínima disponível e ambiente inicial reproduzível.

---

# 8. ÉPICO E02 — MONOREPO

**Prioridade:** P0
**Dependências:** E01

## Estrutura-alvo

```text
cade-meu-dinheiro/
├── apps/
│   ├── web/
│   └── api/
├── packages/
│   ├── ui/
│   ├── types/
│   ├── validation/
│   ├── financial-domain/
│   └── config/
├── infrastructure/
│   ├── docker/
│   ├── database/
│   └── deployment/
├── docs/
└── package.json
```

## Tarefas

- Criar aplicação web.
- Criar aplicação API.
- Criar packages compartilhados.
- Definir configuração compartilhada.
- Definir contratos compartilhados.
- Garantir isolamento entre frontend e backend.
- Configurar scripts de execução.

## Critérios de aceite

- Web e API iniciam separadamente.
- Pacotes compartilhados são consumíveis.
- Build do workspace funciona.
- Não existem dependências circulares indevidas.

## Definition of Done

Monorepo funcional e preparado para os módulos seguintes.

---

# 9. ÉPICO E03 — INFRAESTRUTURA LOCAL

**Prioridade:** P0
**Dependências:** E01–E02

## Tarefas

- Configurar PostgreSQL local.
- Configurar Redis.
- Configurar Object Storage compatível com S3 para desenvolvimento.
- Criar Docker Compose de desenvolvimento.
- Criar variáveis de conexão.
- Criar health checks.
- Documentar inicialização.

## Critérios de aceite

- PostgreSQL acessível.
- Redis acessível.
- Storage acessível.
- API consegue verificar dependências.
- Ambiente pode ser recriado sem configuração manual escondida.

---

# 10. ÉPICO E04 — BANCO DE DADOS E PRISMA

**Prioridade:** P0
**Dependências:** E03

## Objetivo

Implementar a estrutura definida no Documento 05.

## Núcleo inicial

- User
- User Profile
- Financial Space
- Space Member
- Account
- Category
- Transaction

## Estruturas relacionadas

- Card
- Invoice
- Installment
- Recurrence
- Goal
- Document
- Document Processing
- Extraction
- Financial Proposal
- Proposal Item
- Duplicate Candidate
- Audit Log

## Tarefas

- Configurar Prisma.
- Criar schema inicial.
- Criar migrations.
- Criar constraints.
- Criar índices necessários.
- Definir foreign keys.
- Definir estados.
- Garantir isolamento por `financial_space_id`.
- Preparar rastreabilidade de origem.
- Preparar timestamps.

## Critérios de aceite

- Migrations executam do zero.
- Banco pode ser recriado.
- Relações estão preservadas.
- Dados financeiros possuem vínculo com Financial Space.
- Estrutura de documento/proposta/transação permanece separada.

## Definition of Done

Schema versionado, migrado e validado.

---

# 11. ÉPICO E05 — AUTENTICAÇÃO

**Prioridade:** P0
**Dependências:** E04

## Tarefas

- Cadastro.
- Login.
- Sessão/autorização.
- Recuperação de senha.
- Hash seguro de senha.
- Proteção de rotas.
- Controle de status do usuário.
- Registro de último acesso.

## Critérios de aceite

- Usuário consegue criar conta.
- Usuário consegue autenticar.
- Rotas protegidas rejeitam acesso não autenticado.
- Senha nunca é armazenada em texto puro.
- Sessão inválida é rejeitada.

---

# 12. ÉPICO E06 — FINANCIAL SPACE

**Prioridade:** P0
**Dependências:** E05

## Tarefas

- Criar Financial Space.
- Associar usuário como owner.
- Criar Space Member.
- Validar membership em requisições.
- Implementar isolamento por espaço.
- Preparar estrutura para múltiplos espaços futuros.

## Critérios de aceite

Nenhuma operação financeira pode acessar dados de outro Financial Space.

---

# 13. ÉPICO E07 — CONTAS

**Prioridade:** P0
**Dependências:** E06

## Tarefas

- CRUD de contas.
- Conta corrente.
- Conta digital.
- Poupança.
- Dinheiro/carteira.
- Saldo inicial.
- Instituição.
- Status.
- Arquivamento.

## Regra

O saldo atual não deve ser editado manualmente como fonte da verdade.

Ele deve ser derivado do saldo inicial e dos movimentos financeiros.

## Critérios de aceite

- Conta pode ser criada.
- Conta pode ser arquivada.
- Conta pertence a um único Financial Space.
- Saldo inicial é persistido.
- Não há acesso cruzado entre espaços.

---

# 14. ÉPICO E08 — CATEGORIAS

**Prioridade:** P0
**Dependências:** E06

## Tarefas

- Categorias padrão.
- Categorias personalizadas.
- Subcategorias.
- Hierarquia.
- Tipo INCOME / EXPENSE / BOTH.
- Ícone.
- Cor.
- Status.
- Preferências por Financial Space.

## Critérios de aceite

- Usuário consegue criar categoria.
- Categoria pode possuir parent.
- Categoria pertence ao Financial Space.
- Categorias do sistema são diferenciadas das personalizadas.

---

# 15. ÉPICO E09 — TRANSACTIONS

**Prioridade:** P0
**Dependências:** E07–E08

## Objetivo

Criar a entidade financeira efetiva que representa fatos confirmados.

## Tarefas

- Criar Transaction.
- Receita.
- Despesa.
- Transferência.
- Status.
- Data.
- Data de competência.
- Descrição.
- Valor.
- Conta.
- Cartão quando aplicável.
- Categoria.
- Origem.
- Auditoria.
- Cancelamento.

## Critérios de aceite

- Transaction só representa fato financeiro confirmado.
- Proposta não confirmada não altera saldo.
- Transaction pertence a Financial Space.
- Transaction cancelada não participa dos cálculos ativos.
- Origem pode ser rastreada.

---

# 16. ÉPICO E10 — FINANCIAL ENGINE: NÚCLEO

**Prioridade:** P0
**Dependências:** E07–E09

## Objetivo

Implementar as regras do Documento 06.

## Regras obrigatórias

### Saldo da conta

```text
Saldo inicial
+ receitas confirmadas
- despesas confirmadas
+ entradas de transferências
- saídas de transferências
```

### Saldo consolidado

```text
Σ saldo atual das contas monetárias
```

### Transferência própria

Não é receita nem despesa.

### Débito

Compra reduz a conta e representa despesa.

### Dinheiro

Compra reduz a carteira/dinheiro e representa despesa.

## Critérios de aceite

Todos os cálculos passam pelo Financial Engine.

Nenhuma tela implementa cálculo financeiro próprio.

---

# 17. ÉPICO E11 — FINANCIAL ENGINE: AVANÇADO

**Prioridade:** P0
**Dependências:** E10

## Tarefas

- Cartão de crédito.
- Compra no crédito.
- Fatura.
- Pagamento de fatura.
- Parcelamento.
- Recorrência.
- Estorno.
- Reembolso.
- Cancelamento.
- Saldo disponível.
- Saldo projetado.
- Compromissos futuros.
- Fechamento.
- Vencimento.
- Competência.

## Regra crítica do cartão

```text
Compra no cartão
→ despesa econômica + obrigação

Pagamento da fatura
→ saída bancária + liquidação da obrigação

Não:
compra + pagamento = duas despesas
```

## Critérios de aceite

- Compra de cartão não reduz saldo bancário imediatamente.
- Pagamento de fatura reduz conta.
- Pagamento não cria nova despesa de consumo.
- Parcelas são vinculadas corretamente às faturas.
- Estornos preservam relação com a operação original.

---

# 18. ÉPICO E12 — TESTES DO FINANCIAL ENGINE

**Prioridade:** P0
**Dependências:** E10–E11

## Testes obrigatórios

- saldo;
- receita;
- despesa;
- transferência;
- cartão;
- fatura;
- pagamento;
- parcela;
- recorrência;
- estorno;
- projeção;
- fechamento;
- cancelamento;
- duplicidade.

## Invariantes obrigatórios

1. Transferência própria não altera patrimônio consolidado.
2. Proposta não confirmada não entra no saldo.
3. Transaction cancelada não entra nos cálculos ativos.
4. Pagamento da fatura não cria nova despesa.
5. Parcela não pertence a duas faturas.
6. Transaction pertence a um Financial Space.
7. Importação repetida não gera duplicidade silenciosa.
8. Valores monetários possuem precisão adequada.
9. Saldos são reconstruíveis.
10. Operações críticas são auditáveis.

## Definition of Done

Nenhuma etapa de captura deve ser considerada pronta enquanto os invariantes financeiros não estiverem cobertos por testes.

---

# 19. ÉPICO E13 — API FINANCEIRA

**Prioridade:** P0
**Dependências:** E12

## Base

```text
/api/v1/
```

## Endpoints principais

```text
/auth
/users
/spaces
/accounts
/transactions
/categories
/cards
/invoices
/documents
/proposals
/goals
/analytics
/ai
```

## Tarefas

- Controllers.
- DTOs.
- Validação.
- Services.
- Repositories.
- Autorização por Financial Space.
- Tratamento de erros.
- Versionamento.

## Critérios de aceite

A API não permite bypass das regras do domínio financeiro.

---

# 20. ÉPICO E14 — DESIGN SYSTEM E UI FOUNDATION

**Prioridade:** P1
**Dependências:** E02

## Objetivo

Transformar Brandbook e UX em componentes implementáveis.

## Tokens

- colors;
- typography;
- spacing;
- radius;
- shadows;
- breakpoints.

## Paleta

### Primary

`#6C3BFF`

### Primary Dark

`#4B22B8`

### Primary Soft

`#EDE7FF`

### Dark Background

`#0D0D12`

### Dark Surface

`#17171F`

### Light Background

`#F7F7FA`

### Light Surface

`#FFFFFF`

### Text Primary

`#17171F`

### Text Secondary

`#6F7180`

## Tarefas

- Tokens.
- Light Mode.
- Dark Mode.
- Tipografia.
- Botões.
- Inputs.
- Selects.
- Cards.
- Tables.
- Badges.
- Modais.
- Drawers.
- Estados.
- Componentes financeiros.
- Componentes de captura.
- Componentes de revisão.
- Acessibilidade.

## Regra

Componentes devem consumir tokens.

Não espalhar HEX diretamente pelos componentes.

---

# 21. ÉPICO E15 — APPLICATION SHELL

**Prioridade:** P1
**Dependências:** E05 + E14

## Desktop

Sidebar:

```text
Visão geral
Adicionar
Lançamentos
Contas
Cartões
Para Onde Foi?
Metas
IA
Configurações
Ajuda
Perfil
```

## Mobile

```text
Início
Lançamentos
+
Cartões
Mais
```

## Tarefas

- Layout global.
- Sidebar.
- Header.
- Bottom navigation.
- Responsividade.
- Perfil.
- Estados de navegação.
- Proteção de rotas.

---

# 22. ÉPICO E16 — ONBOARDING

**Prioridade:** P1
**Dependências:** E06–E08 + E15

## Etapas

1. Renda.
2. Recebimento.
3. Conta.
4. Cartão.
5. Primeiro registro.

## Critérios de aceite

O onboarding coleta somente informações necessárias para começar a utilizar o sistema.

---

# 23. ÉPICO E17 — LANÇAMENTO MANUAL

**Prioridade:** P1
**Dependências:** E13 + E15

## Fluxo rápido

```text
Descrição
Valor
Tipo
Adicionar
```

## Detalhamento

- Categoria.
- Subcategoria.
- Conta.
- Cartão.
- Forma de pagamento.
- Data.
- Recorrência.
- Parcelamento.
- Observação.

## Regra

Lançamento manual também passa pelo Financial Engine.

---

# 24. ÉPICO E18 — DASHBOARD

**Prioridade:** P1
**Dependências:** E13 + E15 + E17

## Componentes

- Período.
- Entrou.
- Saiu.
- Disponível.
- Para Onde Foi?
- Comprometido.
- Mensagem contextual.
- CTA Adicionar.

## Regra

O Dashboard não possui lógica financeira própria.

Ele consulta dados produzidos pelo Financial Engine.

## Critérios de aceite

Com dados reais:

- entradas aparecem corretamente;
- saídas aparecem corretamente;
- saldo aparece corretamente;
- categorias refletem Transactions;
- compromissos não são confundidos com saldo real.

---

# 25. ÉPICO E19 — CARTÕES

**Prioridade:** P1
**Dependências:** E11 + E13

## Cadastro

- nome;
- instituição;
- limite;
- fechamento;
- vencimento.

## Compras

- descrição;
- valor;
- data;
- categoria;
- parcelas.

## Critérios de aceite

Cartão, compra, parcela e fatura são entidades conceitualmente distintas.

---

# 26. ÉPICO E20 — FATURAS E PARCELAS

**Prioridade:** P1
**Dependências:** E19

## Tarefas

- Fatura atual.
- Faturas futuras.
- Faturas encerradas.
- Total.
- Vencimento.
- Limite.
- Disponível.
- Parcelas futuras.
- Associação compra → parcela → fatura.
- Pagamento da fatura.

## Critérios de aceite

- Uma parcela não pertence a duas faturas.
- Pagamento não duplica despesa.
- Fatura reflete os lançamentos associados.

---

# 27. ÉPICO E21 — UPLOAD E STORAGE

**Prioridade:** P1
**Dependências:** E03 + E06

## Tarefas

- Upload de imagem.
- Upload de PDF.
- Validação de MIME.
- Limites de arquivo.
- Object Storage.
- Chaves privadas.
- Associação com Financial Space.
- Associação com Document.
- Exclusão conforme política.

## Segurança

Não confiar apenas na extensão do arquivo.

Não utilizar caminhos públicos previsíveis.

---

# 28. ÉPICO E22 — DOCUMENT PROCESSING

**Prioridade:** P1
**Dependências:** E21

## Pipeline

```text
RECEIVED
↓
CLASSIFIED
↓
OCR/PARSED
↓
EXTRACTED
↓
NORMALIZED
↓
INTERPRETED
↓
VALIDATED
↓
MATCHED
↓
PROPOSED
↓
REVIEWED
↓
CONFIRMED
```

## Tarefas

- Document Processing.
- Jobs.
- BullMQ.
- Workers.
- Estados.
- Retry.
- Idempotência.
- Dead Letter Queue para falhas persistentes.

---

# 29. ÉPICO E23 — OCR / PARSER

**Prioridade:** P1
**Dependências:** E22

## Tipos

- nota;
- cupom;
- comprovante PIX;
- fatura;
- extrato;
- boleto;
- imagem;
- PDF.

## Regra de PDF

```text
PDF com texto
→ parser direto

PDF escaneado
→ renderização
→ OCR
```

## Resultado esperado

```text
raw_text
+
bounding boxes
+
confidence
```

## Critérios de aceite

OCR não deve ser tratado como interpretação semântica.

---

# 30. ÉPICO E24 — EXTRACTION

**Prioridade:** P1
**Dependências:** E23

## Campos

- tipo;
- estabelecimento;
- CNPJ;
- valor;
- moeda;
- data;
- hora;
- método de pagamento;
- conta;
- cartão;
- fatura;
- parcela;
- itens;
- taxas;
- descontos;
- créditos;
- estornos;
- referência externa.

## Regra

Campos ausentes não devem ser inventados.

---

# 31. ÉPICO E25 — NORMALIZATION + CLASSIFICATION

**Prioridade:** P1
**Dependências:** E24

## Merchant

Manter:

```text
original_name
normalized_name
```

## Categorização

Prioridade:

```text
preferência explícita
↓
regra personalizada
↓
merchant conhecido
↓
classificador
↓
LLM
↓
Outros
```

## Confiança

A confiança deve existir por campo.

Campos críticos:

- valor;
- tipo;
- data;
- conta/cartão;
- direção;
- fatura.

Baixa confiança em campo crítico exige revisão.

---

# 32. ÉPICO E26 — DUPLICATE DETECTION

**Prioridade:** P1
**Dependências:** E24–E25

## Matching

Utilizar sinais como:

- valor;
- data;
- merchant;
- conta;
- cartão;
- descrição;
- referência;
- parcela.

## Regra

Duplicidade deve ser tratada como estado/decisão.

Nunca excluir silenciosamente.

---

# 33. ÉPICO E27 — FINANCIAL PROPOSAL

**Prioridade:** P1
**Dependências:** E25–E26 + E11

## Tarefas

- Criar Proposal.
- Criar Proposal Items.
- Vincular origem.
- Registrar confidence.
- Registrar exceções.
- Registrar possíveis duplicidades.
- Preparar confirmação.

## Regra

Proposal não é Transaction.

---

# 34. ÉPICO E28 — CAPTURE REVIEW

**Prioridade:** P1
**Dependências:** E27 + E15

## Objetivo

Fazer o usuário revisar somente o que precisa de intervenção.

Exemplo:

```text
37 lançamentos

31 OK
4 baixa confiança
2 possíveis duplicidades
```

Interface:

> Você só precisa conferir 6 lançamentos.

## Tarefas

- Lista de propostas.
- Campos editáveis.
- Evidência original.
- Categoria sugerida.
- Confidence.
- Duplicidade.
- Confirmar.
- Corrigir.
- Rejeitar.

## Critérios de aceite

Usuário não precisa revisar informações de alta confiança desnecessariamente.

---

# 35. ÉPICO E29 — CAPTURE → FINANCIAL ENGINE

**Prioridade:** P0
**Dependências:** E12 + E27–E28

## Fluxo obrigatório

```text
Proposal
↓
Confirmation
↓
Financial Engine
↓
Transaction
```

## Critérios de aceite

- Proposal não confirmada não altera saldo.
- Confirmação cria fato financeiro através do Engine.
- Origem permanece rastreável.
- Operação é auditável.
- Reprocessamento não cria duplicidade.

---

# 36. ÉPICO E30 — CAPTURA MVP PONTA A PONTA

**Prioridade:** P1
**Dependências:** E21–E29

## MVP obrigatório

- Foto.
- Upload.
- PDF.
- OCR.
- Classificação.
- Extração.
- Merchant.
- Valor.
- Data.
- Categoria.
- Proposal.
- Confirmação.
- Duplicate Detection básico.
- Fatura.
- Comprovante PIX.
- Revisão de exceções.
- IA financeira preparada.

## Fluxo final

```text
USUÁRIO
↓
UPLOAD
↓
DOCUMENT
↓
PROCESSING
↓
OCR / PARSER
↓
EXTRACTION
↓
NORMALIZATION
↓
AI INTERPRETATION
↓
VALIDATION
↓
DUPLICATE MATCHING
↓
PROPOSAL
↓
USER REVIEW
↓
FINANCIAL ENGINE
↓
TRANSACTION
↓
DASHBOARD
```

---

# 37. ÉPICO E31 — PARA ONDE FOI? / ANALYTICS

**Prioridade:** P1
**Dependências:** E18 + E30

## Objetivo

Mostrar para onde o dinheiro foi.

## Tarefas

- Totais por categoria.
- Comparação de períodos.
- Evolução mensal.
- Principais gastos.
- Participação do cartão.
- Análises contextuais.

## Regra

Analytics utiliza dados financeiros estruturados.

---

# 38. ÉPICO E32 — METAS

**Prioridade:** P2
**Dependências:** E10 + E15

## MVP

- Criar meta.
- Valor objetivo.
- Prazo.
- Aporte.
- Progresso.

Exemplo:

```text
Reserva de emergência
Objetivo: R$ 10.000
Atual: R$ 3.500
Progresso: 35%
```

---

# 39. ÉPICO E33 — IA FINANCEIRA

**Prioridade:** P1
**Dependências:** E10 + E31

## Arquitetura

```text
Usuário
↓
LLM
↓
Tool
↓
Financial Service
↓
Repository
↓
Database
↓
dados estruturados
↓
LLM
↓
resposta
```

## Tools mínimas

```text
get_current_balance
get_period_summary
get_income
get_expenses
get_category_totals
get_category_transactions
get_card_summary
get_invoice
get_future_commitments
get_installments
get_recurring_expenses
compare_periods
get_goal_progress
get_projected_balance
```

## Guardrails

Se o número existe no sistema, consultar o sistema.

Nunca inventar dados.

Estimativas devem ser explicitamente identificadas como estimativas.

Alterações financeiras relevantes exigem confirmação.

---

# 40. ÉPICO E34 — NOTIFICAÇÕES

**Prioridade:** P2
**Dependências:** E22 + E29

## Possíveis eventos

- documento processado;
- proposta criada;
- proposta aguardando revisão;
- confirmação concluída;
- falha de processamento;
- fatura;
- compromissos.

## Regra

Falha de notificação não pode impedir persistência dos dados.

---

# 41. ÉPICO E35 — AUDITORIA

**Prioridade:** P1
**Dependências:** E09 + E29

## Auditar operações críticas

- criação;
- alteração;
- confirmação;
- cancelamento;
- importação;
- proposta;
- confirmação de proposta;
- operações automáticas;
- alterações relevantes de configuração.

## Critérios

O histórico financeiro crítico não pode ser destruído sem rastreabilidade.

---

# 42. ÉPICO E36 — SEGURANÇA

**Prioridade:** P0
**Dependências:** sistema funcional

## Obrigatório

- HTTPS em ambientes apropriados.
- Secrets fora do código.
- Criptografia em repouso quando aplicável.
- Controle de sessão.
- Rate limiting.
- Menor privilégio.
- Isolamento por Financial Space.
- Storage privado.
- Autorização por recurso.
- Backups.
- Rotação de credenciais.
- Proteção de documentos.

## LGPD

Considerar:

- finalidade;
- necessidade;
- transparência;
- segurança;
- acesso;
- retenção;
- eliminação;
- minimização.

---

# 43. ÉPICO E37 — OBSERVABILIDADE

**Prioridade:** P1
**Dependências:** funcionalidades principais

## Monitorar

- API;
- latência;
- erros;
- jobs;
- OCR;
- IA;
- banco;
- filas;
- uploads;
- storage;
- custos.

## Métricas

```text
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

---

# 44. ÉPICO E38 — TESTES DE INTEGRAÇÃO

**Prioridade:** P0
**Dependências:** E29 + E33 + E36–E37

## Cenários

### Financeiro

- criar conta;
- registrar receita;
- registrar despesa;
- transferir;
- comprar no cartão;
- fechar fatura;
- pagar fatura;
- parcelar;
- estornar.

### Captura

- enviar foto;
- processar;
- extrair;
- classificar;
- detectar duplicidade;
- gerar proposta;
- revisar;
- confirmar;
- gerar Transaction.

### Segurança

- usuário A tentando acessar Financial Space B;
- documento de outro espaço;
- proposal de outro espaço;
- transaction de outro espaço.

### Resiliência

- OCR indisponível;
- IA indisponível;
- Redis indisponível;
- falha de worker;
- retry;
- processamento duplicado.

---

# 45. ÉPICO E39 — STAGING

**Prioridade:** P0
**Dependências:** E36–E38

## Pipeline

```text
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
```

## Critérios

- ambiente isolado;
- banco separado;
- storage separado;
- secrets próprios;
- logs disponíveis;
- smoke tests aprovados.

---

# 46. ÉPICO E40 — PRODUÇÃO

**Prioridade:** P0
**Dependências:** E39

## Pipeline

```text
staging aprovado
↓
produção
↓
migration controlada
↓
smoke test
↓
monitoramento
```

## Critérios

- deploy reproduzível;
- rollback planejado;
- backups;
- observabilidade;
- alertas;
- health checks;
- secrets configurados;
- nenhuma migration destrutiva não validada.

---

# 47. DEPENDÊNCIAS PRINCIPAIS

```text
FUNDAÇÃO
↓
MONOREPO
↓
INFRA
↓
BANCO
↓
AUTH
↓
FINANCIAL SPACE
↓
CONTAS + CATEGORIAS
↓
TRANSACTIONS
↓
FINANCIAL ENGINE
↓
TESTES FINANCEIROS
↓
API
↓
UI FOUNDATION
↓
SHELL
↓
LANÇAMENTO MANUAL
↓
DASHBOARD
↓
CARTÕES
↓
FATURAS/PARCELAS
↓
UPLOAD/STORAGE
↓
PROCESSING
↓
OCR
↓
EXTRACTION
↓
NORMALIZATION
↓
DUPLICIDADE
↓
PROPOSAL
↓
REVIEW
↓
FINANCIAL ENGINE
↓
CAPTURA PONTA A PONTA
↓
ANALYTICS / METAS / IA
↓
SEGURANÇA / OBSERVABILIDADE
↓
TESTES
↓
STAGING
↓
PRODUÇÃO
```

---

# 48. MILESTONES

## M01 — Fundação concluída

E01–E06.

Resultado:

```text
Projeto
+
Banco
+
Autenticação
+
Financial Space
```

---

## M02 — Núcleo financeiro concluído

E07–E13.

Resultado:

```text
Contas
+
Categorias
+
Transactions
+
Financial Engine
+
API
+
Testes financeiros
```

Este é o primeiro grande marco técnico.

---

## M03 — Aplicação utilizável

E14–E20.

Resultado:

```text
Login
+
Onboarding
+
Contas
+
Lançamento manual
+
Dashboard
+
Cartões
+
Faturas
```

Neste ponto já existe um aplicativo financeiro funcional sem captura inteligente.

---

## M04 — Capture Engine funcional

E21–E30.

Resultado:

```text
Foto/PDF
↓
OCR
↓
Extração
↓
IA
↓
Duplicidade
↓
Proposta
↓
Revisão
↓
Confirmação
↓
Transaction
```

Este é o marco que valida o principal diferencial do produto.

---

## M05 — Inteligência

E31–E35.

Resultado:

```text
Analytics
+
Metas
+
IA Financeira
+
Notificações
+
Auditoria
```

---

## M06 — Produção

E36–E40.

Resultado:

```text
Segurança
+
Observabilidade
+
Testes
+
Staging
+
Produção
```

---

# 49. DEFINITION OF DONE GLOBAL

Uma tarefa só é considerada concluída quando:

- implementação está versionada;
- typecheck passa;
- lint passa;
- testes aplicáveis passam;
- autorização está implementada;
- erros relevantes são tratados;
- logs não expõem dados financeiros desnecessários;
- documentação técnica está atualizada quando necessário;
- critérios de aceite foram atendidos;
- nenhuma regra financeira foi implementada fora do domínio apropriado;
- nenhuma funcionalidade introduziu acesso cruzado entre Financial Spaces.

Para funcionalidades financeiras:

- testes de regra são obrigatórios;
- valores monetários possuem precisão adequada;
- origem é rastreável;
- operação é auditável quando crítica.

Para captura:

- processamento é idempotente;
- proposta é separada de Transaction;
- confidence é preservada;
- duplicidade é tratada explicitamente;
- confirmação passa pelo Financial Engine.

---

# 50. GATE DE QUALIDADE POR FASE

Nenhuma fase deve avançar apenas porque "o código funciona".

Antes de avançar:

```text
Código
↓
Critérios de aceite
↓
Testes
↓
Segurança
↓
Integração
↓
Revisão
↓
Definition of Done
↓
Próxima fase
```

Se uma fase falhar em um requisito crítico, ela permanece aberta.

---

# 51. REGRAS PARA O AGENTE DE DESENVOLVIMENTO

O agente que implementar este backlog deverá:

1. Ler o documento correspondente antes de implementar.
2. Respeitar os documentos 01–08.
3. Não inventar regras financeiras.
4. Não alterar arquitetura sem justificativa.
5. Não criar microserviços prematuramente.
6. Não criar acesso direto da IA ao banco.
7. Não permitir Capture Engine → Transaction diretamente.
8. Não implementar cálculo financeiro na UI.
9. Não duplicar regras entre frontend e backend.
10. Não ignorar testes financeiros.
11. Não usar dados mockados como substituição permanente do domínio real.
12. Não marcar uma tarefa como concluída sem cumprir seus critérios de aceite.
13. Não avançar sobre uma dependência ainda não concluída.
14. Registrar qualquer bloqueio técnico antes de improvisar uma solução estrutural.

---

# 52. O QUE NÃO FAZER

Não:

- começar pelo chatbot;
- começar pelo OCR;
- começar pelo Open Finance;
- começar pelo dashboard sem Financial Engine;
- criar microserviços;
- colocar regra financeira em componente React;
- deixar IA gravar Transaction;
- transformar documento diretamente em Transaction;
- usar Redis como fonte de verdade financeira;
- armazenar documentos em caminhos públicos previsíveis;
- aceitar duplicidades silenciosamente;
- contar compra de cartão + pagamento da fatura como duas despesas;
- misturar saldo real com projeção;
- alterar decisões dos documentos 01–08 sem revisão.

---

# 53. CRITÉRIO DE SUCESSO DO MVP

O MVP estará tecnicamente e funcionalmente validado quando for possível executar o seguinte fluxo:

```text
Usuário
↓
Cria conta
↓
Cria/possui Financial Space
↓
Cadastra conta
↓
Registra renda
↓
Envia foto/comprovante/PDF
↓
Sistema identifica documento
↓
OCR/Parser
↓
Extração
↓
Normalização
↓
Classificação
↓
Detecção de duplicidade
↓
Proposta
↓
Usuário revisa
↓
Usuário confirma
↓
Financial Engine
↓
Transaction
↓
Saldo atualizado
↓
Dashboard atualizado
↓
"Para onde foi?"
↓
Usuário entende sua situação financeira
```

A pergunta final de validação permanece:

> **O usuário consegue parar de cadastrar manualmente suas despesas e ainda assim entender para onde o dinheiro está indo?**

---

# 54. ROADMAP PÓS-MVP

Não antecipar ao MVP sem validação.

## Pós-MVP

- Open Finance;
- automação avançada;
- auto-confirmação baseada em confiança;
- aplicativo nativo;
- funcionalidades empresariais;
- patrimônio;
- investimentos;
- DRE;
- fluxo de caixa empresarial;
- recursos avançados de IA.

A arquitetura deve permitir evolução sem exigir reconstrução do núcleo.

---

# 55. REGRA FINAL DE IMPLEMENTAÇÃO

O projeto deve evoluir nesta lógica:

```text
ESPECIFICAÇÃO
↓
FUNDAÇÃO
↓
DOMÍNIO FINANCEIRO
↓
MOTOR FINANCEIRO
↓
API
↓
INTERFACE
↓
CAPTURA
↓
IA
↓
ANÁLISE
↓
SEGURANÇA
↓
TESTES
↓
STAGING
↓
PRODUÇÃO
```

O objetivo não é simplesmente chegar a uma aplicação visualmente pronta.

O objetivo é construir um sistema em que:

> **o usuário envia informação, o sistema trabalha, o usuário confirma o necessário e o Motor Financeiro mantém a verdade financeira.**

---

# 56. STATUS INICIAL DO BACKLOG

Todos os itens começam como:

`BACKLOG`

Estados permitidos:

```text
BACKLOG
↓
READY
↓
IN PROGRESS
↓
BLOCKED
↓
IN REVIEW
↓
DONE
```

Uma tarefa `DONE` não deve retornar a `DONE` novamente sem nova execução; qualquer alteração posterior deve gerar nova tarefa ou revisão vinculada.

---

# 57. PRÓXIMO ARTEFATO OPERACIONAL

Depois deste Backlog Mestre, o próximo nível de detalhamento recomendado é:

**10 — PLANO DE EXECUÇÃO / SPRINT 01**

Esse documento deverá pegar exclusivamente os primeiros itens P0 do backlog e transformá-los em tarefas de implementação concretas, com:

- objetivo da tarefa;
- arquivos esperados;
- comandos;
- dependências;
- critérios de aceite;
- testes;
- Definition of Done;
- instrução de implementação para o agente de desenvolvimento.

O Backlog Mestre permanece como fonte de ordem e dependência; o Plano de Execução detalha a execução de cada etapa.
