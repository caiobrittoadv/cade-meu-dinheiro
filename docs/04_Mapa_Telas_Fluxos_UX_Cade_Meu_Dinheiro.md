# 04 --- Mapa Completo de Telas, Fluxos e UX

## Cadê Meu Dinheiro?

**Versão:** 1.0\
**Status:** Especificação funcional e de experiência\
**Projeto:** Cadê Meu Dinheiro?\
**Base:** PRD v2.0 + Brandbook + Engenharia Reversa

------------------------------------------------------------------------

# 1. Objetivo

Este documento transforma o PRD em uma especificação de experiência do
produto.

O objetivo é definir:

-   arquitetura de navegação;
-   telas;
-   fluxos;
-   ações;
-   componentes;
-   estados;
-   comportamento;
-   experiência de captura inteligente;
-   experiência de análise financeira;
-   diferenças entre desktop e mobile.

A regra central de UX é:

> **O usuário não deve precisar trabalhar para alimentar o aplicativo.**

O sistema deve trabalhar para transformar informações que o usuário já
possui em organização financeira.

------------------------------------------------------------------------

# 2. Princípio Central de UX

## O aplicativo deve funcionar em dois movimentos

### Entrada

``` text
O usuário possui uma informação
            ↓
Envia para o Cadê Meu Dinheiro?
            ↓
O sistema entende
            ↓
O sistema organiza
```

### Compreensão

``` text
Dados organizados
        ↓
Dashboard
        ↓
Análises
        ↓
Explicações
        ↓
Decisões melhores
```

Portanto:

> **Capturar deve ser fácil. Entender deve ser imediato.**

------------------------------------------------------------------------

# 3. Arquitetura Geral do Produto

``` text
CADÊ MEU DINHEIRO?
│
├── Dashboard
│
├── Lançamentos
│   ├── Todos
│   ├── Receitas
│   ├── Despesas
│   └── Transferências
│
├── Contas
│   ├── Todas
│   ├── Conta
│   ├── Poupança
│   └── Dinheiro
│
├── Cartões
│   ├── Cartões
│   ├── Faturas
│   └── Parcelas
│
├── Para Onde Foi?
│
├── Metas
│
├── IA
│
└── Configurações
    ├── Perfil
    ├── Categorias
    ├── Preferências
    ├── Segurança
    └── Dados e documentos
```

------------------------------------------------------------------------

# 4. Navegação Principal

## Desktop

Sidebar fixa:

``` text
┌──────────────────────┐
│ LOGO                 │
│                      │
│ ◉ Visão geral        │
│                      │
│ + Adicionar          │
│                      │
│ Lançamentos          │
│ Contas               │
│ Cartões              │
│ Para Onde Foi?       │
│ Metas                │
│ IA                   │
│                      │
│ ───────────────────  │
│ Configurações        │
│ Ajuda                │
│                      │
│ Perfil               │
└──────────────────────┘
```

## Mobile

Bottom navigation:

``` text
┌────────────────────────────────────┐
│                                    │
│            CONTEÚDO                │
│                                    │
├────────────────────────────────────┤
│ Início │ Lançamentos │ + │ Cartões │ Mais │
└────────────────────────────────────┘
```

O botão **+** deve ser visualmente destacado.

------------------------------------------------------------------------

# 5. Ação Global "Adicionar"

A ação mais importante do aplicativo.

Ao tocar:

``` text
Adicionar
   │
   ├── Fotografar documento
   ├── Enviar foto
   ├── Enviar PDF
   ├── Importar fatura
   ├── Escanear comprovante
   └── Lançar manualmente
```

A interface deve colocar captura antes da digitação.

------------------------------------------------------------------------

# 6. Tela 01 --- Splash

## Objetivo

Apresentar rapidamente a marca enquanto a aplicação carrega.

Conteúdo:

**Cadê Meu Dinheiro?**

Subtítulo opcional:

> Seu dinheiro. Sua clareza. Seu controle.

Duração mínima possível.

Não utilizar splash prolongado.

------------------------------------------------------------------------

# 7. Tela 02 --- Boas-vindas

## Objetivo

Explicar a proposta em poucos segundos.

### Conteúdo

> **Cadê seu dinheiro?**

> Mande suas notas, comprovantes e faturas. A gente organiza.

CTA:

**Começar**

Link secundário:

**Já tenho uma conta**

------------------------------------------------------------------------

# 8. Tela 03 --- Cadastro

Campos:

-   nome;
-   e-mail;
-   senha.

Opcional:

-   login social, se adotado posteriormente.

CTA:

**Criar minha conta**

Microcopy:

> Seus dados financeiros são privados e protegidos.

------------------------------------------------------------------------

# 9. Tela 04 --- Login

Campos:

-   e-mail;
-   senha.

Ações:

-   entrar;
-   recuperar senha;
-   criar conta.

------------------------------------------------------------------------

# 10. Tela 05 --- Onboarding Financeiro

O onboarding deve coletar somente o necessário.

## Etapa 1 --- Renda

> **Quanto entra por mês?**

Campo monetário.

Possibilidade:

-   renda fixa;
-   renda variável;
-   mais de uma fonte.

------------------------------------------------------------------------

## Etapa 2 --- Recebimento

> **Quando você normalmente recebe?**

Selecionar:

-   dia;
-   periodicidade.

------------------------------------------------------------------------

## Etapa 3 --- Conta

> **Onde seu dinheiro fica?**

Cadastrar primeira conta.

------------------------------------------------------------------------

## Etapa 4 --- Cartão

> **Você usa cartão de crédito?**

Sim / Não.

Se sim:

> **Vamos cadastrar seu cartão.**

------------------------------------------------------------------------

## Etapa 5 --- Primeiro registro

> **Agora vamos fazer o mais fácil.**

> Tire uma foto de uma nota, envie um comprovante ou registre algo
> manualmente.

CTA:

**Adicionar meu primeiro gasto**

------------------------------------------------------------------------

# 11. Tela 06 --- Dashboard

Essa é a tela principal.

## Hierarquia

### Cabeçalho

> Bom dia, \[Nome\].

Seletor de período:

**Agosto 2026**

------------------------------------------------------------------------

## Card principal

### Seu mês

**R\$ 5.000,00**

Entrou

**R\$ 3.720,00**

Saiu

**R\$ 1.280,00**

Disponível

------------------------------------------------------------------------

## Card "Para onde foi?"

Mostrar principais categorias.

Exemplo:

``` text
Para onde foi seu dinheiro?

Moradia       R$ 1.500
Alimentação   R$   820
Transporte    R$   480
Cartão        R$   620
Outros        R$   300
```

CTA:

**Ver análise completa**

------------------------------------------------------------------------

## Card "Comprometido"

Mostrar:

-   faturas;
-   contas futuras;
-   recorrências;
-   parcelas.

------------------------------------------------------------------------

## Card "Seu mês"

Mensagem contextual.

Exemplo:

> Você gastou 12% menos que no mês passado.

Ou:

> Seus gastos aumentaram 18% neste mês.

------------------------------------------------------------------------

## CTA flutuante

**+ Adicionar**

------------------------------------------------------------------------

# 12. Tela 07 --- Adicionar

Tela/modal central.

Título:

> **O que você quer adicionar?**

Opções grandes:

### Fotografar

Tirar foto de nota ou comprovante.

### Enviar arquivo

Imagem ou PDF.

### Fatura

Importar fatura do cartão.

### Manual

Cadastrar lançamento.

A ordem deve priorizar os métodos automáticos.

------------------------------------------------------------------------

# 13. Tela 08 --- Câmera

## Objetivo

Capturar documento.

Interface:

-   visor;
-   enquadramento;
-   flash;
-   galeria;
-   botão de captura.

Microcopy:

> Posicione o documento dentro da área.

Após captura:

**Usar foto**

**Tirar novamente**

------------------------------------------------------------------------

# 14. Tela 09 --- Upload

Permitir:

-   JPG;
-   PNG;
-   WEBP;
-   PDF.

Desktop:

drag and drop.

Mobile:

-   câmera;
-   galeria;
-   arquivos.

Mensagem:

> Arraste seu documento aqui ou selecione um arquivo.

------------------------------------------------------------------------

# 15. Tela 10 --- Processamento

Tela de processamento.

Exemplo:

> **Estamos lendo seu documento...**

Etapas:

``` text
✓ Documento recebido
✓ Texto identificado
● Organizando informações
○ Categorizando
○ Verificando duplicidade
```

Não exibir processamento técnico excessivo.

A experiência deve parecer simples.

------------------------------------------------------------------------

# 16. Tela 11 --- Resultado da Captura

Essa é uma das telas mais importantes do produto.

Título:

> **Encontrei uma despesa**

Card:

``` text
Supermercado X

R$ 187,42

16/08/2026

Alimentação
```

Campos editáveis:

-   estabelecimento;
-   valor;
-   data;
-   categoria;
-   conta/cartão.

CTA principal:

**Confirmar lançamento**

Secundário:

**Editar**

Terciário:

**Descartar**

------------------------------------------------------------------------

# 17. Confiança da Captura

Quando houver dúvida:

> **Confira alguns dados antes de continuar.**

Exemplo:

> Categoria sugerida: Alimentação

Com possibilidade de alteração.

Não é necessário mostrar "87% de confiança".

A interface deve comunicar a necessidade de revisão de forma humana.

------------------------------------------------------------------------

# 18. Tela 12 --- Itens da Nota

Quando o documento permitir leitura detalhada:

> **Quer separar os itens?**

Opções:

### Manter como uma despesa

Supermercado --- R\$ 187,42

### Separar por categoria

``` text
Alimentação    R$ 86,80
Limpeza        R$ 35,60
Higiene        R$ 27,50
Outros         R$ 37,52
```

A opção padrão deve ser a mais simples.

------------------------------------------------------------------------

# 19. Tela 13 --- Possível Duplicidade

Título:

> **Esse gasto pode já estar registrado.**

Mostrar comparação:

``` text
Novo
Supermercado X
R$ 187,42
16/08

Já registrado
Supermercado X
R$ 187,42
16/08
```

Ações:

**Manter o existente**

**Usar novo**

**Manter os dois**

------------------------------------------------------------------------

# 20. Tela 14 --- Importação de Fatura

Entrada:

> **Envie sua fatura**

Aceitar:

-   PDF;
-   imagem;
-   print.

Após processamento:

> **Encontramos 37 lançamentos.**

Resumo:

-   31 classificados;
-   4 precisam de revisão;
-   2 possíveis duplicidades.

CTA:

**Revisar lançamentos**

------------------------------------------------------------------------

# 21. Tela 15 --- Revisão da Fatura

Lista:

``` text
✓ Uber
   R$ 28,90
   Transporte

✓ iFood
   R$ 52,90
   Alimentação

⚠ Loja X
   R$ 89,90
   Categoria não identificada

⚠ Amazon
   R$ 120,00
   Possível duplicidade
```

O usuário deve revisar somente exceções.

CTA:

**Confirmar fatura**

------------------------------------------------------------------------

# 22. Tela 16 --- Lançamento Manual

O formulário manual deve ser mínimo.

Campos:

**O que foi?**

**Quanto?**

**Quando?**

**Tipo**

-   Receita
-   Despesa
-   Transferência

Campos sugeridos automaticamente:

-   categoria;
-   conta;
-   cartão.

CTA:

**Salvar**

------------------------------------------------------------------------

# 23. Tela 17 --- Lançamentos

Lista cronológica.

Cada item:

``` text
Supermercado X
Alimentação
16 ago

-R$ 187,42
```

Receitas:

``` text
Salário
Receita
05 ago

+R$ 5.000,00
```

------------------------------------------------------------------------

# 24. Filtros

Filtros:

-   período;
-   tipo;
-   categoria;
-   conta;
-   cartão;
-   origem;
-   valor.

Pesquisa textual:

> Buscar lançamento...

------------------------------------------------------------------------

# 25. Tela 18 --- Detalhe do Lançamento

Mostrar:

-   descrição;
-   valor;
-   data;
-   categoria;
-   conta/cartão;
-   origem;
-   documento associado;
-   observação.

Se originado de documento:

> **Importado da fatura**

ou:

> **Extraído de comprovante**

CTA:

**Editar**

Ação:

**Excluir**

------------------------------------------------------------------------

# 26. Tela 19 --- Documento Associado

Quando existir documento:

Mostrar prévia.

Informações:

-   documento original;
-   data de importação;
-   origem;
-   lançamentos associados.

Ação:

**Excluir documento**

A exclusão deve explicar impacto quando aplicável.

------------------------------------------------------------------------

# 27. Tela 20 --- Contas

Cards:

``` text
Nubank
R$ 2.350,00

Itaú
R$ 1.200,00

Dinheiro
R$ 180,00
```

Total consolidado:

**R\$ 3.730,00**

CTA:

**Adicionar conta**

------------------------------------------------------------------------

# 28. Tela 21 --- Detalhe da Conta

Mostrar:

-   saldo;
-   receitas;
-   despesas;
-   transferências;
-   evolução;
-   últimos lançamentos.

CTA:

**Adicionar lançamento**

------------------------------------------------------------------------

# 29. Tela 22 --- Transferência

Campos:

-   conta de origem;
-   conta de destino;
-   valor;
-   data;
-   descrição.

O sistema deve deixar claro:

> Transferências entre suas contas não contam como gasto.

------------------------------------------------------------------------

# 30. Tela 23 --- Cartões

Cards:

``` text
Nubank

Fatura atual
R$ 1.240,00

Limite
R$ 5.000,00

Disponível
R$ 3.760,00
```

CTA:

**Adicionar cartão**

------------------------------------------------------------------------

# 31. Tela 24 --- Detalhe do Cartão

Mostrar:

-   limite;
-   disponível;
-   fatura atual;
-   vencimento;
-   fechamento;
-   próximas faturas;
-   parcelas.

CTA:

**Importar fatura**

------------------------------------------------------------------------

# 32. Tela 25 --- Fatura

Cabeçalho:

**Fatura de Agosto**

**R\$ 1.847,60**

Vencimento:

**10/09**

Lista de lançamentos.

Resumo por categoria.

CTA:

**Ver análise**

------------------------------------------------------------------------

# 33. Tela 26 --- Parcelamentos

Lista:

``` text
Notebook
R$ 300 / 12x
Parcela 4 de 12

Celular
R$ 180 / 10x
Parcela 2 de 10
```

Mostrar:

-   parcela atual;
-   restantes;
-   total comprometido.

------------------------------------------------------------------------

# 34. Tela 27 --- Para Onde Foi?

Essa tela deve ser uma das mais importantes do produto.

Título:

> **Cadê seu dinheiro?**

Subtítulo:

> Vamos mostrar.

## Resumo

``` text
Entrou
R$ 5.000

Saiu
R$ 3.720

Sobrou
R$ 1.280
```

## Distribuição

Gráfico simples.

Categorias.

## Comparação

> Você gastou R\$ 430 a mais que no mês passado.

------------------------------------------------------------------------

# 35. Tela 28 --- Detalhe de Categoria

Exemplo:

**Alimentação**

Total:

**R\$ 820,00**

Mostrar:

-   evolução;
-   lançamentos;
-   comparação;
-   percentual da renda;
-   principais estabelecimentos.

Exemplo:

``` text
iFood          R$ 320
Supermercado   R$ 280
Restaurantes   R$ 160
Outros         R$ 60
```

------------------------------------------------------------------------

# 36. Tela 29 --- Fechamento Mensal

Título:

> **Seu mês em poucas palavras.**

Mostrar:

### Entrou

R\$ 5.000

### Saiu

R\$ 3.720

### Sobrou

R\$ 1.280

Depois:

> Seu maior gasto foi Moradia.

> Alimentação representou 22% das suas despesas.

> Você gastou 8% menos que no mês passado.

CTA:

**Ver detalhes**

------------------------------------------------------------------------

# 37. Tela 30 --- Metas

Lista:

``` text
Reserva de emergência
35%

Viagem
62%

Notebook
80%
```

CTA:

**Nova meta**

------------------------------------------------------------------------

# 38. Tela 31 --- Detalhe da Meta

Mostrar:

-   objetivo;
-   valor atual;
-   valor restante;
-   prazo;
-   progresso.

CTA:

**Adicionar valor**

------------------------------------------------------------------------

# 39. Tela 32 --- IA

A IA deve parecer parte do produto, não um chatbot genérico.

Título:

> **Pergunte sobre seu dinheiro.**

Sugestões:

-   Onde gastei mais?
-   Quanto gastei este mês?
-   Compare com o mês passado.
-   Quanto comprometi no cartão?
-   Posso gastar R\$ 300 hoje?
-   O que aumentou meus gastos?

Campo:

> Pergunte qualquer coisa sobre suas finanças...

------------------------------------------------------------------------

# 40. Tela 33 --- Resposta da IA

Exemplo:

> Você gastou **R\$ 3.720** neste mês.
>
> O maior grupo foi **Moradia**, com R\$ 1.500.
>
> Alimentação ficou em R\$ 820 e representa aproximadamente 22% das suas
> despesas.
>
> Em comparação com o mês passado, seus gastos aumentaram R\$ 240.

Abaixo:

**Ver os lançamentos**

**Comparar períodos**

------------------------------------------------------------------------

# 41. IA e Ações

Quando a IA puder executar uma ação, ela deve pedir confirmação.

Exemplo:

Usuário:

> "Cadastre uma meta de R\$ 10.000 para dezembro."

IA:

> Posso criar esta meta:
>
> Reserva de emergência\
> Objetivo: R\$ 10.000\
> Prazo: dezembro de 2026
>
> **\[Criar meta\]**

Nunca executar uma alteração financeira importante silenciosamente.

------------------------------------------------------------------------

# 42. Tela 34 --- Configurações

Seções:

### Conta

-   perfil;
-   e-mail;
-   senha.

### Financeiro

-   moeda;
-   período;
-   categorias;
-   preferências.

### Captura

-   confirmação automática futura;
-   preferências de documentos;
-   retenção.

### Segurança

-   sessões;
-   dispositivos;
-   autenticação.

### Dados

-   exportar dados;
-   excluir conta;
-   documentos.

------------------------------------------------------------------------

# 43. Tela 35 --- Categorias

Lista:

``` text
Moradia
Alimentação
Transporte
Saúde
Educação
Lazer
Assinaturas
Compras
Serviços
Impostos
Outros
```

Ações:

-   criar;
-   editar;
-   arquivar;
-   ordenar.

------------------------------------------------------------------------

# 44. Tela 36 --- Notificações

Categorias:

-   documentos processados;
-   revisões;
-   duplicidades;
-   faturas;
-   fechamento;
-   alertas.

Cada notificação deve levar diretamente à ação necessária.

------------------------------------------------------------------------

# 45. Estados de Loading

Nunca mostrar apenas uma tela vazia.

## Dashboard

> Organizando seus números...

## Documento

> Lendo seu documento...

## Fatura

> Encontrando seus lançamentos...

## IA

> Analisando seus dados...

------------------------------------------------------------------------

# 46. Estados de Erro

Erros devem explicar o que aconteceu e o próximo passo.

### Documento ilegível

> **Não consegui ler este documento.**

> Tente uma foto mais nítida ou envie o PDF original.

CTA:

**Tentar novamente**

------------------------------------------------------------------------

### Formato não suportado

> **Esse arquivo não pode ser processado.**

> Envie uma imagem ou PDF compatível.

------------------------------------------------------------------------

### IA indisponível

> **Não consegui analisar seus dados agora.**

> Seus lançamentos continuam salvos normalmente.

------------------------------------------------------------------------

# 47. Estado de Processamento Demorado

Se o processamento não for imediato:

> **Estamos trabalhando nisso.**

> Você pode continuar usando o aplicativo. Avisaremos quando estiver
> pronto.

Isso evita que o usuário fique preso na tela.

------------------------------------------------------------------------

# 48. Estado Sem Dados

## Dashboard

> **Seu dinheiro ainda não deixou rastros por aqui.**

> Envie uma nota, comprovante ou registre seu primeiro lançamento.

CTA:

**Adicionar**

------------------------------------------------------------------------

# 49. Estado Sem Categoria

> **Ainda não sabemos onde colocar esse gasto.**

Mostrar sugestão:

**Outros**

CTA:

**Escolher categoria**

------------------------------------------------------------------------

# 50. Estado de Baixa Confiança

> **Confira este lançamento antes de salvar.**

Destacar apenas os campos que precisam de atenção.

------------------------------------------------------------------------

# 51. Microinterações

As microinterações devem reforçar compreensão.

Exemplos:

-   confirmação de lançamento;
-   animação discreta de saldo;
-   progresso de meta;
-   documento processado;
-   categoria identificada;
-   fechamento mensal concluído.

Evitar animações decorativas excessivas.

------------------------------------------------------------------------

# 52. Sistema de Cores na UX

## Roxo

Representa:

-   ação principal;
-   seleção;
-   progresso;
-   IA;
-   destaque da marca.

## Verde

-   receita;
-   resultado positivo;
-   meta avançando.

## Vermelho

-   despesa;
-   problema;
-   alerta financeiro relevante.

## Âmbar

-   revisão;
-   vencimento;
-   atenção.

## Azul

-   informação contextual.

------------------------------------------------------------------------

# 53. Cards

Os cards devem possuir:

-   hierarquia clara;
-   poucos elementos;
-   números grandes;
-   texto curto;
-   ação evidente.

Evitar dashboards compostos por dezenas de cards pequenos.

------------------------------------------------------------------------

# 54. Gráficos

Os gráficos devem responder perguntas.

### Bom

> Para onde foi meu dinheiro?

Gráfico por categoria.

### Ruim

Gráfico apenas para preencher espaço.

Tipos prioritários:

-   barras;
-   linha;
-   rosca somente quando realmente útil;
-   progresso.

------------------------------------------------------------------------

# 55. Responsividade

## Mobile

Prioridade máxima.

O mobile é o ambiente natural de:

-   fotografar;
-   compartilhar comprovantes;
-   consultar gastos;
-   registrar despesas;
-   acompanhar cartão.

## Desktop

Prioridade para:

-   análise;
-   relatórios;
-   revisão de faturas;
-   visão consolidada;
-   configurações.

------------------------------------------------------------------------

# 56. Fluxo Principal --- Primeira Utilização

``` text
Boas-vindas
    ↓
Cadastro
    ↓
Onboarding
    ↓
Conta
    ↓
Dashboard vazio
    ↓
Adicionar
    ↓
Foto
    ↓
Processamento
    ↓
Resultado
    ↓
Confirmar
    ↓
Dashboard atualizado
    ↓
“Agora você já sabe onde começou seu dinheiro.”
```

------------------------------------------------------------------------

# 57. Fluxo Principal --- Nota Fiscal

``` text
Adicionar
    ↓
Fotografar
    ↓
Capturar
    ↓
OCR
    ↓
Interpretação
    ↓
Categoria
    ↓
Duplicidade
    ↓
Lançamento proposto
    ↓
Confirmar
    ↓
Dashboard
```

------------------------------------------------------------------------

# 58. Fluxo Principal --- Fatura

``` text
Cartões
    ↓
Selecionar cartão
    ↓
Importar fatura
    ↓
PDF / imagem
    ↓
Processamento
    ↓
Extração
    ↓
Classificação
    ↓
Duplicidade
    ↓
Revisão de exceções
    ↓
Confirmar
    ↓
Fatura atualizada
    ↓
Dashboard atualizado
```

------------------------------------------------------------------------

# 59. Fluxo Principal --- Comprovante PIX

``` text
Compartilhar
      ↓
Cadê Meu Dinheiro?
      ↓
Leitura
      ↓
Valor
Data
Recebedor
      ↓
Sugestão de categoria
      ↓
Confirmar
      ↓
Despesa registrada
```

------------------------------------------------------------------------

# 60. Fluxo Principal --- Lançamento Manual

``` text
Adicionar
    ↓
Manual
    ↓
Valor
    ↓
Descrição
    ↓
Tipo
    ↓
Sugestões automáticas
    ↓
Salvar
```

O fluxo manual deve ser mais rápido que o de aplicativos tradicionais.

------------------------------------------------------------------------

# 61. Fluxo de Exceção

O produto deve seguir o princípio:

> **Automatize o caminho comum. Leve o usuário somente para as
> exceções.**

Exemplo:

``` text
100 lançamentos importados
        ↓
90 alta confiança
        ↓
7 baixa confiança
        ↓
3 duplicidades
        ↓
Usuário revisa apenas 10
```

Isso é muito mais importante que simplesmente "ter OCR".

------------------------------------------------------------------------

# 62. Princípio de Confirmação

No MVP:

``` text
IA detecta
   ↓
Sistema propõe
   ↓
Usuário confirma
   ↓
Sistema registra
```

Futuramente:

``` text
Usuário configura automação
   ↓
Sistema reconhece padrão
   ↓
Sistema registra automaticamente
   ↓
Usuário é notificado
```

A automação sem confirmação deve ser conquistada pela confiança, não
presumida.

------------------------------------------------------------------------

# 63. Arquitetura de Navegação --- Desktop

``` text
Dashboard
│
├── Adicionar
│   ├── Foto
│   ├── Arquivo
│   ├── Fatura
│   └── Manual
│
├── Lançamentos
│
├── Contas
│
├── Cartões
│
├── Para Onde Foi?
│
├── Metas
│
├── IA
│
└── Configurações
```

------------------------------------------------------------------------

# 64. Arquitetura de Navegação --- Mobile

``` text
INÍCIO
LANÇAMENTOS
   +
CARTÕES
MAIS
```

Dentro de **Mais**:

-   Contas;
-   Para Onde Foi?;
-   Metas;
-   IA;
-   Configurações.

O botão **+** deve permanecer sempre acessível.

------------------------------------------------------------------------

# 65. Regra de Hierarquia

Em qualquer tela, a hierarquia deve seguir:

``` text
1. O que aconteceu?
2. Quanto?
3. Por quê?
4. O que isso significa?
5. O que posso fazer?
```

Exemplo:

> Você gastou R\$ 820.

> Alimentação foi sua maior categoria.

> Isso representa 22% dos seus gastos.

> Você gastou 15% mais que no mês passado.

> \[Ver detalhes\]

------------------------------------------------------------------------

# 66. Princípio de Linguagem

Evitar:

> "Despesas realizadas"

Preferir:

> "Quanto saiu"

Evitar:

> "Resultado financeiro"

Preferir:

> "Quanto sobrou"

Evitar:

> "Composição da despesa"

Preferir:

> "Para onde foi"

Evitar:

> "Lançamento financeiro"

Quando possível:

> "Gasto"

------------------------------------------------------------------------

# 67. UX de Confiança

O usuário precisa saber que o sistema não está "inventando".

Sempre que necessário:

> **Encontrado na sua fatura**

> **Lido do comprovante**

> **Categoria sugerida**

> **Você confirmou este lançamento**

A transparência é parte da experiência.

------------------------------------------------------------------------

# 68. Princípio de Recuperação

Nenhuma automação deve tornar o dado irreversível.

O usuário deve conseguir:

-   editar;
-   desfazer;
-   excluir;
-   revisar;
-   consultar origem.

------------------------------------------------------------------------

# 69. Experiência de Fechamento

Quando houver dados suficientes:

> **Seu mês está pronto.**

Mostrar:

``` text
Entrou
R$ 5.000

Saiu
R$ 3.720

Sobrou
R$ 1.280
```

Depois:

> **Seu maior gasto foi Moradia.**

> **Você gastou 8% menos que no mês passado.**

> **Seu cartão representa R\$ 1.240 dos gastos.**

CTA:

**Entender meu mês**

------------------------------------------------------------------------

# 70. Experiência Educativa

A educação financeira deve aparecer dentro do contexto.

Exemplo:

> Você gastou R\$ 1.240 no cartão.

Explicação:

> Isso representa 25% da sua renda deste mês.

Pergunta:

> Quer acompanhar esse comprometimento nos próximos meses?

A educação não deve ser um curso separado.

Ela deve acontecer durante o uso.

------------------------------------------------------------------------

# 71. Critério de Qualidade da UX

Uma tela só deve existir se cumprir pelo menos uma destas funções:

-   capturar;
-   organizar;
-   explicar;
-   permitir decisão;
-   executar ação.

Se não cumprir nenhuma, deve ser questionada.

------------------------------------------------------------------------

# 72. Regra de Ouro

> **O usuário deve digitar o mínimo possível, confirmar o necessário e
> entender o máximo possível.**

------------------------------------------------------------------------

# 73. Próximo Documento

Com o mapa de telas e fluxos definido, o próximo documento recomendado
é:

## 05 --- Design System e UI Specification

Ele deverá transformar o Brandbook em um sistema de interface
implementável, definindo:

-   tokens;
-   cores;
-   tipografia;
-   espaçamento;
-   grid;
-   breakpoints;
-   radius;
-   sombras;
-   botões;
-   inputs;
-   selects;
-   cards;
-   tabelas;
-   gráficos;
-   badges;
-   modais;
-   drawers;
-   menus;
-   componentes de captura;
-   componentes de revisão;
-   componentes financeiros;
-   estados;
-   Light Mode;
-   Dark Mode;
-   acessibilidade.

Depois dele:

## 06 --- Modelo de Dados e Motor Financeiro

E então:

## 07 --- Arquitetura Técnica e Plano de Desenvolvimento.
