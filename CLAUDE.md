# CLAUDE.md — Cadê Meu Dinheiro?

## Missão

Você está trabalhando no Cadê Meu Dinheiro?, um aplicativo de organização financeira pessoal cujo objetivo é ajudar pessoas que recebem dinheiro, gastam ao longo do mês e não sabem para onde o dinheiro foi.

O principal problema é a **fricção de entrada de dados**.

## Contexto obrigatório

Antes de alterar arquitetura, domínio financeiro ou fluxos de captura, consulte:

1. `docs/03_PRD_MVP_Cade_Meu_Dinheiro_v2.md`
2. `docs/04_Mapa_Telas_Fluxos_UX_Cade_Meu_Dinheiro.md`
3. `docs/05_Modelo_Dados_Banco_Dados_Cade_Meu_Dinheiro.md`
4. `docs/06_Motor_Financeiro_Regras_Negocio_Cade_Meu_Dinheiro.md`
5. `docs/07_Motor_Captura_IA_Cade_Meu_Dinheiro.md`
6. `docs/08_Arquitetura_Tecnica_Plano_Desenvolvimento_Cade_Meu_Dinheiro.md`
## Stack

- Next.js + React + TypeScript
- NestJS + TypeScript
- PostgreSQL
- Prisma
- Redis + BullMQ
- S3-compatible Object Storage
- REST `/api/v1`

Arquitetura inicial: **Modular Monolith**.

Não introduzir microserviços, Kubernetes ou infraestrutura complexa sem necessidade comprovada.

## Regras financeiras — NÃO QUEBRAR

1. Transferência entre contas próprias não é receita nem despesa.
2. Proposta não confirmada não entra no saldo.
3. Transaction cancelada não participa dos cálculos ativos.
4. Compra no cartão e pagamento da fatura não podem ser contados como duas despesas.
5. Parcelas devem manter relação com a compra original e com a fatura correspondente.
6. Valores monetários devem ter precisão adequada; não usar `float` para dinheiro.
7. Estornos e reembolsos devem manter rastreabilidade.
8. Importações repetidas não podem gerar duplicidade silenciosa.
9. Saldos devem ser reconstruíveis a partir dos fatos financeiros.
10. Operações críticas devem ser auditáveis.

## Regra de ouro do Motor Financeiro

A UI, OCR e IA não calculam regras financeiras.

```text
Input
  ↓
Domain / Financial Engine
  ↓
Transaction / Projection / Analysis
```

## Regra de ouro da captura

O Capture Engine NÃO cria uma transaction diretamente.

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
```

## Regra de ouro da IA

A IA não acessa SQL diretamente.

```text
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

Se o dado existir no sistema, a IA deve consultar uma ferramenta do domínio.

Nunca inventar saldo, receita, despesa, fatura, parcela ou projeção.

## Privacidade

O projeto pode ser público, mas dados reais nunca devem entrar no repositório.

## Design System

Cor primária oficial: `#6C3BFF` — Roxo C.M.D.

Nunca espalhar HEX diretamente nos componentes quando existir token correspondente.

## Processo

Antes de alteração relevante:

1. identificar o módulo;
2. consultar a documentação;
3. verificar impactos no domínio financeiro;
4. implementar;
5. adicionar/ajustar testes;
6. verificar tipos;
7. verificar lint;
8. documentar mudanças arquiteturais quando necessário.

Não reescrever decisões de produto sem justificativa.
