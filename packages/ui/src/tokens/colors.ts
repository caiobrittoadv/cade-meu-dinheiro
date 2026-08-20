// Tokens de cor — fonte: docs/02_Brandbook_Cade_Meu_Dinheiro.md
// Regra do CLAUDE.md: nunca espalhar HEX diretamente nos componentes
// quando existir token correspondente.

export const colors = {
  purple: {
    primary: "#6C3BFF", // Purple C.M.D. — logo, botões primários, links, IA
    deep: "#4B22B8", // Purple Deep — hover, pressed, gradientes
    soft: "#EDE7FF", // Purple Soft — backgrounds, cards informativos, badges
  },
  dark: {
    obsidian: "#0D0D12", // fundo principal (dark)
    graphite: "#17171F", // superfícies: cards, sidebar, modais, inputs
    graphiteLight: "#24242E", // bordas, divisores, hover
    white: "#FFFFFF", // títulos, números financeiros, alto contraste
  },
  light: {
    offWhite: "#F7F7FA", // fundo principal (light)
    white: "#FFFFFF", // cards e superfícies
    ink: "#17171F", // texto principal
    slate: "#6F7180", // texto secundário
  },
} as const;

export type ColorToken = typeof colors;
