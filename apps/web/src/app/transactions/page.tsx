"use client";

import { useMemo, useState } from "react";
import { ArrowsLeftRight } from "@phosphor-icons/react/dist/ssr";
import {
  Badge,
  Button,
  Card,
  EmptyState,
  MoneyDisplay,
  Select,
  Skeleton,
  StatusBadge,
  Table,
  type TableColumn,
} from "@cade-meu-dinheiro/ui";
import { PageHeader } from "@/components/PageHeader";
import { useMockQuery } from "@/lib/use-mock-query";
import { mockAccounts, mockCategories, mockTransactions } from "@/lib/mock-data";
import type { Transaction } from "@/lib/types";

const TYPE_LABEL: Record<Transaction["type"], string> = {
  INCOME: "Receita",
  EXPENSE: "Despesa",
};

export default function TransactionsPage() {
  // TODO(integração real): apiClient.transactions.list(spaceId).
  const query = useMockQuery(mockTransactions);

  const [accountFilter, setAccountFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const accountById = useMemo(() => new Map(mockAccounts.map((a) => [a.id, a])), []);
  const categoryById = useMemo(() => new Map(mockCategories.map((c) => [c.id, c])), []);

  const filtered = query.data.filter((tx) => {
    if (accountFilter && tx.accountId !== accountFilter) return false;
    if (categoryFilter && tx.categoryId !== categoryFilter) return false;
    if (typeFilter && tx.type !== typeFilter) return false;
    if (statusFilter && tx.status !== statusFilter) return false;
    return true;
  });

  const columns: TableColumn<Transaction>[] = [
    { key: "date", header: "Data", render: (tx) => tx.transactionDate },
    { key: "description", header: "Descrição", render: (tx) => <strong>{tx.description}</strong> },
    {
      key: "category",
      header: "Categoria",
      render: (tx) =>
        tx.categoryId ? (
          <Badge tone="neutral">{categoryById.get(tx.categoryId)?.name ?? "—"}</Badge>
        ) : (
          "—"
        ),
    },
    {
      key: "account",
      header: "Conta",
      render: (tx) => (tx.accountId ? (accountById.get(tx.accountId)?.name ?? "—") : "—"),
    },
    { key: "type", header: "Tipo", render: (tx) => TYPE_LABEL[tx.type] },
    { key: "status", header: "Status", render: (tx) => <StatusBadge status={tx.status} /> },
    {
      key: "amount",
      header: "Valor",
      align: "right",
      render: (tx) => (
        <MoneyDisplay amount={tx.type === "EXPENSE" ? `-${tx.amount}` : tx.amount} tone="auto" size="sm" />
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Transações"
        subtitle="Receitas e despesas do seu Financial Space."
        action={<Button>+ Nova transação</Button>}
      />

      <Card style={{ marginBottom: "var(--space-6)" }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
            gap: "var(--space-4)",
          }}
        >
          <Select
            label="Período"
            placeholder="Todos"
            value=""
            onChange={() => undefined}
            options={[{ value: "current-month", label: "Mês atual" }]}
          />
          <Select
            label="Conta"
            placeholder="Todas"
            value={accountFilter}
            onChange={(e) => setAccountFilter(e.target.value)}
            options={mockAccounts.map((a) => ({ value: a.id, label: a.name }))}
          />
          <Select
            label="Categoria"
            placeholder="Todas"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            options={mockCategories.map((c) => ({ value: c.id, label: c.name }))}
          />
          <Select
            label="Tipo"
            placeholder="Todos"
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            options={[
              { value: "INCOME", label: "Receita" },
              { value: "EXPENSE", label: "Despesa" },
            ]}
          />
          <Select
            label="Status"
            placeholder="Todos"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            options={[
              { value: "PENDING", label: "Pendente" },
              { value: "CONFIRMED", label: "Confirmada" },
              { value: "CANCELLED", label: "Cancelada" },
            ]}
          />
        </div>
      </Card>

      <Card padded={false}>
        {query.loading ? (
          <div style={{ padding: "var(--space-5)", display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
            {[0, 1, 2, 3].map((i) => (
              <div key={i} style={{ display: "flex", gap: "var(--space-6)", alignItems: "center" }}>
                <Skeleton width={70} height={14} />
                <Skeleton width={160} height={14} />
                <Skeleton width={90} height={14} />
                <Skeleton width={70} height={14} style={{ marginLeft: "auto" }} />
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={<ArrowsLeftRight size={32} weight="light" />}
            title="Nenhuma transação encontrada"
            description="Ajuste os filtros ou registre um novo lançamento."
          />
        ) : (
          <div style={{ padding: "0 var(--space-2)" }}>
            <Table columns={columns} rows={filtered} getRowKey={(tx) => tx.id} />
          </div>
        )}
      </Card>
    </div>
  );
}
