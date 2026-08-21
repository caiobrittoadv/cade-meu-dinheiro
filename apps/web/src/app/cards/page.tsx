"use client";

import Link from "next/link";
import { CreditCard as CreditCardIcon } from "@phosphor-icons/react/dist/ssr";
import { Button, Card, EmptyState, MoneyDisplay, Skeleton, StatusBadge } from "@cade-meu-dinheiro/ui";
import { PageHeader } from "@/components/PageHeader";
import { useMockQuery } from "@/lib/use-mock-query";
import { mockCardLimits, mockCards } from "@/lib/mock-data";

export default function CardsPage() {
  // TODO(integração real): apiClient.cards.list(spaceId) +
  // apiClient.cards.limit(spaceId, cardId) por cartão.
  const query = useMockQuery(mockCards);

  return (
    <div>
      <PageHeader title="Cartões" subtitle="Seus cartões de crédito e limites." action={<Button>+ Novo cartão</Button>} />

      {query.loading ? (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
            gap: "var(--space-4)",
          }}
        >
          {[0, 1].map((i) => (
            <Card key={i}>
              <Skeleton width="60%" height={18} style={{ marginBottom: "var(--space-2)" }} />
              <Skeleton width="40%" height={13} style={{ marginBottom: "var(--space-6)" }} />
              <Skeleton width="50%" height={28} />
            </Card>
          ))}
        </div>
      ) : query.data.length === 0 ? (
        <Card>
          <EmptyState
            icon={<CreditCardIcon size={32} weight="light" />}
            title="Nenhum cartão cadastrado"
            description="Adicione um cartão para acompanhar faturas e limite disponível."
            action={<Button>+ Novo cartão</Button>}
          />
        </Card>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
            gap: "var(--space-4)",
          }}
        >
          {query.data.map((card) => {
            const limit = mockCardLimits[card.id];
            return (
              <Link key={card.id} href="/invoices" style={{ textDecoration: "none" }}>
                <Card interactive>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: "var(--font-size-lg)" }}>{card.name}</div>
                      <div style={{ fontSize: "var(--font-size-sm)", color: "var(--color-text-secondary)" }}>
                        {card.institutionName ?? "—"} · •••• {card.lastFourDigits}
                      </div>
                    </div>
                    <StatusBadge status={card.status} />
                  </div>

                  <div style={{ marginTop: "var(--space-5)" }}>
                    <div style={{ fontSize: "var(--font-size-xs)", color: "var(--color-text-secondary)" }}>
                      Limite disponível
                    </div>
                    <MoneyDisplay amount={limit?.availableLimit ?? card.creditLimit} size="lg" />
                    <div style={{ fontSize: "var(--font-size-xs)", color: "var(--color-text-secondary)", marginTop: "var(--space-1)" }}>
                      de <MoneyDisplay amount={card.creditLimit} tone="neutral" size="sm" />
                    </div>
                  </div>

                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      marginTop: "var(--space-5)",
                      paddingTop: "var(--space-4)",
                      borderTop: "1px solid var(--color-border)",
                      fontSize: "var(--font-size-sm)",
                      color: "var(--color-text-secondary)",
                    }}
                  >
                    <span>Fecha dia {card.closingDay}</span>
                    <span>Vence dia {card.dueDay}</span>
                  </div>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
