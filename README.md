# Cadê Meu Dinheiro?

> Seu dinheiro entrou. Você gastou. Mas, no fim do mês... cadê o dinheiro?

**Cadê Meu Dinheiro?** é um aplicativo de organização financeira pessoal criado para resolver um problema simples e recorrente: pessoas recebem dinheiro, gastam ao longo do mês e chegam ao final sem conseguir explicar com clareza quanto entrou, quanto saiu e para onde o dinheiro foi.

A proposta do projeto é tornar o controle financeiro menos dependente de lançamentos manuais e mais próximo da forma como as pessoas realmente lidam com seus gastos.

---

## O problema

Grande parte das pessoas sabe que deveria controlar melhor o próprio dinheiro, mas abandona aplicativos financeiros por um motivo simples:

**é trabalhoso alimentar o sistema.**

Cada compra exige um lançamento.

Cada receita precisa ser registrada.

Cada parcela precisa ser organizada.

Cada fatura precisa ser conferida.

Depois de alguns dias, a pessoa simplesmente para de cadastrar.

O resultado é um paradoxo:

> quanto mais a pessoa precisa de organização financeira, mais difícil pode ser manter o aplicativo atualizado.

O Cadê Meu Dinheiro? parte dessa premissa para construir uma experiência em que o sistema faça cada vez mais trabalho de organização para o usuário.

---

## A ideia

O objetivo não é apenas registrar despesas.

O objetivo é ajudar o usuário a **entender o próprio dinheiro**.

O sistema deve evoluir para permitir que documentos financeiros sejam utilizados como fonte de informação, reduzindo a necessidade de digitação manual.

Exemplos de entradas planejadas:

- foto de nota ou comprovante;
- documentos PDF;
- comprovantes de pagamento;
- faturas de cartão;
- documentos financeiros importados pelo usuário.

Esses documentos poderão passar por um pipeline de processamento, extração, normalização e validação antes de qualquer informação financeira ser efetivamente registrada.

---

## Captura inteligente

A arquitetura do projeto foi desenhada para separar captura de informação de registro financeiro.

O fluxo conceitual é:

```text
Documento
   ↓
Processamento
   ↓
Extração
   ↓
Normalização
   ↓
Proposta
   ↓
Confirmação
   ↓
Motor Financeiro
   ↓
Transaction