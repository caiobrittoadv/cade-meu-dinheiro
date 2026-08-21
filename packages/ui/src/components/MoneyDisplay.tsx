// Formatação puramente textual (sem soma/subtração) — não há aritmética
// aqui, só exibição, mas ainda assim evitamos Number()/parseFloat() e
// formatamos a string manualmente, pelo mesmo espírito da regra "nunca usar
// float para dinheiro" (Documento 06, CLAUDE.md).
function formatBRL(amount: string): { sign: string; integer: string; decimals: string } {
  const trimmed = amount.trim();
  const negative = trimmed.startsWith("-");
  const unsigned = negative ? trimmed.slice(1) : trimmed;
  const [intPart = "0", decPart = "00"] = unsigned.split(".");
  const withThousands = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  const decimals = decPart.padEnd(2, "0").slice(0, 2);

  return { sign: negative ? "-" : "", integer: withThousands, decimals };
}

export type MoneyTone = "auto" | "positive" | "negative" | "neutral" | "muted";

export interface MoneyDisplayProps {
  /** Valor decimal em string, ex.: "1234.56" — nunca number. */
  amount: string;
  tone?: MoneyTone;
  /** "hero" é reservado para o número de maior destaque de uma tela (ex.: saldo total do dashboard). */
  size?: "sm" | "md" | "lg" | "hero";
  className?: string;
}

const SIZE_TOKEN: Record<NonNullable<MoneyDisplayProps["size"]>, string> = {
  sm: "var(--font-size-md)",
  md: "var(--font-size-xl)",
  lg: "var(--font-size-2xl)",
  hero: "var(--font-size-3xl)",
};

export function MoneyDisplay({ amount, tone = "neutral", size = "md", className }: MoneyDisplayProps) {
  const { sign, integer, decimals } = formatBRL(amount);
  const isNegative = sign === "-";

  const resolvedTone =
    tone === "auto" ? (isNegative ? "negative" : "positive") : tone;

  const fontSize = SIZE_TOKEN[size];

  const classes = ["cmd-money", resolvedTone !== "neutral" && `cmd-money--${resolvedTone}`, className]
    .filter(Boolean)
    .join(" ");

  const letterSpacing = size === "hero" ? "-0.02em" : undefined;

  return (
    <span className={classes} style={{ fontSize, letterSpacing }}>
      {sign}R$ {integer},{decimals}
    </span>
  );
}
