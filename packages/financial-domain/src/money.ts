// Aritmética monetária baseada em BigInt (centavos), nunca em number/float.
// Assume 2 casas decimais, consistente com Decimal(14,2) no schema Prisma.
// Regra CLAUDE.md: "Valores monetários devem ter precisão adequada;
// não usar float para dinheiro."

const DECIMAL_PATTERN = /^-?\d+(\.\d{1,2})?$/;

export function toCents(amount: string): bigint {
  const trimmed = amount.trim();
  if (!DECIMAL_PATTERN.test(trimmed)) {
    throw new Error(`Valor monetário inválido: "${amount}"`);
  }

  const negative = trimmed.startsWith("-");
  const unsigned = negative ? trimmed.slice(1) : trimmed;
  const [intPart = "0", decPart = ""] = unsigned.split(".");
  const paddedDecimals = decPart.padEnd(2, "0").slice(0, 2);

  const cents = BigInt(intPart) * 100n + BigInt(paddedDecimals);
  return negative ? -cents : cents;
}

export function fromCents(cents: bigint): string {
  const negative = cents < 0n;
  const absolute = negative ? -cents : cents;
  const integerPart = absolute / 100n;
  const decimalPart = (absolute % 100n).toString().padStart(2, "0");

  return `${negative ? "-" : ""}${integerPart.toString()}.${decimalPart}`;
}
