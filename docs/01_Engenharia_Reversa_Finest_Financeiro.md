# Engenharia Reversa --- Finest Financeiro

## Análise Estrutural Inicial do Produto

**Documento:** 01 --- Engenharia Reversa e Arquitetura Funcional
Inicial\
**Projeto:** Aplicativo de Gestão Financeira\
**Referência analisada:** Finest Financeiro\
**Objetivo:** compreender a estrutura, organização funcional,
experiência de uso e arquitetura conceitual do produto de referência
para orientar a criação de uma solução própria, com identidade visual
distinta.

------------------------------------------------------------------------

## 1. Objetivo da análise

Esta primeira análise teve como objetivo estudar o Finest Financeiro a
partir do material público disponibilizado em sua página de
apresentação, especialmente os screenshots das telas do aplicativo, o
dashboard demonstrativo e as funcionalidades apresentadas
comercialmente.

O objetivo não é reproduzir a identidade visual ou realizar uma cópia
literal da interface, mas compreender a **estrutura de produto,
arquitetura de informação, organização dos módulos, fluxos financeiros e
conceito de inteligência financeira**.

A referência principal deve ser entendida como inspiração funcional e
estrutural para o desenvolvimento de um produto próprio.

------------------------------------------------------------------------

## 2. Conceito central identificado

O Finest está estruturado em torno de um motor financeiro central que
alimenta diferentes visões do sistema.

A arquitetura conceitual identificada pode ser representada assim:

``` text
                    USUÁRIO
                       │
             ┌─────────┴─────────┐
             │                   │
        FINANCEIRO PF       FINANCEIRO PJ
             │                   │
     ┌───────┼────────┐    ┌─────┼─────────┐
     │       │        │    │     │         │
  Gastos  Receitas  Cartões  Caixa  DRE  Recebimentos
     │       │        │    │     │         │
     └───────┴────────┴────┴─────┴─────────┘
                       │
                  BANCO DE DADOS
                       │
                       ▼
                INTELIGÊNCIA IA
                       │
                       ▼
             ANÁLISES E RECOMENDAÇÕES
```

A principal conclusão é que o produto não deve ser pensado como um
conjunto isolado de telas. O núcleo deve ser um **motor financeiro
estruturado**, capaz de alimentar dashboards, relatórios, projeções e
inteligência artificial.

------------------------------------------------------------------------

## 3. Arquitetura de navegação identificada

### 3.1. Contexto Pessoal

A estrutura visual analisada apresenta uma navegação lateral com módulos
relacionados à gestão financeira pessoal.

Elementos identificados:

-   Dashboard;
-   Gastos Fixos;
-   Gastos Variáveis;
-   Cartões de Crédito;
-   Recebimentos;
-   Cofrinhos;
-   Bancos;
-   Investimentos.

Existe também uma alternância entre os contextos **Pessoal** e
**Empresa**.

### 3.2. Contexto Empresarial

O contexto empresarial apresenta uma estrutura diferente, orientada à
gestão operacional e financeira da empresa.

Elementos identificados:

-   Dashboard;
-   Recebimentos;
-   A Receber;
-   Gastos Fixos;
-   Gastos Variáveis;
-   DRE;
-   Fluxo de Caixa.

A análise indica que PF e PJ devem ser tratados como **contextos
financeiros diferentes**, e não apenas como um filtro visual.

------------------------------------------------------------------------

## 4. Dashboard Pessoal

A estrutura observada apresenta:

-   identificação do período;
-   total de gastos;
-   total de recebimentos;
-   saldo;
-   evolução do saldo;
-   distribuição dos gastos;
-   distinção entre gastos fixos e variáveis;
-   possibilidade de lançamento rápido de despesas.

O dashboard possui caráter operacional e analítico.

### Lógica conceitual

``` text
Saldo inicial
    +
Receitas
    -
Despesas
    =
Saldo acumulado
```

O dashboard deve ser consequência dos lançamentos existentes no sistema,
e não possuir dados financeiros independentes.

------------------------------------------------------------------------

## 5. Lançamentos

O conceito de lançamento é o núcleo funcional do aplicativo.

Um lançamento deve conter, conforme a necessidade:

``` text
id
financial_space_id
tipo
descrição
valor
data
data de competência
categoria
subcategoria
conta
cartão
centro de custo
status
forma de pagamento
recorrência
parcelamento
observações
created_at
updated_at
```

Tipos possíveis:

-   Receita;
-   Despesa;
-   Transferência;
-   Investimento;
-   Resgate;
-   Pagamento de fatura.

------------------------------------------------------------------------

## 6. Lançamento rápido

O material analisado demonstra uma preocupação com velocidade de
lançamento.

A estrutura observada é próxima de:

``` text
Descrição
Valor
Tipo
Adicionar
```

A recomendação para nosso produto é manter esse conceito, mas permitir
detalhamento posterior.

### Lançamento rápido

-   Descrição;
-   Valor;
-   Tipo.

### Detalhamento opcional

-   Categoria;
-   Subcategoria;
-   Conta;
-   Cartão;
-   Forma de pagamento;
-   Data;
-   Recorrência;
-   Parcelamento;
-   Centro de custo;
-   Observação.

Essa abordagem preserva velocidade sem comprometer a qualidade dos
dados.

------------------------------------------------------------------------

## 7. Gastos Fixos

A funcionalidade deve representar despesas recorrentes e previsíveis.

Modelo conceitual:

``` text
Descrição
Valor
Categoria
Periodicidade
Dia de vencimento
Forma de pagamento
Conta
Status
```

Exemplo:

``` text
Aluguel
R$ 3.000
Moradia
Mensal
Dia 10
PIX
Banco X
A pagar
```

A recomendação é que gasto fixo seja associado a uma **regra de
recorrência**, e não apenas a um marcador booleano.

------------------------------------------------------------------------

## 8. Gastos Variáveis

Representam despesas cujo valor ou ocorrência depende do comportamento
do usuário.

Campos principais:

-   descrição;
-   valor;
-   data;
-   categoria;
-   subcategoria;
-   conta ou cartão;
-   forma de pagamento.

Exemplo:

``` text
Restaurante
R$ 180
Alimentação
Restaurantes
Cartão
```

------------------------------------------------------------------------

## 9. Cartões de crédito

O sistema precisa separar cartão, fatura, compra e parcela.

Estrutura conceitual:

``` text
CARTÃO
│
├── Limite
├── Limite disponível
├── Dia de fechamento
├── Dia de vencimento
│
└── FATURAS
       │
       ├── Atual
       ├── Futuras
       └── Encerradas
```

Compras parceladas:

``` text
COMPRA
│
├── Valor total
├── Número de parcelas
└── Parcelas
      ├── Parcela 1
      ├── Parcela 2
      ├── Parcela 3
      └── ...
```

Uma compra de R\$ 1.200 em 12 vezes deve ser representada como uma
compra total de R\$ 1.200 com 12 compromissos de R\$ 100, e não como uma
despesa mensal de R\$ 1.200.

------------------------------------------------------------------------

## 10. Receitas e recebimentos

A estrutura deve diferenciar:

-   receita prevista;
-   receita recebida;
-   receita atrasada;
-   receita cancelada.

Modelo:

``` text
RECEITA

Descrição
Valor
Fonte
Categoria
Data prevista
Data recebida
Conta
Recorrência
Status
```

No contexto empresarial, isso deve alimentar diretamente o módulo
**Contas a Receber**.

------------------------------------------------------------------------

## 11. Contas e bancos

As contas financeiras devem representar os locais onde os recursos
existem.

Exemplos:

-   bancos;
-   contas digitais;
-   carteira;
-   dinheiro;
-   contas de investimento.

Cada conta pode possuir:

``` text
saldo inicial
saldo atual
tipo
instituição
titular
```

A recomendação é separar o conceito de **conta financeira** do conceito
de instituição bancária.

------------------------------------------------------------------------

## 12. Transferências

Transferências precisam ser tratadas como operação própria.

Exemplo:

``` text
R$ 5.000
Nubank → Itaú
```

Isso não pode gerar uma receita e uma despesa no resultado financeiro.

A operação deve ser registrada como:

``` text
TRANSFERÊNCIA

Origem: Nubank
Destino: Itaú
Valor: R$ 5.000
```

O patrimônio permanece o mesmo, enquanto os saldos individuais das
contas são alterados.

------------------------------------------------------------------------

## 13. Cofrinhos e metas

O material apresenta o conceito de Cofrinhos e a proposta comercial
menciona metas financeiras.

Estrutura recomendada:

``` text
META

Nome
Valor objetivo
Valor atual
Percentual concluído
Prazo
Aportes
Projeção
```

Exemplo:

``` text
Reserva de emergência

Objetivo: R$ 30.000
Atual: R$ 12.500
Progresso: 41,67%
Prazo: 12/2026
```

A IA poderá calcular o aporte necessário para alcançar a meta no prazo.

------------------------------------------------------------------------

## 14. Investimentos

O módulo de investimentos aparece na navegação pessoal.

Para uma primeira versão, recomenda-se uma estrutura de acompanhamento,
sem presumir integração automática com corretoras:

``` text
Ativo
Tipo
Instituição
Quantidade
Preço médio
Valor atual
Data
Rentabilidade
```

Categorias futuras:

-   Ações;
-   FIIs;
-   Renda fixa;
-   Fundos;
-   Criptoativos;
-   Previdência;
-   Outros ativos.

------------------------------------------------------------------------

## 15. Dashboard Empresarial

O dashboard empresarial possui orientação diferente do pessoal.

O foco passa a ser:

-   recebimentos;
-   contas a receber;
-   despesas;
-   fluxo de caixa;
-   resultado;
-   DRE;
-   previsibilidade financeira.

O dashboard empresarial deve responder principalmente:

> Quanto entrou?

> Quanto saiu?

> Quanto temos em caixa?

> Quanto ainda vamos receber?

> Quanto ainda vamos pagar?

> Qual é o resultado?

> Como estará o caixa nos próximos meses?

------------------------------------------------------------------------

## 16. Contas a Receber

Estrutura:

``` text
RECEBÍVEL

Cliente
Descrição
Valor
Vencimento
Categoria
Centro de custo
Status
Data de recebimento
```

Status:

-   A receber;
-   Recebido;
-   Atrasado;
-   Cancelado.

------------------------------------------------------------------------

## 17. Contas a Pagar

Embora a navegação apresentada enfatize recebimentos e gastos, a
arquitetura empresarial deve contemplar contas a pagar como contraparte
necessária ao fluxo de caixa.

Estrutura:

``` text
PAGÁVEL

Fornecedor
Descrição
Valor
Vencimento
Categoria
Centro de custo
Conta
Status
Data de pagamento
```

Status:

-   A pagar;
-   Pago;
-   Atrasado;
-   Cancelado.

------------------------------------------------------------------------

## 18. DRE

O material comercial apresenta DRE automatizado.

A estrutura recomendada para nosso produto é:

``` text
DRE
│
├── Receita Bruta
├── Deduções
├── Receita Líquida
├── Custos
├── Lucro Bruto
├── Despesas Operacionais
├── Resultado Operacional
├── Resultado Financeiro
└── Lucro / Prejuízo
```

O DRE não deve ser calculado diretamente apenas pela classificação de
gasto fixo ou variável.

O lançamento deve possuir uma classificação gerencial própria:

``` text
Lançamento
    ↓
Categoria financeira
    ↓
Classificação gerencial
    ↓
DRE
```

------------------------------------------------------------------------

## 19. Fluxo de Caixa

O sistema deve separar:

### Fluxo realizado

O que efetivamente aconteceu.

### Fluxo projetado

O que está previsto para acontecer.

Estrutura:

``` text
Saldo atual
    +
Recebimentos previstos
    -
Pagamentos previstos
    =
Saldo projetado
```

A previsão pode ser organizada em:

-   30 dias;
-   60 dias;
-   90 dias;
-   períodos personalizados.

------------------------------------------------------------------------

## 20. Centros de custo

A estrutura empresarial deve permitir classificação por centro de custo.

Exemplos:

-   Administrativo;
-   Marketing;
-   Comercial;
-   Operacional;
-   Tecnologia;
-   Financeiro.

Um lançamento pode possuir:

``` text
Despesa
R$ 3.000
Categoria: Marketing
Centro de custo: Marketing
```

Isso permite análises segmentadas e DRE gerencial.

------------------------------------------------------------------------

## 21. Inteligência Artificial

A IA é apresentada como uma camada de inteligência financeira, e não
apenas como um chatbot.

Ela deve ser capaz de analisar:

-   gastos;
-   receitas;
-   cartões;
-   parcelamentos;
-   fluxo de caixa;
-   DRE;
-   comportamento financeiro;
-   metas;
-   investimentos;
-   tendências.

A arquitetura recomendada é:

``` text
Usuário
   │
   ▼
Orquestrador
   │
   ├── Financeiro
   ├── Cartões
   ├── Empresa
   ├── Metas
   └── Patrimônio
   │
   ▼
Motor de cálculo
   │
   ▼
Dados reais
   │
   ▼
LLM
   │
   ▼
Resposta contextualizada
```

A IA não deve inventar números. Toda informação quantitativa precisa ser
obtida por consultas e funções internas.

------------------------------------------------------------------------

## 22. Funções da IA

Catálogo inicial recomendado:

``` text
get_dashboard()
get_balance()
get_income()
get_expenses()
get_fixed_expenses()
get_variable_expenses()

get_categories()
get_category_breakdown()

get_accounts()
get_account_balance()

get_credit_cards()
get_credit_card_limit()
get_credit_card_invoice()
get_installments()

get_receivables()
get_payables()

get_cash_flow()
get_cash_flow_projection()

get_dre()

get_cost_centers()

get_goals()
get_goal_progress()

get_investments()
get_net_worth()

compare_periods()
detect_anomalies()
forecast_cash_flow()
```

------------------------------------------------------------------------

## 23. Modelo de dados conceitual

A arquitetura inicial recomendada é:

``` text
users
│
└── financial_spaces
      │
      ├── accounts
      ├── categories
      ├── subcategories
      ├── cost_centers
      ├── transactions
      ├── recurring_transactions
      ├── credit_cards
      ├── credit_card_invoices
      ├── installments
      ├── receivables
      ├── payables
      ├── goals
      ├── investments
      └── reports
```

Além disso:

``` text
users
│
└── ai_conversations
```

------------------------------------------------------------------------

## 24. Espaços financeiros

Uma melhoria estrutural recomendada em relação à simples divisão PF/PJ é
o conceito de **Espaços Financeiros**.

Exemplo:

``` text
Usuário
│
├── Pessoal
├── Britto & Fiuza Advogados
└── Outro negócio
```

Cada espaço possui seus próprios:

-   lançamentos;
-   contas;
-   cartões;
-   categorias;
-   centros de custo;
-   metas;
-   relatórios.

Posteriormente pode existir um **Dashboard Consolidado**.

------------------------------------------------------------------------

## 25. Melhorias propostas em relação ao produto de referência

A engenharia reversa não deve resultar em uma cópia literal.

Melhorias recomendadas:

### 25.1. Espaços financeiros

Permitir múltiplas entidades financeiras por usuário.

### 25.2. Dashboard configurável

Permitir que o usuário escolha quais indicadores visualizar.

### 25.3. Calendário financeiro

Exibir:

-   receitas;
-   despesas;
-   vencimentos;
-   faturas;
-   parcelas;
-   eventos financeiros.

### 25.4. Patrimônio líquido

``` text
Ativos
-
Passivos
=
Patrimônio líquido
```

### 25.5. Planejado x realizado

Disponível tanto para PF quanto para PJ.

### 25.6. Alertas inteligentes

Exemplo:

> Sua fatura aumentou significativamente em relação à média dos últimos
> meses.

### 25.7. IA proativa

A IA não deve depender exclusivamente de perguntas do usuário.

Ela pode apresentar:

-   alterações relevantes;
-   riscos;
-   oportunidades;
-   desvios de orçamento;
-   tendências;
-   projeções.

------------------------------------------------------------------------

## 26. O que foi efetivamente confirmado

A análise do material público permite considerar como identificados:

-   Dashboard pessoal;
-   Dashboard empresarial;
-   Gastos fixos;
-   Gastos variáveis;
-   Cartões;
-   Recebimentos;
-   Contas;
-   Bancos;
-   Investimentos;
-   Cofrinhos/metas;
-   DRE;
-   Fluxo de caixa;
-   A receber;
-   Centros de custo;
-   IA financeira;
-   categorização inteligente;
-   parcelamentos;
-   previsão financeira;
-   visão por períodos;
-   utilização em diferentes dispositivos.

------------------------------------------------------------------------

## 27. O que permanece como inferência

Não foi possível confirmar diretamente, apenas pelo material público:

-   modelo exato do banco de dados;
-   regras internas de competência;
-   algoritmo de recorrência;
-   regras internas de cálculo do DRE;
-   funcionamento completo das faturas;
-   integrações bancárias;
-   Open Finance;
-   regras internas da IA;
-   permissões de usuários;
-   algoritmo de categorização;
-   algoritmo de previsão;
-   arquitetura de backend;
-   infraestrutura;
-   mecanismos de conciliação bancária.

Esses pontos deverão ser definidos para nosso produto independentemente
de como o Finest os implementa.

------------------------------------------------------------------------

## 28. Princípio arquitetural definitivo

A principal conclusão desta primeira engenharia reversa é:

``` text
                    LANÇAMENTOS
                         │
          ┌──────────────┼──────────────┐
          ▼              ▼              ▼
       PESSOAL        EMPRESA           IA
          │              │              │
       Dashboard       DRE          Análise
       Cartões         Caixa        Previsão
       Metas           A receber    Recomendações
       Investimentos   Custos       Insights
```

O produto deve ser construído a partir de um **motor financeiro
central**, e todas as demais funcionalidades devem consumir esse núcleo.

O dashboard não é o produto.

O dashboard é uma representação do motor financeiro.

A IA também não é o produto.

A IA é uma camada de inteligência sobre os dados estruturados do motor
financeiro.

------------------------------------------------------------------------

## 29. Ordem recomendada de desenvolvimento

### Fase 1 --- Core Financeiro

-   Autenticação;
-   Usuários;
-   Espaços financeiros;
-   Contas;
-   Categorias;
-   Subcategorias;
-   Lançamentos;
-   Receitas;
-   Despesas;
-   Transferências.

### Fase 2 --- Financeiro Avançado

-   Recorrências;
-   Parcelamentos;
-   Cartões;
-   Faturas;
-   Contas a pagar;
-   Contas a receber;
-   Metas.

### Fase 3 --- Gestão Empresarial

-   Centros de custo;
-   Fluxo de caixa;
-   DRE;
-   Projeções;
-   Relatórios.

### Fase 4 --- Patrimônio

-   Investimentos;
-   Ativos;
-   Passivos;
-   Patrimônio líquido.

### Fase 5 --- Inteligência

-   Consultas em linguagem natural;
-   Análises;
-   Comparações;
-   Previsões;
-   Detecção de anomalias;
-   Recomendações;
-   IA proativa.

------------------------------------------------------------------------

## 30. Próximo documento

A partir desta análise, o próximo artefato recomendado é:

**02 --- Mapa Completo de Telas e Fluxos**

Esse documento deverá transformar a arquitetura conceitual em
especificação de interface, detalhando:

-   todas as telas;
-   sidebar;
-   headers;
-   dashboards;
-   tabelas;
-   cards;
-   formulários;
-   modais;
-   filtros;
-   estados vazios;
-   estados de erro;
-   ações;
-   navegação;
-   fluxos PF;
-   fluxos PJ;
-   fluxos de cartões;
-   fluxos de lançamentos;
-   fluxos de metas;
-   fluxos de relatórios;
-   fluxos da IA.

Somente depois desse mapa deverá ser definida a implementação técnica.
