# 07 --- Motor de Captura e Inteligência Artificial

## Cadê Meu Dinheiro?

**Versão:** 1.0\
**Status:** Especificação oficial do Motor de Captura + IA\
**Projeto:** Cadê Meu Dinheiro?\
**Base:** PRD v2.0 + Mapa de Telas/Fluxos/UX + Modelo de Dados v1.0 +
Motor Financeiro v1.0

------------------------------------------------------------------------

# 1. Objetivo

Este documento define como o Cadê Meu Dinheiro? transforma documentos e
informações não estruturadas em dados financeiros utilizáveis.

O objetivo central é reduzir drasticamente a necessidade de digitação
manual.

O fluxo principal é:

``` text
FOTO / PDF / COMPROVANTE / FATURA
                ↓
        IDENTIFICAÇÃO
                ↓
       OCR / PARSER
                ↓
        EXTRAÇÃO
                ↓
       NORMALIZAÇÃO
                ↓
      INTERPRETAÇÃO IA
                ↓
       VALIDAÇÃO
                ↓
      DUPLICIDADE
                ↓
    PROPOSTA FINANCEIRA
                ↓
      REVISÃO / CONFIRMAÇÃO
                ↓
       MOTOR FINANCEIRO
                ↓
         TRANSACTION
```

A IA não substitui o Motor Financeiro.

Ela prepara e interpreta informação.

------------------------------------------------------------------------

# 2. Princípio Fundamental

> **A IA pode sugerir o que aconteceu. O Motor Financeiro decide o que
> isso significa financeiramente.**

Exemplo:

A IA identifica:

``` text
Supermercado X
R$ 187,42
16/08/2026
```

Ela pode sugerir:

``` text
Categoria: Alimentação
```

Mas a criação do lançamento financeiro depende das regras do Motor
Financeiro e da confirmação exigida.

------------------------------------------------------------------------

# 3. Arquitetura Conceitual

``` text
                  ENTRADA
                     │
      ┌──────────────┼──────────────┐
      ↓              ↓              ↓
    FOTO           PDF          TEXTO/API
      │              │              │
      └──────────────┼──────────────┘
                     ↓
            CLASSIFICADOR
                     ↓
          ┌──────────┴──────────┐
          ↓                     ↓
         OCR                  PARSER
          │                     │
          └──────────┬──────────┘
                     ↓
              EXTRAÇÃO BRUTA
                     ↓
              NORMALIZAÇÃO
                     ↓
            INTERPRETAÇÃO IA
                     ↓
               VALIDAÇÃO
                     ↓
          DUPLICIDADE / MATCHING
                     ↓
           FINANCIAL PROPOSAL
                     ↓
              USUÁRIO / REGRA
                     ↓
            FINANCIAL ENGINE
```

------------------------------------------------------------------------

# 4. Tipos de Entrada

O motor deve suportar:

## 4.1. Nota fiscal

-   foto;
-   imagem;
-   PDF;
-   documento eletrônico quando disponível.

## 4.2. Cupom fiscal

-   foto;
-   imagem;
-   PDF.

## 4.3. Comprovante PIX

-   imagem;
-   print;
-   PDF.

## 4.4. Fatura de cartão

-   PDF;
-   imagem;
-   print.

## 4.5. Extrato

-   PDF;
-   imagem;
-   arquivo estruturado futuramente.

## 4.6. Conta/boleto

-   imagem;
-   PDF.

## 4.7. Entrada manual

Texto fornecido pelo usuário.

Exemplo:

> "Gastei 80 reais no posto hoje."

------------------------------------------------------------------------

# 5. Objetivos do Motor

O motor deve identificar, quando disponível:

-   tipo de documento;
-   estabelecimento;
-   CNPJ/identificador;
-   valor;
-   moeda;
-   data;
-   hora;
-   método de pagamento;
-   conta;
-   cartão;
-   fatura;
-   número da parcela;
-   total de parcelas;
-   itens;
-   quantidades;
-   categorias;
-   taxas;
-   descontos;
-   créditos;
-   estornos;
-   referência externa.

Não deve inventar campos ausentes.

------------------------------------------------------------------------

# 6. Pipeline de Processamento

Cada documento seguirá um pipeline rastreável.

``` text
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

Falhas podem interromper o pipeline.

------------------------------------------------------------------------

# 7. Document Classification

Primeiro o sistema deve determinar o tipo de entrada.

Classes:

``` text
RECEIPT
INVOICE
PIX_RECEIPT
CARD_STATEMENT
BANK_STATEMENT
BILL
OTHER
UNKNOWN
```

A classificação pode utilizar:

-   MIME type;
-   nome do arquivo;
-   texto extraído;
-   layout;
-   sinais visuais;
-   modelo de classificação.

------------------------------------------------------------------------

# 8. Classificação em Baixa Confiança

Se o sistema não conseguir determinar o tipo:

> **Não consegui identificar este documento.**

Opções:

-   tentar processar novamente;
-   escolher o tipo;
-   descartar.

Não executar um fluxo financeiro arbitrário.

------------------------------------------------------------------------

# 9. OCR

Para documentos visuais, o OCR deve transformar imagem em texto e,
quando possível, preservar posição.

Resultado ideal:

``` text
raw_text
+
bounding boxes
+
confidence
```

A posição é importante para documentos complexos.

------------------------------------------------------------------------

# 10. OCR Não é Interpretação

OCR responde:

> "O que está escrito?"

A IA responde:

> "O que isso provavelmente significa?"

Exemplo:

OCR:

``` text
TOTAL 187,42
```

Interpretação:

``` text
total_amount = 187.42
```

------------------------------------------------------------------------

# 11. Pré-processamento de Imagem

Antes do OCR, pode haver:

-   correção de orientação;
-   corte;
-   redução de ruído;
-   contraste;
-   correção de perspectiva;
-   detecção de documento;
-   redimensionamento.

O objetivo é melhorar leitura sem destruir informação.

------------------------------------------------------------------------

# 12. Qualidade da Imagem

O sistema deve detectar sinais de:

-   baixa resolução;
-   documento cortado;
-   excesso de reflexo;
-   desfoque;
-   rotação;
-   ausência de conteúdo.

Se a qualidade for insuficiente:

> **A foto está difícil de ler.**

CTA:

**Tirar outra foto**

------------------------------------------------------------------------

# 13. Parser de PDF

PDFs devem ser analisados primeiro para determinar se possuem texto
nativo.

Preferência:

``` text
PDF com texto
→ parser direto
```

Somente quando necessário:

``` text
PDF escaneado
→ renderização
→ OCR
```

Isso reduz custo e melhora precisão.

------------------------------------------------------------------------

# 14. Extração Estruturada

Após OCR/parser, o sistema deve transformar o conteúdo em estrutura.

Exemplo:

``` json
{
  "document_type": "RECEIPT",
  "merchant": {
    "name": "Supermercado X",
    "document": "00000000000000"
  },
  "transaction": {
    "date": "2026-08-16",
    "total": 187.42,
    "currency": "BRL"
  }
}
```

------------------------------------------------------------------------

# 15. Contrato de Extração

O contrato deve possuir campos explícitos.

Exemplo:

``` json
{
  "document_type": "PIX_RECEIPT",
  "merchant_name": "Empresa X",
  "merchant_document": null,
  "payer_name": "Usuário",
  "amount": 250.00,
  "currency": "BRL",
  "transaction_date": "2026-08-16",
  "transaction_time": "13:42:00",
  "payment_method": "PIX",
  "reference_id": null,
  "confidence": {
    "merchant_name": 0.98,
    "amount": 0.99,
    "transaction_date": 0.96
  }
}
```

------------------------------------------------------------------------

# 16. Regras de Validação da Extração

O backend deve validar:

-   JSON válido;
-   tipos corretos;
-   valores monetários;
-   datas válidas;
-   moeda suportada;
-   campos obrigatórios;
-   consistência.

Uma IA nunca pode enviar diretamente uma operação de banco.

------------------------------------------------------------------------

# 17. Valor Monetário

O sistema deve reconhecer formatos brasileiros:

``` text
R$ 1.250,50
1.250,50
1250,50
R$1250,50
```

Normalização:

``` text
1250.50
```

Internamente conforme o padrão monetário definido no banco.

------------------------------------------------------------------------

# 18. Ambiguidade de Valor

Exemplo:

``` text
1.250
```

Pode representar:

``` text
R$ 1.250,00
```

ou outro formato dependendo do documento.

O sistema deve considerar contexto.

Se houver dúvida relevante:

``` text
REVIEW_REQUIRED
```

------------------------------------------------------------------------

# 19. Data

Aceitar formatos como:

``` text
16/08/2026
16-08-2026
2026-08-16
```

Converter para formato interno padronizado.

Nunca assumir a data atual quando houver uma data legível diferente.

------------------------------------------------------------------------

# 20. Estabelecimento

A IA deve identificar o merchant preservando:

``` text
original_name
normalized_name
```

Exemplo:

``` text
Original:
IFOOD*12345

Normalizado:
iFood
```

A descrição original nunca deve ser perdida.

------------------------------------------------------------------------

# 21. Merchant Matching

O sistema pode manter uma base de normalização.

Exemplo:

``` text
UBER *TRIP
UBER BV
UBER

→ Uber
```

Mas a normalização deve possuir confiança.

------------------------------------------------------------------------

# 22. CNPJ

Quando presente, o CNPJ pode ser utilizado como identificador forte.

Prioridade:

``` text
CNPJ
↓
nome normalizado
↓
nome aproximado
```

Não assumir que nomes iguais representam necessariamente a mesma
empresa.

------------------------------------------------------------------------

# 23. Categoria

A categorização pode considerar:

-   merchant;
-   descrição;
-   itens;
-   histórico do usuário;
-   categoria anterior;
-   contexto da transação;
-   método de pagamento.

Exemplo:

``` text
Uber
→ Transporte
```

------------------------------------------------------------------------

# 24. Hierarquia de Categorização

Prioridade:

``` text
preferência explícita do usuário
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

------------------------------------------------------------------------

# 25. Aprendizado do Usuário

Quando o usuário corrigir:

``` text
Uber
Sistema: Transporte
Usuário: Lazer
```

a preferência pode ser armazenada.

Mas:

> **Uma correção não deve necessariamente reclassificar automaticamente
> o histórico inteiro.**

A aplicação pode perguntar posteriormente se o usuário deseja aplicar a
regra a transações semelhantes.

------------------------------------------------------------------------

# 26. Itens da Nota

Quando o documento permitir, o sistema pode extrair:

``` text
item
quantidade
preço unitário
total
```

Exemplo:

``` json
{
  "description": "Arroz",
  "quantity": 2,
  "unit_price": 25.00,
  "total_price": 50.00
}
```

------------------------------------------------------------------------

# 27. Separação de Itens

O usuário pode escolher:

``` text
Manter como uma despesa
```

ou:

``` text
Separar por categorias
```

O sistema deve preferir simplicidade por padrão.

------------------------------------------------------------------------

# 28. Fatura de Cartão

A fatura exige pipeline específico.

``` text
DOCUMENTO
   ↓
IDENTIFICAR CARTÃO
   ↓
IDENTIFICAR PERÍODO
   ↓
IDENTIFICAR FECHAMENTO
   ↓
IDENTIFICAR VENCIMENTO
   ↓
EXTRAIR LANÇAMENTOS
   ↓
IDENTIFICAR PARCELAS
   ↓
NORMALIZAR
   ↓
DUPLICIDADE
   ↓
PROPOSTAS
```

------------------------------------------------------------------------

# 29. Extração de Fatura

Cada lançamento deve tentar possuir:

``` text
merchant
date
amount
installment_current
installment_total
description
```

Exemplo:

``` text
LOJA X
R$ 100,00
04/12
```

------------------------------------------------------------------------

# 30. Não Inferir Parcela sem Evidência

Se o documento mostrar:

``` text
R$ 100,00
```

não assumir automaticamente:

``` text
1/12
```

Se não houver evidência:

``` text
installment = unknown
```

------------------------------------------------------------------------

# 31. Identificação do Cartão

Preferência:

``` text
últimos 4 dígitos
+
instituição
```

Se houver múltiplos cartões compatíveis:

> **Qual cartão corresponde a esta fatura?**

------------------------------------------------------------------------

# 32. Identificação da Fatura

A fatura deve tentar extrair:

-   mês;
-   fechamento;
-   vencimento;
-   total;
-   identificador da fatura.

Se não houver dados suficientes, permitir seleção manual.

------------------------------------------------------------------------

# 33. Total da Fatura

Após extração:

``` text
Σ lançamentos
vs.
total informado
```

Se houver diferença:

``` text
DIVERGENCE
```

A diferença deve ser investigada.

------------------------------------------------------------------------

# 34. Comprovante PIX

Extrair:

-   pagador;
-   recebedor;
-   valor;
-   data;
-   hora;
-   instituição;
-   identificador;
-   mensagem;
-   tipo de operação.

Depois determinar:

``` text
INCOME
ou
EXPENSE
ou
TRANSFER
```

A direção deve ser baseada no papel do usuário no comprovante.

------------------------------------------------------------------------

# 35. Direção do PIX

Exemplo:

Usuário enviou:

``` text
Usuário → Restaurante
```

Resultado:

``` text
EXPENSE
```

Usuário recebeu:

``` text
Cliente → Usuário
```

Resultado:

``` text
INCOME
```

Usuário transferiu entre contas próprias:

``` text
Conta A → Conta B
```

Resultado:

``` text
TRANSFER
```

------------------------------------------------------------------------

# 36. Comprovante Ambíguo

Se não for possível determinar se o usuário pagou ou recebeu:

> **Você enviou ou recebeu este valor?**

Não adivinhar.

------------------------------------------------------------------------

# 37. Extrato Bancário

Pipeline:

``` text
EXTRATO
↓
IDENTIFICAR CONTA
↓
EXTRAIR MOVIMENTAÇÕES
↓
NORMALIZAR
↓
CLASSIFICAR DIREÇÃO
↓
MATCHING
↓
DUPLICIDADE
↓
PROPOSTAS
```

------------------------------------------------------------------------

# 38. Sinal de Débito/Crédito

O parser deve entender diferentes convenções:

``` text
D
C
-
+
Débito
Crédito
```

A interpretação depende do layout da fonte.

------------------------------------------------------------------------

# 39. Duplicidade

A duplicidade deve utilizar múltiplos sinais:

-   valor;
-   data;
-   merchant;
-   conta;
-   cartão;
-   descrição;
-   referência;
-   parcela.

Um score pode ser calculado:

``` text
duplicate_score = combinação ponderada dos sinais
```

------------------------------------------------------------------------

# 40. Faixas de Duplicidade

Exemplo conceitual:

``` text
0.00–0.39
baixa

0.40–0.74
atenção

0.75–1.00
alta
```

Os limites finais devem ser calibrados com dados reais.

------------------------------------------------------------------------

# 41. Nunca Autoexcluir

Mesmo com alta similaridade:

``` text
não apagar
```

Criar:

``` text
Duplicate Candidate
```

e aplicar a política de confirmação definida pelo produto.

------------------------------------------------------------------------

# 42. Proposal

Toda captura financeira deve resultar em:

``` text
Financial Proposal
```

antes de virar transaction, quando a confirmação for exigida.

------------------------------------------------------------------------

# 43. Proposal Exemplo

``` json
{
  "type": "EXPENSE",
  "description": "Supermercado X",
  "amount": 187.42,
  "date": "2026-08-16",
  "category": {
    "id": "alimentacao",
    "suggested": true
  },
  "account": {
    "id": "nubank",
    "suggested": true
  },
  "confidence": 0.96,
  "status": "REVIEW_REQUIRED"
}
```

------------------------------------------------------------------------

# 44. Confidence Score

A confiança deve existir por campo.

Exemplo:

``` text
merchant = 0.98
amount = 0.99
date = 0.96
category = 0.82
account = 0.55
```

A confiança global não deve esconder campos problemáticos.

------------------------------------------------------------------------

# 45. Campo Crítico

Alguns campos são críticos:

-   valor;
-   tipo;
-   data;
-   conta/cartão;
-   direção;
-   fatura.

Se um campo crítico possuir baixa confiança, a proposta deve exigir
revisão.

------------------------------------------------------------------------

# 46. Revisão Inteligente

O usuário não deve revisar tudo.

Exemplo:

``` text
37 lançamentos

31 OK
4 baixa confiança
2 possíveis duplicidades
```

A interface deve mostrar:

> **Você só precisa conferir 6 lançamentos.**

------------------------------------------------------------------------

# 47. Revisão em Massa

A fatura deve permitir:

-   aceitar vários;
-   corrigir categoria em massa;
-   confirmar todos os itens seguros;
-   revisar apenas exceções.

------------------------------------------------------------------------

# 48. Correção de Categoria

O usuário pode:

``` text
categoria atual
↓
nova categoria
```

A alteração deve atualizar a proposta.

Se confirmada, cria transaction com a categoria escolhida.

------------------------------------------------------------------------

# 49. Correção de Valor

Se o usuário corrigir o valor:

``` text
IA: 187,42
Usuário: 178,42
```

a versão confirmada é:

``` text
178,42
```

O sistema deve registrar que houve correção.

------------------------------------------------------------------------

# 50. Correção de Data

Mesma regra.

A data confirmada pelo usuário prevalece.

------------------------------------------------------------------------

# 51. Correção de Merchant

Manter:

``` text
original_extracted
confirmed_name
```

Isso preserva a rastreabilidade.

------------------------------------------------------------------------

# 52. Reprocessamento

Um documento pode ser reprocessado se:

-   OCR falhar;
-   modelo melhorar;
-   usuário solicitar;
-   parser detectar erro.

Cada tentativa deve ser registrada.

------------------------------------------------------------------------

# 53. Versionamento do Processamento

Registrar:

``` text
processor
version
timestamp
configuration
```

Isso permite comparar:

``` text
modelo v1
vs.
modelo v2
```

------------------------------------------------------------------------

# 54. Reprocessamento Não Duplica

Reprocessar um documento não deve criar automaticamente novas
transactions.

Ele gera nova extração/proposta.

A confirmação continua sendo uma etapa separada.

------------------------------------------------------------------------

# 55. Filas

Processamentos pesados devem utilizar jobs assíncronos.

Exemplo:

``` text
Upload
↓
Job criado
↓
Fila
↓
Worker
↓
OCR
↓
IA
↓
Proposal
↓
Notificação
```

------------------------------------------------------------------------

# 56. Jobs

Tipos possíveis:

``` text
DOCUMENT_CLASSIFICATION
OCR_PROCESSING
DOCUMENT_EXTRACTION
MERCHANT_NORMALIZATION
CATEGORY_CLASSIFICATION
DUPLICATE_DETECTION
INVOICE_PROCESSING
MONTHLY_ANALYSIS
```

------------------------------------------------------------------------

# 57. Retry

Jobs temporariamente falhos podem ser repetidos.

Mas retries devem ser:

-   limitados;
-   idempotentes;
-   observáveis.

Não repetir indefinidamente.

------------------------------------------------------------------------

# 58. Dead Letter Queue

Jobs que falharem repetidamente devem ir para uma fila de erro.

Exemplo:

``` text
3 tentativas
↓
FAILED
↓
DEAD LETTER
```

Isso permite investigação sem bloquear o sistema.

------------------------------------------------------------------------

# 59. Processamento Assíncrono

O usuário não precisa ficar na tela esperando.

Exemplo:

> **Recebemos sua fatura. Estamos organizando seus lançamentos.**

Quando terminar:

> **Sua fatura está pronta para revisão.**

------------------------------------------------------------------------

# 60. Notificação

Eventos importantes:

``` text
DOCUMENT_READY
REVIEW_REQUIRED
PROCESSING_FAILED
DUPLICATE_FOUND
INVOICE_READY
```

------------------------------------------------------------------------

# 61. Limite de Upload

O sistema deve limitar:

-   tamanho;
-   quantidade;
-   formatos;
-   páginas;
-   frequência.

Os limites devem ser configuráveis.

------------------------------------------------------------------------

# 62. Segurança de Arquivos

Todo arquivo deve:

-   ser privado;
-   ter autorização por espaço;
-   passar por validação de MIME;
-   possuir tamanho máximo;
-   ter checksum;
-   ser armazenado fora do banco;
-   possuir retenção definida.

------------------------------------------------------------------------

# 63. Malware e Arquivos Maliciosos

Uploads devem passar por controles apropriados antes de processamento
quando suportado pela infraestrutura.

Não confiar apenas na extensão:

``` text
.pdf
.jpg
.png
```

O conteúdo real deve ser validado.

------------------------------------------------------------------------

# 64. Privacidade

Documentos financeiros são dados sensíveis.

O sistema deve aplicar:

-   criptografia em trânsito;
-   criptografia em repouso;
-   controle de acesso;
-   logs mínimos;
-   retenção;
-   exclusão;
-   segregação por espaço.

------------------------------------------------------------------------

# 65. Dados Enviados a Modelos Externos

Antes de enviar documentos ou dados a serviços de IA externos, a
arquitetura deve avaliar:

-   política de retenção;
-   uso para treinamento;
-   localização dos dados;
-   contrato;
-   segurança;
-   minimização de dados.

Quando possível, enviar somente o necessário.

------------------------------------------------------------------------

# 66. Minimização

Se a IA precisa apenas de:

``` text
descrição
valor
data
```

não enviar:

``` text
nome completo
CPF
endereço
outros dados
```

sem necessidade.

------------------------------------------------------------------------

# 67. Mascaramento

Quando aplicável:

``` text
CPF
CNPJ
número de conta
dados pessoais
```

podem ser mascarados antes do processamento por modelos que não precisam
deles.

------------------------------------------------------------------------

# 68. IA Financeira

A IA financeira é diferente do motor de captura.

## Captura

> Entender documentos.

## Financeira

> Explicar os dados financeiros do usuário.

------------------------------------------------------------------------

# 69. Arquitetura da IA Financeira

``` text
Usuário
  ↓
Pergunta
  ↓
LLM
  ↓
Tool Selection
  ↓
Financial Tools
  ↓
Motor Financeiro
  ↓
Dados estruturados
  ↓
LLM
  ↓
Resposta
```

------------------------------------------------------------------------

# 70. Ferramentas Financeiras

A IA pode ter ferramentas como:

``` text
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

------------------------------------------------------------------------

# 71. A IA Não Consulta SQL Livremente

A IA não deve gerar SQL diretamente contra o banco de produção.

Preferência:

``` text
LLM
↓
Tool
↓
Service
↓
Repository
↓
Database
```

Isso reduz:

-   vazamento;
-   consultas indevidas;
-   erros;
-   acesso excessivo.

------------------------------------------------------------------------

# 72. Pergunta: "Quanto gastei?"

A IA deve:

``` text
identificar período
↓
consultar get_period_summary
↓
retornar total
```

Se período não estiver claro:

> "Você quer saber deste mês ou de outro período?"

------------------------------------------------------------------------

# 73. Pergunta: "Onde gastei mais?"

A IA consulta:

``` text
get_category_totals
```

Depois interpreta.

Não deve estimar categorias por linguagem natural.

------------------------------------------------------------------------

# 74. Pergunta: "Por que gastei mais?"

A IA deve comparar:

``` text
período atual
vs.
período anterior
```

E encontrar variações.

Exemplo:

> Seu gasto aumentou principalmente por Alimentação e Transporte.

------------------------------------------------------------------------

# 75. Pergunta: "Posso gastar R\$ 300?"

A IA consulta:

``` text
current_balance
projected_balance
future_commitments
upcoming_card_payment
```

Depois responde com ressalvas.

Nunca apresentar a recomendação como aconselhamento financeiro
infalível.

------------------------------------------------------------------------

# 76. IA Executora

Quando a IA quiser modificar dados:

``` text
Usuário
↓
IA propõe ação
↓
Confirmação
↓
Financial Service
↓
Database
```

Exemplo:

> "Posso criar essa meta para você?"

Botão:

**Criar meta**

------------------------------------------------------------------------

# 77. Ações Permitidas

Podem existir ferramentas como:

``` text
create_goal
update_category
create_transaction
update_transaction
delete_transaction
create_recurrence
```

Todas devem possuir autorização e validação.

------------------------------------------------------------------------

# 78. Ações Financeiras Críticas

Sempre exigir confirmação para:

-   criar lançamento;
-   excluir lançamento;
-   alterar valor;
-   transferir;
-   alterar fatura;
-   criar regra automática.

------------------------------------------------------------------------

# 79. Prompt da IA

O prompt do sistema deve determinar:

-   identidade;
-   escopo;
-   limitações;
-   uso obrigatório das ferramentas;
-   proibição de inventar dados;
-   tratamento de ausência de dados;
-   confirmação de ações.

O prompt não substitui regras de backend.

------------------------------------------------------------------------

# 80. Guardrail Principal

> **Se o número existe no sistema, consulte o sistema.**

Nunca responder:

> "Você gastou R\$ 2.341"

sem consultar a fonte financeira.

------------------------------------------------------------------------

# 81. Segundo Guardrail

> **Se o sistema não possui informação suficiente, diga isso.**

Exemplo:

> "Ainda não tenho sua fatura deste mês, então não consigo calcular seu
> comprometimento total com precisão."

------------------------------------------------------------------------

# 82. Terceiro Guardrail

> **Não transformar estimativa em fato.**

Usar linguagem:

-   estimado;
-   projetado;
-   aproximadamente;
-   com os dados disponíveis.

------------------------------------------------------------------------

# 83. Quarto Guardrail

> **Não alterar dados sem autorização quando a ação for relevante.**

------------------------------------------------------------------------

# 84. Contexto da IA

A IA deve receber apenas o contexto necessário.

Exemplo:

``` text
período
métricas
categorias
lançamentos relevantes
```

Não enviar todo o banco para cada pergunta.

------------------------------------------------------------------------

# 85. Memória da IA

A conversa pode ser armazenada, mas a memória financeira não deve
depender apenas do histórico textual.

Preferência:

``` text
dados estruturados
+
preferências
+
conversa
```

------------------------------------------------------------------------

# 86. Custo

Para controlar custos:

-   parser antes de LLM quando possível;
-   OCR apropriado ao documento;
-   modelos menores para tarefas simples;
-   modelos mais capazes apenas em casos complexos;
-   cache de resultados;
-   não reprocessar documentos desnecessariamente;
-   processamento em lote de faturas.

------------------------------------------------------------------------

# 87. Roteamento de Modelos

Exemplo:

``` text
Documento simples
→ OCR/parser

Classificação simples
→ modelo econômico

Documento complexo
→ modelo multimodal mais capaz

Pergunta financeira simples
→ modelo econômico + tools

Análise complexa
→ modelo mais capaz
```

A seleção definitiva dependerá de testes de precisão/custo.

------------------------------------------------------------------------

# 88. Métricas do Motor de Captura

Medir:

-   taxa de sucesso;
-   taxa de revisão;
-   precisão do valor;
-   precisão da data;
-   precisão do merchant;
-   precisão da categoria;
-   taxa de duplicidade;
-   tempo de processamento;
-   custo por documento.

------------------------------------------------------------------------

# 89. Métricas da IA Financeira

Medir:

-   taxa de respostas com ferramenta;
-   taxa de erro factual;
-   taxa de ações confirmadas;
-   taxa de ações rejeitadas;
-   latência;
-   custo;
-   satisfação do usuário.

------------------------------------------------------------------------

# 90. Feedback do Usuário

Eventos importantes:

``` text
proposal_confirmed
proposal_edited
proposal_rejected
category_changed
duplicate_confirmed
duplicate_dismissed
```

Esses eventos alimentam melhoria do sistema.

------------------------------------------------------------------------

# 91. Dataset de Avaliação

Deve existir um conjunto de documentos anonimizados e representativos.

Categorias:

-   nota;
-   cupom;
-   PIX;
-   fatura;
-   extrato;
-   documentos ruins;
-   documentos parcialmente cortados;
-   múltiplas páginas;
-   diferentes bancos;
-   diferentes cartões.

------------------------------------------------------------------------

# 92. Testes de Captura

Para cada documento, verificar:

``` text
tipo
merchant
valor
data
método
categoria
parcelamento
```

Comparar resultado com ground truth.

------------------------------------------------------------------------

# 93. Testes de Robustez

Testar:

-   foto inclinada;
-   pouca luz;
-   reflexo;
-   baixa resolução;
-   documento amassado;
-   PDF grande;
-   múltiplas páginas;
-   fontes diferentes;
-   layouts diferentes.

------------------------------------------------------------------------

# 94. Testes de Segurança

Verificar:

-   usuário A não acessa documento B;
-   proposal não pode ser confirmada por outro espaço;
-   tool da IA respeita autorização;
-   arquivos privados não ficam públicos;
-   URLs temporárias expiram;
-   logs não vazam dados.

------------------------------------------------------------------------

# 95. Critérios de Aceite --- Nota

Para uma nota legível:

1.  identificar documento;
2.  extrair valor;
3.  extrair data;
4.  identificar merchant;
5.  sugerir categoria;
6.  criar proposal;
7.  detectar possível duplicidade;
8.  permitir confirmação;
9.  gerar transaction correta.

------------------------------------------------------------------------

# 96. Critérios de Aceite --- PIX

Deve:

-   identificar direção;
-   extrair valor;
-   extrair data;
-   identificar recebedor/pagador;
-   sugerir categoria;
-   permitir correção;
-   criar proposta;
-   evitar duplicidade.

------------------------------------------------------------------------

# 97. Critérios de Aceite --- Fatura

Deve:

-   identificar cartão;
-   identificar período;
-   identificar vencimento;
-   extrair lançamentos;
-   reconhecer parcelas quando houver evidência;
-   detectar duplicidades;
-   comparar total;
-   permitir revisão;
-   confirmar lançamentos.

------------------------------------------------------------------------

# 98. Critérios de Aceite --- IA Financeira

Para perguntas factuais:

``` text
consultar ferramenta
↓
obter dado
↓
responder
```

Para ações:

``` text
propor
↓
confirmar
↓
executar
```

Para falta de dados:

``` text
informar ausência
```

------------------------------------------------------------------------

# 99. Falha de OCR

Resultado:

``` text
PROCESSING_FAILED
```

Mensagem:

> Não consegui ler este documento.

CTA:

**Tentar novamente**

------------------------------------------------------------------------

# 100. Falha de IA

Se a interpretação falhar após OCR bem-sucedido:

``` text
OCR disponível
IA indisponível
```

O sistema deve permitir revisão manual usando o texto extraído quando
possível.

------------------------------------------------------------------------

# 101. Falha Parcial

Exemplo:

``` text
Merchant = confiável
Valor = confiável
Data = baixa confiança
```

Resultado:

``` text
REVIEW_REQUIRED
```

Não descartar todo o documento.

------------------------------------------------------------------------

# 102. Processamento Parcial de Fatura

Se 35 de 37 lançamentos forem compreendidos:

``` text
35 propostas válidas
2 exceções
```

O usuário pode revisar somente as duas.

------------------------------------------------------------------------

# 103. Transparência

A interface deve comunicar:

> "Extraído da sua fatura."

> "Categoria sugerida."

> "Você confirmou este lançamento."

Não precisa exibir detalhes técnicos da IA, mas a origem deve ser
rastreável.

------------------------------------------------------------------------

# 104. Origem do Dado

Toda proposal deve permitir identificar:

``` text
document_id
processing_id
extraction_id
```

Quando confirmada:

``` text
transaction.source_type
transaction.source_id
```

------------------------------------------------------------------------

# 105. Auditoria de IA

Registrar:

-   modelo;
-   versão;
-   tarefa;
-   entrada minimizada;
-   saída estruturada;
-   score;
-   decisão;
-   correção do usuário.

Evitar armazenar dados sensíveis em logs desnecessariamente.

------------------------------------------------------------------------

# 106. Não Aprender Cegamente

O sistema não deve transformar toda correção em regra permanente.

Exemplo:

Usuário corrigiu:

``` text
Amazon → Saúde
```

uma vez.

Isso não significa:

``` text
Amazon = Saúde para sempre.
```

A aprendizagem deve considerar repetição e contexto.

------------------------------------------------------------------------

# 107. Aprendizado Progressivo

Modelo conceitual:

``` text
1 correção
→ sinal

2–3 correções consistentes
→ preferência provável

múltiplas confirmações
→ regra forte
```

Os limites finais devem ser definidos com dados de uso.

------------------------------------------------------------------------

# 108. Preferência Explícita

Se o usuário disser:

> "Sempre coloque Uber em Transporte."

Isso deve possuir prioridade maior que inferências automáticas.

------------------------------------------------------------------------

# 109. Conflito de Regras

Se houver:

``` text
regra explícita do usuário
vs.
modelo IA
```

vence:

``` text
regra explícita
```

------------------------------------------------------------------------

# 110. Arquitetura de Serviços

Conceitualmente:

``` text
Capture API
     ↓
Document Service
     ↓
Processing Queue
     ↓
OCR Service
     ↓
Extraction Service
     ↓
Normalization Service
     ↓
AI Classification Service
     ↓
Duplicate Service
     ↓
Proposal Service
     ↓
Financial Engine
```

IA financeira:

``` text
AI Gateway
     ↓
Tool Router
     ↓
Financial Services
```

------------------------------------------------------------------------

# 111. Separação entre Serviços

O Motor de Captura não deve escrever diretamente em:

``` text
Transaction
```

Ele deve passar por:

``` text
Proposal
↓
Financial Engine
```

Isso preserva a integridade definida no Item 6.

------------------------------------------------------------------------

# 112. Fluxo Completo

``` text
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

------------------------------------------------------------------------

# 113. Fluxo Futuro Automatizado

Após o sistema adquirir confiança:

``` text
DOCUMENT
   ↓
EXTRACTION
   ↓
HIGH CONFIDENCE
   ↓
NO DUPLICATE
   ↓
USER-AUTHORIZED RULE
   ↓
FINANCIAL ENGINE
   ↓
TRANSACTION
   ↓
NOTIFICATION
```

Mesmo assim:

> toda operação deve ser auditável.

------------------------------------------------------------------------

# 114. O que o MVP deve fazer

Obrigatório:

-   foto;
-   upload;
-   PDF;
-   OCR;
-   classificação;
-   extração;
-   merchant;
-   valor;
-   data;
-   categoria;
-   proposta;
-   confirmação;
-   duplicidade básica;
-   fatura;
-   comprovante PIX;
-   revisão de exceções;
-   IA financeira com ferramentas.

------------------------------------------------------------------------

# 115. O que pode ficar para depois

Não é necessário no primeiro lançamento:

-   treinamento de modelo próprio;
-   classificação extremamente granular;
-   rateio complexo;
-   automação financeira irrestrita;
-   Open Finance completo;
-   visão computacional especializada;
-   aprendizado federado;
-   agente autônomo financeiro.

------------------------------------------------------------------------

# 116. Princípio de Produto

O diferencial não é:

> "Tem IA."

O diferencial é:

> **"Você não precisa ficar cadastrando sua vida financeira."**

A IA é a tecnologia que torna essa promessa possível.

------------------------------------------------------------------------

# 117. Regra de Ouro do Motor de Captura

> **Capturar automaticamente, sugerir inteligentemente, validar
> rigorosamente e registrar somente através do Motor Financeiro.**

------------------------------------------------------------------------

# 118. Próximo Documento

## 08 --- Arquitetura Técnica + Plano de Desenvolvimento

O próximo documento deverá transformar tudo o que foi definido nos
documentos 01--07 em uma arquitetura implementável:

-   stack;
-   frontend;
-   backend;
-   banco;
-   storage;
-   filas;
-   workers;
-   OCR;
-   IA;
-   APIs;
-   autenticação;
-   segurança;
-   observabilidade;
-   infraestrutura;
-   ambientes;
-   CI/CD;
-   deploy;
-   custos;
-   estrutura do projeto;
-   módulos;
-   contratos;
-   roadmap;
-   ordem de implementação;
-   MVP;
-   pós-MVP.

A arquitetura deverá respeitar integralmente o Banco de Dados, o Motor
Financeiro e o Motor de Captura definidos anteriormente.
