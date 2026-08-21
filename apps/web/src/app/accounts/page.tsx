"use client";

import { useState } from "react";
import { Bank } from "@phosphor-icons/react/dist/ssr";
import {
  Button,
  Card,
  EmptyState,
  Input,
  Modal,
  MoneyDisplay,
  Select,
  Skeleton,
  StatusBadge,
  Table,
  type TableColumn,
} from "@cade-meu-dinheiro/ui";
import { PageHeader } from "@/components/PageHeader";
import { useMockQuery } from "@/lib/use-mock-query";
import { mockAccountBalances, mockAccounts } from "@/lib/mock-data";
import type { Account, AccountType } from "@/lib/types";

const ACCOUNT_TYPE_LABEL: Record<AccountType, string> = {
  CHECKING: "Conta corrente",
  SAVINGS: "Poupança",
  DIGITAL: "Conta digital",
  CASH: "Dinheiro",
  OTHER: "Outro",
};

export default function AccountsPage() {
  // Estado local só para dar vida à tela sem backend ainda conectado.
  // TODO(integração real): substituir por useMockQuery(mockAccounts) →
  // apiClient.accounts.list(spaceId), e o "criar" abaixo por
  // apiClient.accounts.create(spaceId, dto).
  const [accounts, setAccounts] = useState<Account[]>(mockAccounts);
  const query = useMockQuery(accounts);
  const [modalOpen, setModalOpen] = useState(false);

  const totalBalance = accounts.reduce((sum, account) => {
    const balance = Number(mockAccountBalances[account.id] ?? account.initialBalance);
    return sum + balance;
  }, 0);

  const columns: TableColumn<Account>[] = [
    { key: "name", header: "Nome", render: (a) => <strong>{a.name}</strong> },
    { key: "institution", header: "Instituição", render: (a) => a.institutionName ?? "—" },
    { key: "type", header: "Tipo", render: (a) => ACCOUNT_TYPE_LABEL[a.type] },
    {
      key: "balance",
      header: "Saldo",
      align: "right",
      render: (a) => <MoneyDisplay amount={mockAccountBalances[a.id] ?? a.initialBalance} size="sm" />,
    },
    { key: "status", header: "Status", render: (a) => <StatusBadge status={a.status} /> },
  ];

  return (
    <div>
      <PageHeader
        title="Contas"
        subtitle={`Saldo total: R$ ${totalBalance.toFixed(2).replace(".", ",")}`}
        action={<Button onClick={() => setModalOpen(true)}>+ Nova conta</Button>}
      />

      <Card padded={false}>
        {query.loading ? (
          <div style={{ padding: "var(--space-5)", display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
            {[0, 1, 2].map((i) => (
              <div key={i} style={{ display: "flex", gap: "var(--space-6)", alignItems: "center" }}>
                <Skeleton width={140} height={14} />
                <Skeleton width={100} height={14} />
                <Skeleton width={90} height={14} />
                <Skeleton width={80} height={14} style={{ marginLeft: "auto" }} />
                <Skeleton width={60} height={20} />
              </div>
            ))}
          </div>
        ) : query.data.length === 0 ? (
          <EmptyState
            icon={<Bank size={32} weight="light" />}
            title="Nenhuma conta cadastrada"
            description="Adicione sua primeira conta para começar a organizar suas finanças."
            action={<Button onClick={() => setModalOpen(true)}>+ Nova conta</Button>}
          />
        ) : (
          <div style={{ padding: "0 var(--space-2)" }}>
            <Table columns={columns} rows={query.data} getRowKey={(a) => a.id} />
          </div>
        )}
      </Card>

      <NewAccountModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onCreate={(account) => {
          setAccounts((prev) => [...prev, account]);
          setModalOpen(false);
        }}
      />
    </div>
  );
}

function NewAccountModal({
  open,
  onClose,
  onCreate,
}: {
  open: boolean;
  onClose: () => void;
  onCreate: (account: Account) => void;
}) {
  const [name, setName] = useState("");
  const [type, setType] = useState<AccountType>("CHECKING");
  const [institutionName, setInstitutionName] = useState("");
  const [institutionCode, setInstitutionCode] = useState("");
  const [initialBalance, setInitialBalance] = useState("0.00");
  const [currency, setCurrency] = useState("BRL");
  const [error, setError] = useState<string | null>(null);

  function handleSubmit() {
    if (name.trim().length < 2) {
      setError("Nome deve ter pelo menos 2 caracteres.");
      return;
    }

    // TODO(integração real): const created = await apiClient.accounts.create(spaceId, {
    //   name, type, institutionName, institutionCode, initialBalance, currency,
    // });
    const created: Account = {
      id: `acc-mock-${Date.now()}`,
      spaceId: "space-mock-1",
      name,
      institutionName: institutionName || null,
      institutionCode: institutionCode || null,
      type,
      initialBalance,
      currency,
      status: "ACTIVE",
    };

    onCreate(created);
    setName("");
    setInstitutionName("");
    setInstitutionCode("");
    setInitialBalance("0.00");
    setError(null);
  }

  return (
    <Modal
      open={open}
      title="Nova conta"
      onClose={onClose}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit}>Salvar</Button>
        </>
      }
    >
      <Input
        label="Nome"
        placeholder="Ex.: Conta Corrente"
        value={name}
        onChange={(e) => setName(e.target.value)}
        error={error ?? undefined}
      />
      <Select
        label="Tipo"
        value={type}
        onChange={(e) => setType(e.target.value as AccountType)}
        options={Object.entries(ACCOUNT_TYPE_LABEL).map(([value, label]) => ({ value, label }))}
      />
      <Input
        label="Instituição"
        placeholder="Ex.: Nubank"
        value={institutionName}
        onChange={(e) => setInstitutionName(e.target.value)}
      />
      <Input
        label="Código da instituição"
        placeholder="Ex.: 260"
        value={institutionCode}
        onChange={(e) => setInstitutionCode(e.target.value)}
      />
      <Input
        label="Saldo inicial"
        placeholder="0,00"
        value={initialBalance}
        onChange={(e) => setInitialBalance(e.target.value)}
        helperText="Use ponto como separador decimal (ex.: 1500.00)."
      />
      <Input
        label="Moeda"
        value={currency}
        onChange={(e) => setCurrency(e.target.value)}
        maxLength={3}
      />
    </Modal>
  );
}
