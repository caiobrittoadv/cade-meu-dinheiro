// Dados mockados — usados apenas até a integração real com a API entrar em
// vigor página a página. Todo shape aqui corresponde exatamente ao que os
// endpoints reais do backend (E07-E11.1) retornam (ver lib/types.ts e
// lib/api-client.ts) — nenhum campo inventado.
//
// Cada tela consome estes dados através de um hook `useMock*` (lib/data/*)
// que já está estruturado para ser substituído pela chamada real via
// apiClient sem mudar a UI.

import type {
  Account,
  CardLimit,
  Category,
  CreditCard,
  FinancialSpace,
  Invoice,
  Transaction,
} from "./types";

export const mockSpace: FinancialSpace = {
  id: "space-mock-1",
  name: "Meu espaço pessoal",
  type: "PERSONAL",
};

export const mockUser = {
  name: "Ana Souza",
  email: "ana@example.com",
};

export const mockAccounts: Account[] = [
  {
    id: "acc-1",
    spaceId: mockSpace.id,
    name: "Conta Corrente",
    institutionName: "Nubank",
    institutionCode: "260",
    type: "CHECKING",
    initialBalance: "3200.00",
    currency: "BRL",
    status: "ACTIVE",
  },
  {
    id: "acc-2",
    spaceId: mockSpace.id,
    name: "Poupança",
    institutionName: "Itaú",
    institutionCode: "341",
    type: "SAVINGS",
    initialBalance: "8500.00",
    currency: "BRL",
    status: "ACTIVE",
  },
  {
    id: "acc-3",
    spaceId: mockSpace.id,
    name: "Carteira",
    institutionName: null,
    institutionCode: null,
    type: "CASH",
    initialBalance: "150.00",
    currency: "BRL",
    status: "ACTIVE",
  },
];

// Saldos calculados (equivalente ao que GET .../accounts/:id/balance do E10
// retornaria) — pré-computados aqui só porque os dados são mockados.
export const mockAccountBalances: Record<string, string> = {
  "acc-1": "2740.55",
  "acc-2": "8500.00",
  "acc-3": "95.00",
};

export const mockCategories: Category[] = [
  { id: "cat-1", spaceId: mockSpace.id, name: "Outros", type: "EXPENSE", parentId: null, icon: "🗂️", color: null, isSystem: true, status: "ACTIVE" },
  { id: "cat-2", spaceId: mockSpace.id, name: "Alimentação", type: "EXPENSE", parentId: null, icon: "🍽️", color: "#F59E0B", isSystem: false, status: "ACTIVE" },
  { id: "cat-3", spaceId: mockSpace.id, name: "Mercado", type: "EXPENSE", parentId: "cat-2", icon: "🛒", color: "#F59E0B", isSystem: false, status: "ACTIVE" },
  { id: "cat-4", spaceId: mockSpace.id, name: "Transporte", type: "EXPENSE", parentId: null, icon: "🚗", color: "#3B82F6", isSystem: false, status: "ACTIVE" },
  { id: "cat-5", spaceId: mockSpace.id, name: "Salário", type: "INCOME", parentId: null, icon: "💼", color: "#16A34A", isSystem: false, status: "ACTIVE" },
  { id: "cat-6", spaceId: mockSpace.id, name: "Lazer", type: "EXPENSE", parentId: null, icon: "🎬", color: "#A855F7", isSystem: false, status: "ARCHIVED" },
];

export const mockTransactions: Transaction[] = [
  { id: "tx-1", spaceId: mockSpace.id, accountId: "acc-1", creditCardId: null, invoiceId: null, categoryId: "cat-5", type: "INCOME", description: "Salário de março", amount: "5000.00", transactionDate: "2026-03-05", status: "CONFIRMED", notes: null },
  { id: "tx-2", spaceId: mockSpace.id, accountId: "acc-1", creditCardId: null, invoiceId: null, categoryId: "cat-3", type: "EXPENSE", description: "Supermercado Extra", amount: "459.45", transactionDate: "2026-03-08", status: "CONFIRMED", notes: null },
  { id: "tx-3", spaceId: mockSpace.id, accountId: "acc-1", creditCardId: null, invoiceId: null, categoryId: "cat-4", type: "EXPENSE", description: "Combustível", amount: "220.00", transactionDate: "2026-03-09", status: "CONFIRMED", notes: null },
  { id: "tx-4", spaceId: mockSpace.id, accountId: "acc-3", creditCardId: null, invoiceId: null, categoryId: "cat-2", type: "EXPENSE", description: "Restaurante", amount: "89.90", transactionDate: "2026-03-10", status: "PENDING", notes: null },
  { id: "tx-5", spaceId: mockSpace.id, accountId: "acc-2", creditCardId: null, invoiceId: null, categoryId: null, type: "INCOME", description: "Rendimento poupança", amount: "38.20", transactionDate: "2026-03-01", status: "CONFIRMED", notes: null },
  { id: "tx-6", spaceId: mockSpace.id, accountId: "acc-1", creditCardId: null, invoiceId: null, categoryId: "cat-1", type: "EXPENSE", description: "Assinatura cancelada", amount: "29.90", transactionDate: "2026-02-20", status: "CANCELLED", notes: null },
];

export const mockCards: CreditCard[] = [
  {
    id: "card-1",
    spaceId: mockSpace.id,
    name: "Nubank Ultravioleta",
    institutionName: "Nubank",
    lastFourDigits: "4821",
    creditLimit: "8000.00",
    closingDay: 10,
    dueDay: 17,
    status: "ACTIVE",
  },
  {
    id: "card-2",
    spaceId: mockSpace.id,
    name: "Itaú Click",
    institutionName: "Itaú",
    lastFourDigits: "1290",
    creditLimit: "3500.00",
    closingDay: 22,
    dueDay: 29,
    status: "ACTIVE",
  },
];

export const mockCardLimits: Record<string, CardLimit> = {
  "card-1": { creditLimit: "8000.00", committedAmount: "1230.50", availableLimit: "6769.50" },
  "card-2": { creditLimit: "3500.00", committedAmount: "540.00", availableLimit: "2960.00" },
};

export const mockInvoices: Invoice[] = [
  {
    id: "inv-1",
    creditCardId: "card-1",
    referenceMonth: "2026-03-01",
    closingDate: "2026-03-10",
    dueDate: "2026-03-17",
    status: "OPEN",
    totalAmount: "1230.50",
    paidAmount: "0.00",
    remainingAmount: "1230.50",
  },
  {
    id: "inv-2",
    creditCardId: "card-1",
    referenceMonth: "2026-02-01",
    closingDate: "2026-02-10",
    dueDate: "2026-02-17",
    status: "PAID",
    totalAmount: "890.00",
    paidAmount: "890.00",
    remainingAmount: "0.00",
  },
  {
    id: "inv-3",
    creditCardId: "card-2",
    referenceMonth: "2026-03-01",
    closingDate: "2026-03-22",
    dueDate: "2026-03-29",
    status: "OPEN",
    totalAmount: "540.00",
    paidAmount: "0.00",
    remainingAmount: "540.00",
  },
];

export const mockInvoicePurchases: Record<string, Transaction[]> = {
  "inv-1": [
    { id: "tx-p1", spaceId: mockSpace.id, accountId: null, creditCardId: "card-1", invoiceId: "inv-1", categoryId: "cat-2", type: "EXPENSE", description: "Restaurante Sushi", amount: "180.50", transactionDate: "2026-03-02", status: "CONFIRMED", notes: null },
    { id: "tx-p2", spaceId: mockSpace.id, accountId: null, creditCardId: "card-1", invoiceId: "inv-1", categoryId: "cat-4", type: "EXPENSE", description: "Uber", amount: "50.00", transactionDate: "2026-03-04", status: "CONFIRMED", notes: null },
    { id: "tx-p3", spaceId: mockSpace.id, accountId: null, creditCardId: "card-1", invoiceId: "inv-1", categoryId: "cat-3", type: "EXPENSE", description: "Mercado Livre", amount: "1000.00", transactionDate: "2026-03-06", status: "CONFIRMED", notes: null },
  ],
};

// Resumo do dashboard — não existe endpoint de dashboard/analytics ainda
// (fora do escopo até E31). Estes números são calculados aqui a partir dos
// próprios mocks acima, só para dar forma visual à tela.
export interface DashboardSummary {
  totalBalance: string;
  income: string;
  expenses: string;
  committed: string;
}

export const mockDashboardSummary: DashboardSummary = {
  totalBalance: "11335.55",
  income: "5038.20",
  expenses: "769.35",
  committed: "1770.50",
};
