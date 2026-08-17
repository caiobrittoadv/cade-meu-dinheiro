# 06 --- Motor Financeiro e Regras de Negócio

## Cadê Meu Dinheiro?

**Versão:** 1.0\
**Status:** Especificação oficial das regras financeiras\
**Projeto:** Cadê Meu Dinheiro?\
**Base:** PRD v2.0 + Mapa de Telas, Fluxos e UX + Modelo de Dados v1.0

------------------------------------------------------------------------

# 1. Objetivo

Este documento define as regras matemáticas, financeiras e operacionais
que determinam como o Cadê Meu Dinheiro? interpreta, registra, calcula e
apresenta o dinheiro do usuário.

Ele é a fonte oficial para o comportamento do backend financeiro.

O princípio central é:

> **O banco de dados armazena fatos. O Motor Financeiro interpreta esses
> fatos e produz saldos, compromissos, resultados e indicadores.**

Nenhuma tela deve implementar regras financeiras por conta própria.

------------------------------------------------------------------------

# 2. Princípios Fundamentais

## 2.1. Fonte única de verdade

O estado financeiro deve ser calculado a partir de lançamentos
financeiros confirmados e das entidades financeiras relacionadas.

Dashboard, relatórios, IA e notificações devem consultar o Motor
Financeiro.

## 2.2. IA não calcula dinheiro

A IA pode explicar números, mas não deve inventá-los nem realizar
cálculos financeiros diretamente a partir de texto livre.

A IA consulta ferramentas financeiras estruturadas.

## 2.3. Documento não é lançamento

Uma nota, fatura ou comprovante pode gerar uma proposta.

Somente a confirmação transforma a proposta em fato financeiro.

## 2.4. Transferência não é receita nem despesa

Mover dinheiro entre contas próprias não altera o patrimônio
consolidado.

## 2.5. Cartão exige tratamento separado

A compra no cartão representa uma obrigação de pagamento, enquanto o
pagamento da fatura representa a saída efetiva de dinheiro da conta.

O sistema não pode contar os dois como despesas.

## 2.6. Histórico não deve ser destruído

Alterações relevantes devem ser auditáveis.

------------------------------------------------------------------------

# 3. Conceitos Financeiros

O sistema deve distinguir pelo menos:

1.  saldo atual;
2.  saldo disponível;
3.  saldo projetado;
4.  receitas;
5.  despesas;
6.  compromissos futuros;
7.  limite de cartão;
8.  valor utilizado do cartão;
9.  patrimônio financeiro consolidado.

Esses conceitos não podem ser tratados como sinônimos.

------------------------------------------------------------------------

# 4. Saldo da Conta

Para uma conta bancária:

``` text
Saldo atual =
Saldo inicial
+ receitas confirmadas
- despesas confirmadas
+ entradas de transferências
- saídas de transferências
```

Compras de cartão não reduzem o saldo da conta no momento da compra.

O saldo da conta é alterado quando a fatura é efetivamente paga.

------------------------------------------------------------------------

# 5. Saldo Consolidado

O saldo consolidado representa o dinheiro atualmente disponível nas
contas financeiras do espaço.

``` text
Saldo consolidado =
Σ saldo atual das contas monetárias
```

Não incluir:

-   limite de cartão;
-   parcelas futuras;
-   metas não retiradas das contas;
-   valores projetados.

------------------------------------------------------------------------

# 6. Saldo Disponível

O produto deve distinguir o saldo bancário do valor que o usuário pode
razoavelmente considerar livre.

Conceito inicial:

``` text
Disponível =
Saldo consolidado
- compromissos vencidos não pagos
- compromissos futuros explicitamente considerados
```

A definição operacional exata dependerá do horizonte escolhido pelo
usuário.

No MVP, a interface deve preferir mostrar:

-   **Saldo atual**
-   **Comprometido**
-   **Disponível estimado**

em vez de apresentar um único número potencialmente ambíguo.

------------------------------------------------------------------------

# 7. Saldo Projetado

O saldo projetado estima quanto dinheiro o usuário terá em determinada
data considerando eventos futuros conhecidos.

``` text
Saldo projetado na data D =
Saldo atual
+ receitas previstas até D
- despesas previstas até D
- pagamentos de cartão previstos até D
+ transferências líquidas previstas até D
```

Eventos futuros devem possuir status ou natureza que os diferencie dos
eventos confirmados.

Nunca misturar projeções com saldo real.

------------------------------------------------------------------------

# 8. Receita

Uma receita é uma entrada financeira que aumenta os recursos do espaço.

Exemplos:

-   salário;
-   freelance;
-   venda;
-   rendimento;
-   reembolso recebido.

Uma receita confirmada aumenta o saldo da conta associada.

------------------------------------------------------------------------

# 9. Despesa

Uma despesa representa consumo, aquisição ou obrigação financeira que
reduz o resultado econômico do período.

Exemplos:

-   aluguel;
-   supermercado;
-   restaurante;
-   combustível;
-   assinatura.

A regra de reconhecimento depende do meio de pagamento.

------------------------------------------------------------------------

# 10. Transferência

Transferência é movimentação entre contas próprias.

Exemplo:

``` text
Nubank → Itaú
R$ 1.000
```

Resultado consolidado:

``` text
Patrimônio antes: R$ 5.000
Patrimônio depois: R$ 5.000
```

A transferência não deve:

-   aumentar receitas;
-   aumentar despesas;
-   alterar resultado mensal.

Ela apenas altera a composição do dinheiro entre contas.

------------------------------------------------------------------------

# 11. Transferência para Terceiros

Se o destinatário não for uma conta própria identificada, a operação
deve ser tratada como despesa ou receita conforme sua natureza.

Exemplo:

``` text
PIX para restaurante
→ despesa

PIX recebido de cliente
→ receita
```

------------------------------------------------------------------------

# 12. Compra no Débito

No débito:

``` text
Compra R$ 100
        ↓
Despesa +100
        ↓
Saldo da conta -100
```

A despesa é reconhecida no momento da compra.

------------------------------------------------------------------------

# 13. Compra em Dinheiro

Mesmo comportamento econômico:

``` text
Compra R$ 50
        ↓
Despesa +50
        ↓
Dinheiro/carteira -50
```

------------------------------------------------------------------------

# 14. Compra no Crédito

Uma compra no cartão cria uma despesa e uma obrigação de pagamento
futura, mas não reduz imediatamente o saldo bancário.

Exemplo:

``` text
Compra: R$ 1.200 em 12x
```

Resultado:

``` text
Despesa comprometida: R$ 1.200
Fatura/obrigações: R$ 1.200
Saída bancária imediata: R$ 0
```

No fluxo de caixa da conta, a saída ocorrerá quando a fatura for paga.

------------------------------------------------------------------------

# 15. Evitar Dupla Contagem do Cartão

O sistema não pode fazer:

``` text
Compra cartão = despesa
+
Pagamento fatura = nova despesa
```

Isso duplicaria o gasto.

O pagamento da fatura deve ser tratado como liquidação de obrigação, não
como nova despesa de consumo.

------------------------------------------------------------------------

# 16. Fatura do Cartão

A fatura agrega obrigações de compras do cartão.

Ela possui:

-   período;
-   fechamento;
-   vencimento;
-   total;
-   status.

O total da fatura deve ser conciliável com os lançamentos que a compõem.

------------------------------------------------------------------------

# 17. Total da Fatura

Conceitualmente:

``` text
Total da fatura =
Σ compras atribuídas à fatura
+ encargos
- créditos
- estornos
```

O sistema deve permitir diferenças justificadas quando existirem itens
que não sejam compras comuns.

------------------------------------------------------------------------

# 18. Fatura Aberta

Enquanto aberta, novas compras podem ser associadas a ela de acordo com
a regra de fechamento do cartão.

O sistema deve permitir atualização do total conforme novos lançamentos.

------------------------------------------------------------------------

# 19. Fechamento da Fatura

Após o fechamento:

-   novas compras não devem ser inseridas nela;
-   devem ser direcionadas para a próxima fatura aplicável;
-   o valor fechado deve permanecer estável, salvo ajustes legítimos.

------------------------------------------------------------------------

# 20. Vencimento da Fatura

O vencimento representa a data limite para pagamento.

O sistema deve distinguir:

``` text
data de compra
data de fechamento
data de vencimento
data de pagamento
```

------------------------------------------------------------------------

# 21. Pagamento da Fatura

Quando a fatura for paga:

``` text
Conta bancária
- valor pago

Obrigação da fatura
- valor liquidado
```

O pagamento não cria uma nova despesa de categoria.

------------------------------------------------------------------------

# 22. Pagamento Parcial

Se permitido pelo produto, o sistema deve registrar:

``` text
Valor da fatura: R$ 1.000
Pagamento: R$ 600
Saldo da obrigação: R$ 400
```

Juros e encargos posteriores devem ser registrados separadamente quando
identificados.

------------------------------------------------------------------------

# 23. Pagamento Integral

Quando:

``` text
valor pago >= valor devido
```

a fatura pode ser marcada como:

``` text
PAID
```

Eventual excesso deve ser tratado explicitamente como crédito/ajuste,
nunca simplesmente descartado.

------------------------------------------------------------------------

# 24. Parcelamento

Uma compra parcelada representa:

-   valor total;
-   quantidade de parcelas;
-   valor individual;
-   datas previstas;
-   vínculo com faturas.

Exemplo:

``` text
Compra total: R$ 1.200
12 parcelas
Parcela: R$ 100
```

------------------------------------------------------------------------

# 25. Reconhecimento de Parcelamento

Para fins de comprometimento:

``` text
Comprometimento total = R$ 1.200
```

Para fluxo mensal:

``` text
Mês 1 = R$ 100
Mês 2 = R$ 100
...
Mês 12 = R$ 100
```

A interface deve deixar claro que:

> uma coisa é o valor total comprometido e outra é o impacto de cada
> parcela no mês.

------------------------------------------------------------------------

# 26. Parcelas Futuras

O sistema deve calcular:

``` text
Parcelas restantes =
Total de parcelas - parcelas liquidadas
```

E:

``` text
Comprometimento futuro =
Σ parcelas futuras
```

------------------------------------------------------------------------

# 27. Compra Parcelada Importada da Fatura

Se a fatura informar algo como:

``` text
LOJA X
R$ 100,00
04/12
```

o sistema deve tentar identificar:

``` text
total estimado: R$ 1.200
parcela atual: 4
total de parcelas: 12
```

Se não houver informação suficiente, não inventar o total.

------------------------------------------------------------------------

# 28. Estorno

Estorno é a reversão total ou parcial de uma operação anterior.

Exemplo:

``` text
Despesa original: R$ 300
Estorno: R$ 100
```

Resultado líquido:

``` text
Despesa efetiva: R$ 200
```

O estorno deve permanecer vinculado ao lançamento original.

------------------------------------------------------------------------

# 29. Cancelamento

Cancelamento impede que uma operação pendente se torne efetiva.

Se a transação já tiver afetado resultados confirmados, deve ser
utilizada reversão/estorno em vez de simplesmente apagar o histórico.

------------------------------------------------------------------------

# 30. Reembolso

Reembolso recebido relacionado a uma despesa pode ser tratado como:

-   receita específica de reembolso; ou
-   ajuste da despesa original.

Para o MVP, recomenda-se manter como entrada vinculada à despesa
original, preservando o histórico.

Exemplo:

``` text
Despesa: R$ 500
Reembolso: R$ 200

Custo líquido: R$ 300
```

------------------------------------------------------------------------

# 31. Recorrências

Uma recorrência representa uma regra futura, não necessariamente uma
transaction já realizada.

Exemplo:

``` text
Netflix
R$ 39,90
Mensal
```

A recorrência gera eventos previstos.

Somente quando o evento for confirmado deve tornar-se lançamento
financeiro efetivo.

------------------------------------------------------------------------

# 32. Recorrência e Alteração de Valor

Se o valor variar:

``` text
Internet
R$ 100
R$ 110
R$ 108
```

o sistema não deve obrigar todos os meses ao mesmo valor.

A recorrência representa um padrão, podendo gerar uma sugestão com valor
ajustável.

------------------------------------------------------------------------

# 33. Salário Recorrente

O salário pode ser modelado como receita recorrente.

Mas o lançamento mensal deve continuar podendo ser corrigido.

Exemplo:

``` text
Previsto: R$ 5.000
Recebido: R$ 4.873,22
```

O valor efetivamente confirmado deve prevalecer sobre a previsão.

------------------------------------------------------------------------

# 34. Competência

O sistema deve diferenciar a data em que o evento aconteceu da data em
que o dinheiro saiu ou entrou.

Exemplo:

``` text
Compra no cartão:
15/08

Pagamento da fatura:
10/09
```

Para análise de consumo:

``` text
Despesa = agosto
```

Para fluxo de caixa:

``` text
Saída bancária = setembro
```

Essa distinção é essencial.

------------------------------------------------------------------------

# 35. Resultado Mensal

Para fins de análise de hábitos:

``` text
Resultado do mês =
Receitas reconhecidas no período
- despesas reconhecidas no período
```

O critério de reconhecimento deve ser consistente em todo o sistema.

------------------------------------------------------------------------

# 36. Fluxo de Caixa

Para fluxo de caixa:

``` text
Fluxo líquido =
Entradas efetivas
- saídas efetivas
```

O pagamento da fatura aparece como saída de caixa.

A compra do cartão não aparece novamente como saída de caixa.

------------------------------------------------------------------------

# 37. Dois Eixos Financeiros

O sistema deve trabalhar com dois eixos:

### Eixo econômico

> O que eu consumi/ganhei?

### Eixo de caixa

> Quando o dinheiro efetivamente entrou/saiu?

Essa separação resolve grande parte das inconsistências de cartão.

------------------------------------------------------------------------

# 38. Comprometimento Futuro

Comprometimento representa obrigações já conhecidas que ainda afetarão
períodos futuros.

Exemplos:

-   parcelas;
-   faturas abertas;
-   recorrências;
-   contas futuras.

Não confundir:

``` text
comprometido ≠ pago
```

------------------------------------------------------------------------

# 39. Comprometimento do Cartão

Deve considerar:

``` text
Compras ainda não pagas
+
parcelas futuras
+
encargos conhecidos
-
créditos/estornos
```

O limite disponível deve refletir o uso efetivo do cartão conforme as
regras da instituição e os dados disponíveis.

------------------------------------------------------------------------

# 40. Limite do Cartão

Conceito inicial:

``` text
Limite disponível =
Limite total
- limite comprometido
```

O valor exibido deve ser tratado como estimativa quando não houver
sincronização bancária real.

------------------------------------------------------------------------

# 41. Fatura Atual vs Comprometimento Total

Exemplo:

``` text
Limite: R$ 5.000

Fatura atual: R$ 1.000

Parcelas futuras: R$ 1.500

Comprometimento conhecido: R$ 2.500
```

Não dizer que a fatura atual é R\$ 2.500.

São conceitos diferentes.

------------------------------------------------------------------------

# 42. Receita Prevista

Receitas futuras podem vir de:

-   recorrências;
-   lançamentos previstos;
-   importações;
-   integrações futuras.

Não entram no saldo atual enquanto não confirmadas.

------------------------------------------------------------------------

# 43. Despesa Prevista

Mesma regra.

Uma conta futura:

``` text
Internet
R$ 100
25/08
```

não deve reduzir o saldo atual antes da efetiva saída.

Ela pode reduzir o saldo projetado.

------------------------------------------------------------------------

# 44. Conciliação

Conciliação é o processo de comparar:

``` text
o que o sistema acredita
vs.
o que a fonte externa informa
```

Fontes:

-   fatura;
-   extrato;
-   banco;
-   Open Finance;
-   documento.

O MVP deve suportar uma forma básica de conciliação para importações.

------------------------------------------------------------------------

# 45. Conciliação de Fatura

Ao importar uma fatura:

``` text
Lançamentos existentes
        vs.
Lançamentos importados
```

O sistema tenta encontrar correspondências.

Critérios:

-   valor;
-   data;
-   estabelecimento;
-   cartão;
-   parcela;
-   referência externa.

------------------------------------------------------------------------

# 46. Conciliação Não Deve Apagar Dados

Se houver divergência:

> "Encontramos uma diferença."

O usuário deve poder:

-   usar importado;
-   manter existente;
-   criar novo;
-   ignorar.

Nunca apagar silenciosamente um lançamento existente.

------------------------------------------------------------------------

# 47. Duplicidade

A detecção deve gerar uma probabilidade, não uma decisão automática
baseada em um único campo.

Exemplo:

``` text
Valor: igual
Data: igual
Estabelecimento: semelhante
Cartão: igual

→ alta probabilidade
```

Se:

``` text
Valor: igual
Data: diferente
Estabelecimento: diferente

→ baixa probabilidade
```

------------------------------------------------------------------------

# 48. Confirmação de Duplicidade

Quando confirmada:

``` text
Proposal → DUPLICATE
```

O lançamento original permanece preservado.

------------------------------------------------------------------------

# 49. Categorias

Toda despesa confirmada deve possuir categoria, inclusive:

``` text
Outros
```

É melhor utilizar "Outros" do que bloquear o lançamento.

------------------------------------------------------------------------

# 50. Aprendizado de Categoria

Se o usuário corrigir repetidamente uma classificação, o sistema pode
aumentar a prioridade daquela preferência.

Exemplo:

``` text
Merchant:
Uber

Sistema:
Transporte

Usuário:
Lazer
```

A correção deve alimentar uma preferência, mas nunca alterar lançamentos
antigos automaticamente sem autorização.

------------------------------------------------------------------------

# 51. Fechamento Mensal

O fechamento mensal é uma camada de análise.

Deve calcular:

``` text
Receitas
Despesas
Resultado
Categorias
Comparação
Comprometimentos
```

Não deve criar novos lançamentos.

------------------------------------------------------------------------

# 52. Mês Atual

O sistema deve possuir um período de referência explícito.

Exemplo:

``` text
01/08/2026 → 31/08/2026
```

Todas as métricas da tela devem utilizar o mesmo período, salvo
indicação contrária.

------------------------------------------------------------------------

# 53. Comparação com Mês Anterior

Para uma métrica:

``` text
Variação absoluta =
Valor atual - valor anterior
```

E:

``` text
Variação percentual =
((Valor atual - valor anterior) / valor anterior) × 100
```

Se o valor anterior for zero, não apresentar percentual artificial.

Mostrar:

> "Não havia gastos nessa categoria no mês anterior."

------------------------------------------------------------------------

# 54. Categoria e Percentual da Renda

Exemplo:

``` text
Alimentação = R$ 820
Receita = R$ 5.000
```

Percentual:

``` text
820 / 5000 × 100 = 16,4%
```

O sistema deve deixar claro se o percentual é sobre:

-   renda;
-   despesas;
-   orçamento.

------------------------------------------------------------------------

# 55. Principais Categorias

O ranking deve ser baseado no total efetivo reconhecido no período.

Não incluir:

-   transferências;
-   propostas pendentes;
-   transações canceladas.

------------------------------------------------------------------------

# 56. Meta Financeira

Uma meta possui:

``` text
objetivo
valor acumulado
valor restante
prazo
```

Fórmula:

``` text
Valor restante =
Meta - valor acumulado
```

Se menor que zero:

``` text
Valor restante = 0
```

------------------------------------------------------------------------

# 57. Progresso da Meta

``` text
Progresso =
valor acumulado / meta × 100
```

Limitar visualmente a 100%, mesmo que o usuário ultrapasse.

O sistema pode exibir separadamente:

> "Meta superada em R\$ X."

------------------------------------------------------------------------

# 58. Aportes

Aporte deve estar vinculado a uma movimentação real quando possível.

O sistema não deve simplesmente aumentar o progresso da meta sem
registrar a origem do dinheiro quando o aporte representar movimentação
financeira.

------------------------------------------------------------------------

# 59. Desfazer

Operações reversíveis devem permitir desfazer quando tecnicamente
seguro.

Exemplo:

> Lançamento excluído.

**Desfazer**

O desfazer deve recuperar o estado anterior sem quebrar referências.

------------------------------------------------------------------------

# 60. Exclusão

Para transações confirmadas:

Preferência:

``` text
soft delete / cancelamento
```

em vez de apagar fisicamente.

Relatórios históricos devem respeitar o status.

------------------------------------------------------------------------

# 61. Status Financeiros

## Transaction

``` text
PENDING
CONFIRMED
CANCELLED
```

## Invoice

``` text
OPEN
CLOSED
PAID
OVERDUE
CANCELLED
```

## Proposal

``` text
PROPOSED
REVIEW_REQUIRED
CONFIRMED
REJECTED
DUPLICATE
```

## Recurrence

``` text
ACTIVE
PAUSED
COMPLETED
CANCELLED
```

------------------------------------------------------------------------

# 62. Invariantes Financeiros

Estas regras não podem ser violadas.

## Invariante 1

Transferência entre contas próprias não altera patrimônio consolidado.

## Invariante 2

Transaction cancelada não entra em cálculos ativos.

## Invariante 3

Proposal não confirmada não entra em saldo.

## Invariante 4

Pagamento de fatura não cria nova despesa de consumo.

## Invariante 5

Uma parcela não pode pertencer a duas faturas simultaneamente.

## Invariante 6

Uma fatura pertence a um cartão.

## Invariante 7

Uma transaction pertence a um Financial Space.

## Invariante 8

Categoria usada por transaction deve pertencer ao mesmo espaço ou ser
categoria global autorizada.

## Invariante 9

Valores monetários nunca podem depender de floating point.

## Invariante 10

Uma importação repetida não deve criar duplicidade silenciosa.

------------------------------------------------------------------------

# 63. Idempotência Financeira

Operações de importação e confirmação devem possuir identificadores
idempotentes quando possível.

Exemplo:

``` text
Confirmar proposal ABC
```

Se a mesma requisição for repetida:

``` text
não criar duas transactions.
```

O backend deve reconhecer que a operação já foi concluída.

------------------------------------------------------------------------

# 64. Operação Atômica de Confirmação

Ao confirmar uma proposta:

``` text
BEGIN

validar proposal
verificar duplicidade
criar transaction
associar origem
atualizar proposal
registrar auditoria

COMMIT
```

Se houver erro:

``` text
ROLLBACK
```

------------------------------------------------------------------------

# 65. Atualização de Saldo

O saldo não deve depender de uma sequência de alterações manuais.

Fonte:

``` text
saldo inicial
+
movimentações confirmadas
```

Snapshots podem existir para performance, mas devem poder ser
reconstruídos.

------------------------------------------------------------------------

# 66. Reconstruibilidade

O sistema deve ser capaz de reconstruir o saldo de uma conta a partir do
histórico.

Isso é importante para detectar:

-   bugs;
-   divergências;
-   alterações indevidas;
-   problemas de importação.

------------------------------------------------------------------------

# 67. Cache

Valores como:

-   saldo;
-   totais por categoria;
-   totais de fatura;

podem ser cacheados.

Mas o cache não é a fonte de verdade.

Se necessário:

``` text
cache
↓
invalidado
↓
recalculado a partir dos fatos
```

------------------------------------------------------------------------

# 68. Dashboard

O dashboard deve consumir serviços do Motor Financeiro.

Exemplo conceitual:

``` text
get_current_balance()
get_period_summary()
get_category_breakdown()
get_card_commitment()
get_month_comparison()
```

Não executar SQL financeiro diretamente na camada visual.

------------------------------------------------------------------------

# 69. IA Financeira

A IA deve utilizar ferramentas como:

``` text
get_income
get_expenses
get_balance
get_category_total
get_card_invoice
get_future_commitments
compare_periods
get_recurring_expenses
```

Depois:

``` text
dados estruturados
↓
interpretação da IA
↓
resposta
```

------------------------------------------------------------------------

# 70. Respostas da IA

A IA deve distinguir:

### Dado confirmado

> "Você gastou R\$ 820 em alimentação."

### Estimativa

> "Se as despesas recorrentes se mantiverem, sua projeção é..."

### Ausência de dados

> "Ainda não tenho dados suficientes para estimar isso."

Nunca transformar ausência de dados em certeza.

------------------------------------------------------------------------

# 71. Pergunta "Posso gastar R\$ 300?"

Essa pergunta exige mais cuidado.

A resposta não deve ser baseada apenas no saldo atual.

Deve considerar:

``` text
saldo atual
+
receitas previstas
-
compromissos futuros
-
obrigações conhecidas
```

E o sistema deve deixar claro que se trata de uma estimativa.

------------------------------------------------------------------------

# 72. Detecção de Anomalias

Pode existir futuramente um indicador:

> "Seu gasto com alimentação está acima do padrão."

Critério inicial possível:

``` text
média dos últimos N períodos
vs.
período atual
```

Isso deve ser tratado como análise, não como fato absoluto.

------------------------------------------------------------------------

# 73. Fechamento Mensal e Dados Incompletos

Se o sistema detectar poucos lançamentos:

> **Seu fechamento ainda está incompleto.**

Exemplo:

> Registramos R\$ 2.300 em despesas, mas sua fatura ainda não foi
> importada.

Isso é melhor do que apresentar:

> "Você gastou R\$ 2.300 no mês."

como se o número fosse completo.

------------------------------------------------------------------------

# 74. Cobertura Financeira

O produto deve, futuramente, estimar a qualidade dos dados do período.

Exemplo:

``` text
Cobertura do mês: 82%
```

Critérios possíveis:

-   contas cadastradas;
-   faturas importadas;
-   recorrências conhecidas;
-   documentos processados;
-   movimentações esperadas.

Não mostrar essa métrica no MVP até que o cálculo seja confiável.

------------------------------------------------------------------------

# 75. Importação de Extrato

Quando disponível:

``` text
Extrato
↓
Movimentações
↓
Matching
↓
Novas transactions
ou
Conciliação
```

A importação deve evitar duplicidade.

------------------------------------------------------------------------

# 76. Regra de Importação

Para cada movimentação importada:

1.  normalizar descrição;
2.  identificar data;
3.  identificar valor;
4.  identificar conta;
5.  buscar correspondência;
6.  calcular similaridade;
7.  classificar;
8.  propor;
9.  confirmar.

------------------------------------------------------------------------

# 77. Normalização de Estabelecimentos

O sistema pode normalizar:

``` text
IFOOD*12345
I FOOD
IFD*XYZ
```

para um merchant lógico quando houver confiança suficiente.

A normalização não deve apagar a descrição original.

Manter:

``` text
original_description
normalized_merchant
```

------------------------------------------------------------------------

# 78. Despesas Compartilhadas

O MVP pode registrar a despesa integral no usuário.

Rateio entre pessoas pode ser implementado posteriormente.

Não complicar o núcleo antes de validar o uso principal.

------------------------------------------------------------------------

# 79. Dinheiro em Espécie

A conta `CASH` deve ser tratada como uma conta monetária.

Quando o usuário saca:

``` text
Conta bancária -R$ 500
Dinheiro +R$ 500
```

Isso é transferência.

Quando gasta:

``` text
Dinheiro -R$ 50
Despesa +R$ 50
```

------------------------------------------------------------------------

# 80. Saque

Saque de conta para dinheiro físico:

``` text
Transferência:
Banco → Dinheiro
```

Não é despesa.

------------------------------------------------------------------------

# 81. Depósito

Depósito de dinheiro físico em conta:

``` text
Transferência:
Dinheiro → Banco
```

Não é receita.

------------------------------------------------------------------------

# 82. Ajuste de Saldo

O usuário poderá precisar corrigir o saldo inicial ou fazer ajuste.

Esse recurso deve existir, mas ser claramente identificado.

Exemplo:

> Ajuste de saldo

O ajuste não deve ser silenciosamente tratado como salário ou despesa.

------------------------------------------------------------------------

# 83. Saldo Inicial

O saldo inicial é um estado de referência.

Alterá-lo pode alterar todo o saldo histórico derivado.

Por isso, mudanças devem ser auditadas.

------------------------------------------------------------------------

# 84. Períodos Futuros

Lançamentos futuros devem possuir estado adequado.

Exemplo:

``` text
SCHEDULED
```

Eles não entram no saldo atual, mas entram em projeções.

------------------------------------------------------------------------

# 85. Projeção Mensal

Para cada mês futuro:

``` text
saldo inicial projetado
+
receitas previstas
-
despesas previstas
-
pagamentos de cartão
```

Resultado:

``` text
saldo final projetado
```

------------------------------------------------------------------------

# 86. Alertas

Alertas podem ser gerados por regras.

Exemplos:

-   fatura próxima do vencimento;
-   saldo projetado negativo;
-   gasto fora do padrão;
-   parcela relevante;
-   recorrência aumentada.

Alertas não devem alterar dados.

------------------------------------------------------------------------

# 87. Motor de Regras

As regras financeiras devem ficar em uma camada de domínio.

Conceitualmente:

``` text
Transaction Service
Account Service
Card Service
Invoice Service
Installment Service
Recurrence Service
Goal Service
Projection Service
Analysis Service
```

Esses serviços devem utilizar regras comuns.

------------------------------------------------------------------------

# 88. Proibição de Regra Financeira na UI

A interface não deve decidir:

> "Esse gasto conta como despesa?"

Isso pertence ao domínio financeiro.

A UI apenas solicita a operação.

------------------------------------------------------------------------

# 89. Proibição de Regra Financeira na IA

A IA não deve decidir:

> "O saldo é R\$ 2.000."

Ela consulta o Motor Financeiro.

------------------------------------------------------------------------

# 90. Consistência entre Mobile e Desktop

O mesmo evento financeiro deve produzir o mesmo resultado em:

-   mobile;
-   desktop;
-   API;
-   importação;
-   IA.

A interface não possui regras próprias.

------------------------------------------------------------------------

# 91. Performance

Consultas recorrentes devem ter serviços agregadores.

Exemplos:

``` text
MonthlySummary
CategorySummary
AccountBalance
CardSummary
CommitmentSummary
```

Esses agregados podem ser materializados ou cacheados.

------------------------------------------------------------------------

# 92. Auditoria de Valores

Mudanças em:

-   valor;
-   data;
-   conta;
-   cartão;
-   categoria;
-   status;

devem poder ser auditadas.

------------------------------------------------------------------------

# 93. Segurança

Todas as operações financeiras devem verificar:

``` text
usuário autenticado
↓
membro do Financial Space
↓
entidade pertence ao Space
↓
permissão
↓
operação
```

Nunca confiar apenas no ID enviado pelo frontend.

------------------------------------------------------------------------

# 94. Regra de Escopo

Exemplo:

``` text
GET /transactions/123
```

Não basta encontrar transaction `123`.

Deve validar:

``` text
transaction.space_id
==
usuário.space_id
```

------------------------------------------------------------------------

# 95. Erros Financeiros

Mensagens de erro devem ser compreensíveis.

Exemplo:

> Não foi possível registrar esta despesa porque a conta selecionada não
> está disponível.

Não expor detalhes internos do banco.

------------------------------------------------------------------------

# 96. Precisão Monetária

Todos os cálculos devem ser determinísticos.

Evitar:

``` text
0.1 + 0.2 = 0.30000000000000004
```

Usar decimal ou unidade mínima inteira.

------------------------------------------------------------------------

# 97. Arredondamento

Arredondamentos devem acontecer em pontos definidos do domínio.

Não arredondar aleatoriamente em cada camada.

Valores apresentados ao usuário devem respeitar:

``` text
BRL → 2 casas decimais
```

------------------------------------------------------------------------

# 98. Fórmulas Principais

## Resultado

``` text
Receitas - Despesas
```

## Saldo

``` text
Saldo inicial + movimentos líquidos
```

## Saldo consolidado

``` text
Σ saldos das contas
```

## Limite disponível

``` text
Limite total - comprometimento
```

## Valor restante da meta

``` text
Meta - acumulado
```

## Progresso

``` text
Acumulado / Meta × 100
```

## Variação

``` text
Atual - Anterior
```

## Variação percentual

``` text
(Atual - Anterior) / Anterior × 100
```

------------------------------------------------------------------------

# 99. Indicadores do Dashboard

O Motor Financeiro deverá fornecer:

``` text
total_income
total_expense
net_result
current_balance
projected_balance
committed_amount
card_current_invoice
card_future_commitment
top_categories
period_variation
goal_progress
```

------------------------------------------------------------------------

# 100. Contrato Conceitual do Dashboard

Exemplo:

``` json
{
  "period": {
    "start": "2026-08-01",
    "end": "2026-08-31"
  },
  "income": 5000.00,
  "expense": 3720.00,
  "result": 1280.00,
  "current_balance": 3730.00,
  "committed": 1240.00,
  "comparison": {
    "previous_expense": 3480.00,
    "variation": 240.00,
    "variation_percent": 6.90
  }
}
```

O valor acima é apenas exemplo de contrato, não dado real.

------------------------------------------------------------------------

# 101. Regras para o Fechamento Mensal

O fechamento deve:

1.  selecionar período;
2.  verificar cobertura dos dados;
3.  calcular receitas;
4.  calcular despesas;
5.  calcular resultado;
6.  calcular categorias;
7.  comparar com período anterior;
8.  calcular compromissos;
9.  identificar pontos relevantes;
10. gerar resumo.

------------------------------------------------------------------------

# 102. Fechamento Não Cria Verdade

O fechamento é uma visão analítica.

Se um lançamento for corrigido posteriormente, o fechamento deve ser
recalculado.

Não criar um "número mágico" independente das transactions.

------------------------------------------------------------------------

# 103. Histórico Mensal

O sistema pode armazenar snapshots para performance, mas deve ser capaz
de recalcular.

Snapshot:

``` text
2026-08
income = ...
expense = ...
```

Fonte primária:

``` text
transactions
```

------------------------------------------------------------------------

# 104. Reconciliação do Histórico

Se houver diferença entre snapshot e cálculo:

``` text
transactions = fonte
snapshot = desatualizado
```

O sistema deve regenerar o snapshot.

------------------------------------------------------------------------

# 105. Regras para Importação de Fatura

Ao receber uma fatura:

``` text
1. identificar cartão
2. identificar período
3. identificar fechamento
4. identificar vencimento
5. extrair lançamentos
6. normalizar merchants
7. reconhecer parcelas
8. procurar duplicidades
9. criar proposals
10. permitir revisão
11. confirmar
12. conciliar total
```

------------------------------------------------------------------------

# 106. Divergência de Total da Fatura

Se:

``` text
Σ lançamentos ≠ total da fatura
```

o sistema deve sinalizar:

> **A soma dos lançamentos não bate com o total informado na fatura.**

Possíveis causas:

-   juros;
-   encargos;
-   estornos;
-   crédito;
-   taxas;
-   erro de leitura;
-   lançamento não reconhecido.

Não ajustar silenciosamente.

------------------------------------------------------------------------

# 107. Encargos

Juros, multas e taxas devem possuir categoria própria ou classificação
adequada.

Exemplo:

``` text
Encargos financeiros
```

Não misturar automaticamente com a compra original.

------------------------------------------------------------------------

# 108. Crédito de Fatura

Créditos podem reduzir o valor líquido da fatura.

Devem ser representados de forma rastreável.

------------------------------------------------------------------------

# 109. Fechamento do Cartão

A compra deve ser associada à fatura correta com base na regra de
fechamento configurada.

Se a informação for insuficiente:

> "Não foi possível determinar com segurança a fatura."

O sistema deve permitir correção.

------------------------------------------------------------------------

# 110. Alteração de Data

Alterar a data de uma compra pode mudar:

-   mês de análise;
-   fatura;
-   parcela;
-   fechamento.

Por isso, a operação deve reavaliar as dependências.

------------------------------------------------------------------------

# 111. Alteração de Valor

Alterar valor pode alterar:

-   saldo;
-   fatura;
-   parcelas;
-   categorias;
-   metas;
-   relatórios.

A operação deve ocorrer de forma transacional.

------------------------------------------------------------------------

# 112. Alteração de Conta

Mover uma despesa de uma conta para outra deve atualizar o fluxo de
caixa das duas contas, sem alterar o total consolidado de despesas.

------------------------------------------------------------------------

# 113. Alteração de Categoria

Alterar categoria:

``` text
Alimentação → Lazer
```

não altera:

-   valor;
-   saldo;
-   resultado.

Altera apenas a distribuição analítica.

------------------------------------------------------------------------

# 114. Reclassificação de Transferência

Se uma operação foi erroneamente registrada como despesa e identificada
como transferência, o sistema deve corrigir o evento sem criar uma nova
despesa.

------------------------------------------------------------------------

# 115. Reprocessamento de Documento

Um documento poderá ser reprocessado.

O reprocessamento:

-   não deve criar automaticamente novas transactions;
-   cria nova tentativa de processing;
-   compara resultados;
-   atualiza a proposal somente após regras de revisão.

------------------------------------------------------------------------

# 116. Versão do Processador

Toda extração deve registrar:

``` text
processor
processor_version
```

Isso permite reproduzir problemas.

------------------------------------------------------------------------

# 117. Regra de Confiança

Uma proposta pode ser:

``` text
HIGH
MEDIUM
LOW
```

Internamente pode usar score numérico.

Regra conceitual:

``` text
alta confiança
→ confirmação simples

média
→ revisão recomendada

baixa
→ revisão obrigatória
```

------------------------------------------------------------------------

# 118. Lançamento Automático Futuro

No MVP:

``` text
proposta → confirmação
```

Futuro:

``` text
usuário autoriza regra
↓
alta confiança
↓
sem duplicidade
↓
lançamento automático
```

Mesmo nesse cenário, deve existir auditoria.

------------------------------------------------------------------------

# 119. Regras de Automação

Uma automação deve possuir:

-   origem;
-   condição;
-   ação;
-   status;
-   data de criação;
-   possibilidade de desativação.

Exemplo:

> Sempre que houver "Netflix", classificar como Assinaturas.

------------------------------------------------------------------------

# 120. Privacidade Financeira

O Motor Financeiro deve operar exclusivamente no Financial Space
autorizado.

A IA deve receber somente os dados necessários para responder.

------------------------------------------------------------------------

# 121. Observabilidade

Operações financeiras críticas devem produzir logs técnicos suficientes
para investigar:

-   falha;
-   duplicidade;
-   cálculo;
-   importação;
-   confirmação;
-   conciliação.

Não registrar dados sensíveis desnecessariamente.

------------------------------------------------------------------------

# 122. Testes Obrigatórios

Antes da implementação final, o Motor Financeiro deve possuir testes
para:

-   receita;
-   despesa;
-   transferência;
-   saldo;
-   cartão;
-   fatura;
-   pagamento;
-   parcelamento;
-   estorno;
-   recorrência;
-   duplicidade;
-   importação;
-   competência;
-   fechamento;
-   projeção;
-   metas.

------------------------------------------------------------------------

# 123. Cenários de Teste Críticos

## Cenário 1 --- Salário

``` text
Saldo inicial = 0
Salário = 5.000

Saldo = 5.000
```

## Cenário 2 --- Despesa

``` text
Saldo = 5.000
Despesa = 500

Saldo = 4.500
```

## Cenário 3 --- Transferência

``` text
Nubank = 5.000
Itaú = 0

Transferência = 1.000

Nubank = 4.000
Itaú = 1.000
Consolidado = 5.000
```

## Cenário 4 --- Cartão

``` text
Saldo bancário = 5.000
Compra cartão = 500

Saldo bancário = 5.000
Despesa econômica = 500
Comprometimento = 500
```

## Cenário 5 --- Pagamento da fatura

``` text
Saldo bancário = 5.000
Pagamento fatura = 500

Saldo bancário = 4.500
Nova despesa = 0
```

------------------------------------------------------------------------

# 124. Cenário --- Parcelamento

``` text
Compra = 1.200
12x

Comprometimento total = 1.200
Parcela atual = 100
Parcelas futuras = 1.100
```

------------------------------------------------------------------------

# 125. Cenário --- Estorno

``` text
Despesa = 300
Estorno = 100

Despesa líquida = 200
```

------------------------------------------------------------------------

# 126. Cenário --- Nota + Fatura

``` text
Nota = 200
Fatura = 200

Resultado:
1 despesa de 200
```

Nunca:

``` text
400
```

------------------------------------------------------------------------

# 127. Cenário --- Fatura Importada Duas Vezes

Primeira:

``` text
37 proposals
37 transactions após confirmação
```

Segunda:

``` text
possíveis duplicidades
```

Resultado esperado:

``` text
0 duplicações silenciosas
```

------------------------------------------------------------------------

# 128. Cenário --- Documento Errado

Se OCR identificar:

``` text
R$ 1.500
```

mas houver baixa confiança:

``` text
proposal = REVIEW_REQUIRED
```

Nunca registrar automaticamente como R\$ 1.500 no MVP.

------------------------------------------------------------------------

# 129. Cenário --- Dados Incompletos

Se não houver conta identificada:

> lançamento pode ser salvo como pendente de associação, conforme regra
> de produto.

Não inventar conta.

------------------------------------------------------------------------

# 130. Regra de Prioridade

Quando houver conflito entre:

1.  documento;
2.  IA;
3.  lançamento existente;
4.  usuário;

a confirmação explícita do usuário deve prevalecer sobre sugestões
automáticas.

------------------------------------------------------------------------

# 131. Hierarquia de Confiança

``` text
Usuário confirmado
        ↓
Fonte bancária confiável
        ↓
Documento legível
        ↓
Extração estruturada
        ↓
IA
        ↓
Inferência
```

Essa hierarquia deve orientar conflitos e revisão.

------------------------------------------------------------------------

# 132. O Motor Financeiro como Núcleo

Arquiteturalmente:

``` text
              ENTRADAS
                 │
       ┌─────────┼─────────┐
       ↓         ↓         ↓
     MANUAL    DOCUMENTO  BANCO
       │         │         │
       └─────────┼─────────┘
                 ↓
             TRANSAÇÕES
                 ↓
         MOTOR FINANCEIRO
                 │
       ┌─────────┼──────────┐
       ↓         ↓          ↓
    SALDOS    FATURAS    PROJEÇÕES
       │         │          │
       └─────────┼──────────┘
                 ↓
       DASHBOARD / RELATÓRIOS
                 ↓
                  IA
```

------------------------------------------------------------------------

# 133. Regra de Ouro

> **Toda informação financeira deve passar por uma regra de domínio
> antes de produzir efeito financeiro.**

Isso vale para:

-   botão;
-   API;
-   importação;
-   IA;
-   OCR;
-   integração bancária.

------------------------------------------------------------------------

# 134. Resultado do Documento

Com estas regras, o Cadê Meu Dinheiro? possui uma definição formal para:

-   dinheiro que entrou;
-   dinheiro que saiu;
-   dinheiro transferido;
-   dinheiro comprometido;
-   dinheiro disponível;
-   dinheiro projetado;
-   cartão;
-   fatura;
-   parcela;
-   recorrência;
-   estorno;
-   fechamento;
-   metas;
-   análise.

O próximo desafio é fazer o sistema transformar documentos imperfeitos
em propostas financeiras confiáveis.

------------------------------------------------------------------------

# 135. Próximo Documento

## 07 --- Motor de Captura + IA

O próximo documento deverá especificar:

-   tipos de documentos;
-   pipeline OCR;
-   classificação documental;
-   extração;
-   normalização;
-   identificação de merchants;
-   categorização;
-   parcelamento;
-   confiança;
-   duplicidade;
-   revisão humana;
-   aprendizado;
-   modelos de IA;
-   ferramentas da IA financeira;
-   guardrails;
-   prompts;
-   contratos estruturados;
-   custos;
-   filas;
-   reprocessamento;
-   observabilidade;
-   segurança dos documentos.

A IA deverá operar **em cima das regras definidas neste documento**, e
nunca substituí-las.
