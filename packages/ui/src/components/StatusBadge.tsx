import { Badge, type BadgeTone } from "./Badge";

// Cobre os status reais usados pelo backend: Account/Category
// (ACTIVE/ARCHIVED), Transaction (PENDING/CONFIRMED/CANCELLED) e Invoice
// (OPEN/CLOSED/PAID/OVERDUE/CANCELLED). Um status desconhecido cai no tom
// neutro em vez de quebrar a UI.
const STATUS_MAP: Record<string, { label: string; tone: BadgeTone }> = {
  ACTIVE: { label: "Ativa", tone: "success" },
  ARCHIVED: { label: "Arquivada", tone: "neutral" },
  PENDING: { label: "Pendente", tone: "warning" },
  CONFIRMED: { label: "Confirmada", tone: "success" },
  CANCELLED: { label: "Cancelada", tone: "danger" },
  OPEN: { label: "Aberta", tone: "primary" },
  CLOSED: { label: "Fechada", tone: "neutral" },
  PAID: { label: "Paga", tone: "success" },
  OVERDUE: { label: "Vencida", tone: "danger" },
};

export interface StatusBadgeProps {
  status: string;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const entry = STATUS_MAP[status] ?? { label: status, tone: "neutral" as const };
  return <Badge tone={entry.tone}>{entry.label}</Badge>;
}
