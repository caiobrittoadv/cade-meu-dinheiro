// Tokens de cor — fonte: docs/02_Brandbook_Cade_Meu_Dinheiro.md
// Regra do CLAUDE.md: nunca espalhar HEX diretamente nos componentes
// quando existir token correspondente.

export const colors = {
  purple: {
    primary: "#8A05BE", // Roxo Nubank — logo, botões primários, links, IA
    deep: "#650488", // Purple Deep — hover/pressed de elementos sólidos
    light: "#C77DFF", // Purple Light — texto/ícone sobre fundos "soft" no tema escuro
    soft: "#2A1240", // Purple Soft — backgrounds de chip/badge/item ativo (tema escuro)
  },
  dark: {
    obsidian: "#0D0D12", // fundo principal — único tema da aplicação
    graphite: "#17171F", // superfícies: cards, sidebar, modais, inputs
    graphiteLight: "#29293A", // bordas, divisores, hover
    white: "#FFFFFF", // títulos, números financeiros, alto contraste
  },
} as const;

export type ColorToken = typeof colors;
