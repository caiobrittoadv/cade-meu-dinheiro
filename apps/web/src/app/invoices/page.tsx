"use client";

import { useMemo, useState } from "react";
import { Receipt } from "@phosphor-icons/react/dist/ssr";
import {
  Badge,
  Button,
  Card,
  EmptyState,
  Input,
  Modal,
  MoneyDisplay,
  Skeleton,
  StatusBadge,
} from "@cade-meu-dinheiro/ui";
import { PageHeader } from "@/components/PageHeader";
import { useMockQuery } from "@/lib/use-mock-query";
import { mockAccounts, mockCards, mockInvoicePurchases, mockInvoices } from "@/lib/mock-data";
import type { Invoice, Transaction } from "@/lib/types";

export default function InvoicesPage() {
  // TODO(integração real): para cada cartão, apiClient.invoices.list(spaceId, cardId).
  const query = useMockQuery(mockInvoices);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [payModalOpen, setPayModalOpen] = useState(false);

  const cardById = useMemo(() => new Map(mockCards.map((c) => [c.id, c])), []);
  const selected = query.data.find((invoice) => invoice.id === selectedId) ?? query.data[0] ?? null;
  const purchases = selected ? (mockInvoicePurchases[selected.id] ?? []) : [];

  return (
    <div>
      <PageHeader title="Faturas" subtitle="Faturas dos seus cartões de crédito." />

      {query.loading ? (
        <div style={{ display: "grid", gridTemplateColumns: "320px 1fr", gap: "var(--space-6)" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
            {[0, 1, 2].map((i) => (
              <Card key={i}>
                <Skeleton width="70%" height={16} style={{ marginBottom: "var(--space-2)" }} />
                <Skeleton width="40%" height={12} style={{ marginBottom: "var(--space-4)" }} />
                <Skeleton width="50%" height={22} />
              </Card>
            ))}
          </div>
          <Card>
            <Skeleton width="50%" height={22} style={{ marginBottom: "var(--space-6)" }} />
            <Skeleton width="100%" height={80} />
          </Card>
        </div>
      ) : query.data.length === 0 ? (
        <Card>
          <EmptyState
            icon={<Receipt size={32} weight="light" />}
            title="Nenhuma fatura ainda"
            description="Faturas aparecem aqui após a primeira compra no cartão."
          />
        </Card>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "320px 1fr", gap: "var(--space-6)", alignItems: "start" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
            {query.data.map((invoice) => {
              const isSelected = selected?.id === invoice.id;
              return (
                <button
                  key={invoice.id}
                  type="button"
                  className="cmd-unstyled-button"
                  onClick={() => setSelectedId(invoice.id)}
                >
                  <Card
                    interactive={!isSelected}
                    style={{
                      background: isSelected ? "var(--color-primary-soft)" : undefined,
                      boxShadow: isSelected
                        ? "0 0 0 2px var(--color-primary), var(--shadow-sm)"
                        : undefined,
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                      <div>
                        <div style={{ fontWeight: 700 }}>{cardById.get(invoice.creditCardId)?.name ?? "Cartão"}</div>
                        <div style={{ fontSize: "var(--font-size-xs)", color: "var(--color-text-secondary)" }}>
                          Ref. {invoice.referenceMonth}
                        </div>
                      </div>
                      <StatusBadge status={invoice.status} />
                    </div>
                    <div style={{ marginTop: "var(--space-3)" }}>
                      <MoneyDisplay amount={invoice.remainingAmount} size="md" />
                      <div style={{ fontSize: "var(--font-size-xs)", color: "var(--color-text-secondary)" }}>
                        em aberto
                      </div>
                    </div>
                  </Card>
                </button>
              );
            })}
          </div>

          {selected && (
            <InvoiceDetail
              invoice={selected}
              cardName={cardById.get(selected.creditCardId)?.name ?? "Cartão"}
              purchases={purchases}
              onPay={() => setPayModalOpen(true)}
            />
          )}
        </div>
      )}

      {selected && (
        <PayInvoiceModal
          invoice={selected}
          open={payModalOpen}
          onClose={() => setPayModalOpen(false)}
        />
      )}
    </div>
  );
}

function InvoiceDetail({
  invoice,
  cardName,
  purchases,
  onPay,
}: {
  invoice: Invoice;
  cardName: string;
  purchases: Transaction[];
  onPay: () => void;
}) {
  const canPay = invoice.status !== "PAID" && invoice.status !== "CANCELLED";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
      <Card>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "var(--space-4)" }}>
          <div>
            <div style={{ fontSize: "var(--font-size-sm)", color: "var(--color-text-secondary)" }}>{cardName}</div>
            <div style={{ fontSize: "var(--font-size-xl)", fontWeight: 800, marginTop: "var(--space-1)" }}>
              Fatura de {invoice.referenceMonth}
            </div>
          </div>
          <StatusBadge status={invoice.status} />
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
            gap: "var(--space-4)",
            marginTop: "var(--space-6)",
          }}
        >
          <MetricBlock label="Valor total" amount={invoice.totalAmount} />
          <MetricBlock label="Valor pago" amount={invoice.paidAmount} />
          <MetricBlock label="Saldo em aberto" amount={invoice.remainingAmount} highlight />
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginTop: "var(--space-6)",
            paddingTop: "var(--space-4)",
            borderTop: "1px solid var(--color-border)",
            fontSize: "var(--font-size-sm)",
            color: "var(--color-text-secondary)",
          }}
        >
          <span>Fechamento: {invoice.closingDate}</span>
          <span>Vencimento: {invoice.dueDate}</span>
        </div>

        {canPay && (
          <div style={{ marginTop: "var(--space-6)" }}>
            <Button onClick={onPay}>Pagar fatura</Button>
          </div>
        )}
      </Card>

      <Card padded={false}>
        <div style={{ padding: "var(--space-5) var(--space-5) 0" }}>
          <h3 style={{ fontSize: "var(--font-size-md)", fontWeight: 700, margin: 0 }}>Compras desta fatura</h3>
        </div>
        {purchases.length === 0 ? (
          <div style={{ padding: "var(--space-5)" }}>
            <EmptyState title="Nenhuma compra registrada" description="As compras no cartão aparecerão aqui." />
          </div>
        ) : (
          <div style={{ padding: "var(--space-2) var(--space-5) var(--space-2)" }}>
            {purchases.map((purchase) => (
              <div
                key={purchase.id}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  padding: "var(--space-3) 0",
                  borderBottom: "1px solid var(--color-border)",
                }}
              >
                <div>
                  <div style={{ fontWeight: 600 }}>{purchase.description}</div>
                  <div style={{ fontSize: "var(--font-size-xs)", color: "var(--color-text-secondary)" }}>
                    {purchase.transactionDate}
                  </div>
                </div>
                <Badge tone="neutral">
                  <MoneyDisplay amount={purchase.amount} tone="neutral" size="sm" />
                </Badge>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}

function MetricBlock({ label, amount, highlight }: { label: string; amount: string; highlight?: boolean }) {
  return (
    <div>
      <div style={{ fontSize: "var(--font-size-xs)", color: "var(--color-text-secondary)" }}>{label}</div>
      <MoneyDisplay amount={amount} tone={highlight ? "auto" : "neutral"} size="md" />
    </div>
  );
}

function PayInvoiceModal({ invoice, open, onClose }: { invoice: Invoice; open: boolean; onClose: () => void }) {
  const [accountId, setAccountId] = useState(mockAccounts[0]?.id ?? "");
  const [amount, setAmount] = useState(invoice.remainingAmount);

  // TODO(integração real): apiClient.invoices.registerPayment(spaceId, cardId,
  // invoice.id, { accountId, amount, transactionDate }).
  function handleSubmit() {
    onClose();
  }

  return (
    <Modal
      open={open}
      title="Pagar fatura"
      onClose={onClose}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit}>Confirmar pagamento</Button>
        </>
      }
    >
      <div style={{ fontSize: "var(--font-size-sm)", color: "var(--color-text-secondary)" }}>
        Saldo em aberto: <MoneyDisplay amount={invoice.remainingAmount} size="sm" tone="neutral" />
      </div>
      <label className="cmd-field">
        <span className="cmd-label">Conta de origem</span>
        <select className="cmd-select" value={accountId} onChange={(e) => setAccountId(e.target.value)}>
          {mockAccounts.map((account) => (
            <option key={account.id} value={account.id}>
              {account.name}
            </option>
          ))}
        </select>
      </label>
      <Input
        label="Valor do pagamento"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        helperText="Pagamento parcial é permitido; não pode exceder o saldo em aberto."
      />
    </Modal>
  );
}
