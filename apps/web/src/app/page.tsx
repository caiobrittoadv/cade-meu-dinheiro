"use client";

import Link from "next/link";
import { Card, MoneyDisplay, StatusBadge, Skeleton } from "@cade-meu-dinheiro/ui";
import { PageHeader } from "@/components/PageHeader";
import { useMockQuery } from "@/lib/use-mock-query";
import {
  mockAccountBalances,
  mockAccounts,
  mockCards,
  mockCardLimits,
  mockDashboardSummary,
  mockInvoices,
  mockTransactions,
} from "@/lib/mock-data";

// TODO(integração real): quando existir um endpoint de resumo (fora do
// escopo até E31 — Analytics), trocar mockDashboardSummary por uma
// agregação real. Enquanto isso não existe, os cards abaixo derivam de
// dados já mockados de accounts/transactions.
export default function DashboardPage() {
  const summary = useMockQuery(mockDashboardSummary);
  const accounts = useMockQuery(mockAccounts);
  const transactions = useMockQuery(mockTransactions.slice(0, 5));
  const cards = useMockQuery(mockCards);
  const invoices = useMockQuery(
    [...mockInvoices].sort((a, b) => a.dueDate.localeCompare(b.dueDate)).slice(0, 3),
  );

  return (
    <div>
      <PageHeader title="Visão geral" subtitle="Veja como estão suas finanças." />

      {summary.loading ? (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1.6fr 1fr 1fr 1fr",
            gap: "var(--space-4)",
            marginBottom: "var(--space-10)",
          }}
        >
          {[0, 1, 2, 3].map((i) => (
            <Card key={i}>
              <Skeleton width="50%" height={13} style={{ marginBottom: "var(--space-3)" }} />
              <Skeleton width="70%" height={24} />
            </Card>
          ))}
        </div>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1.6fr 1fr 1fr 1fr",
            gap: "var(--space-4)",
            marginBottom: "var(--space-10)",
          }}
        >
          <Card className="cmd-hero-glow">
            <div
              style={{
                fontSize: "var(--font-size-sm)",
                fontWeight: 600,
                color: "var(--color-text-secondary)",
                marginBottom: "var(--space-3)",
              }}
            >
              Saldo total
            </div>
            <MoneyDisplay amount={summary.data.totalBalance} tone="neutral" size="hero" />
          </Card>
          <SummaryCard label="Receitas" amount={summary.data.income} tone="positive" />
          <SummaryCard label="Despesas" amount={summary.data.expenses} tone="negative" />
          <SummaryCard label="Comprometido" amount={summary.data.committed} tone="muted" />
        </div>
      )}

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1.2fr 1fr",
          gap: "var(--space-8)",
          alignItems: "start",
        }}
      >
        <SectionCard title="Últimas transações" viewAllHref="/transactions">
          {transactions.loading ? (
            <RowSkeletonList count={5} />
          ) : (
            <div style={{ display: "flex", flexDirection: "column" }}>
              {transactions.data.map((tx) => (
                <Row key={tx.id}>
                  <div>
                    <div style={{ fontWeight: 600 }}>{tx.description}</div>
                    <div style={{ fontSize: "var(--font-size-xs)", color: "var(--color-text-secondary)" }}>
                      {tx.transactionDate}
                    </div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "var(--space-3)" }}>
                    <StatusBadge status={tx.status} />
                    <MoneyDisplay
                      amount={tx.type === "EXPENSE" ? `-${tx.amount}` : tx.amount}
                      tone="auto"
                      size="sm"
                    />
                  </div>
                </Row>
              ))}
            </div>
          )}
        </SectionCard>

        <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-6)" }}>
          <SectionCard title="Contas" viewAllHref="/accounts">
            {accounts.loading ? (
              <RowSkeletonList count={3} />
            ) : (
              <div style={{ display: "flex", flexDirection: "column" }}>
                {accounts.data.map((account) => (
                  <Row key={account.id}>
                    <div style={{ fontWeight: 600 }}>{account.name}</div>
                    <MoneyDisplay amount={mockAccountBalances[account.id] ?? "0.00"} size="sm" />
                  </Row>
                ))}
              </div>
            )}
          </SectionCard>

          <SectionCard title="Cartões" viewAllHref="/cards">
            {cards.loading ? (
              <RowSkeletonList count={2} />
            ) : (
              <div style={{ display: "flex", flexDirection: "column" }}>
                {cards.data.map((card) => (
                  <Row key={card.id}>
                    <div>
                      <div style={{ fontWeight: 600 }}>{card.name}</div>
                      <div style={{ fontSize: "var(--font-size-xs)", color: "var(--color-text-secondary)" }}>
                        •••• {card.lastFourDigits}
                      </div>
                    </div>
                    <MoneyDisplay amount={mockCardLimits[card.id]?.availableLimit ?? "0.00"} size="sm" />
                  </Row>
                ))}
              </div>
            )}
          </SectionCard>

          <SectionCard title="Faturas próximas" viewAllHref="/invoices">
            {invoices.loading ? (
              <RowSkeletonList count={3} />
            ) : (
              <div style={{ display: "flex", flexDirection: "column" }}>
                {invoices.data.map((invoice) => (
                  <Row key={invoice.id}>
                    <div>
                      <div style={{ fontWeight: 600 }}>Venc. {invoice.dueDate}</div>
                      <StatusBadge status={invoice.status} />
                    </div>
                    <MoneyDisplay amount={invoice.remainingAmount} size="sm" />
                  </Row>
                ))}
              </div>
            )}
          </SectionCard>
        </div>
      </div>
    </div>
  );
}

function SummaryCard({
  label,
  amount,
  tone,
}: {
  label: string;
  amount: string;
  tone: "neutral" | "positive" | "negative" | "muted";
}) {
  return (
    <Card>
      <div style={{ fontSize: "var(--font-size-sm)", color: "var(--color-text-secondary)", marginBottom: "var(--space-2)" }}>
        {label}
      </div>
      <MoneyDisplay amount={amount} tone={tone} size="md" />
    </Card>
  );
}

function SectionCard({
  title,
  viewAllHref,
  children,
}: {
  title: string;
  viewAllHref: string;
  children: React.ReactNode;
}) {
  return (
    <Card padded={false}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "var(--space-4) var(--space-5)",
          borderBottom: "1px solid var(--color-border)",
        }}
      >
        <h2 style={{ fontSize: "var(--font-size-md)", fontWeight: 700, margin: 0 }}>{title}</h2>
        <Link
          href={viewAllHref}
          style={{ fontSize: "var(--font-size-sm)", color: "var(--color-primary)", fontWeight: 600 }}
        >
          Ver tudo
        </Link>
      </div>
      <div style={{ padding: "0 var(--space-5)" }}>{children}</div>
    </Card>
  );
}

function RowSkeletonList({ count }: { count: number }) {
  return (
    <>
      {Array.from({ length: count }, (_, i) => (
        <Row key={i}>
          <div style={{ flex: 1 }}>
            <Skeleton width="60%" height={14} style={{ marginBottom: "var(--space-1)" }} />
            <Skeleton width="30%" height={11} />
          </div>
          <Skeleton width={70} height={14} />
        </Row>
      ))}
    </>
  );
}

function Row({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: "var(--space-3)",
        padding: "var(--space-4) 0",
        borderBottom: "1px solid var(--color-border)",
      }}
    >
      {children}
    </div>
  );
}
