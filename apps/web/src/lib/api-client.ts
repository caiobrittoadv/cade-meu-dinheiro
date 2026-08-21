// Cliente de API — camada de integração real com apps/api.
//
// AINDA NÃO É CHAMADO por nenhuma tela nesta etapa: as páginas usam dados
// mockados (lib/mock-data.ts + lib/data/*) até existir um fluxo de login
// real que forneça accessToken e spaceId. As funções abaixo já batem
// exatamente com os contratos reais implementados em E07-E11.1 — quando a
// autenticação existir, basta trocar cada hook `useMock*` por uma chamada
// a uma destas funções (React Query, SWR ou fetch direto).

import type {
  Account,
  AccountBalance,
  CardLimit,
  Category,
  CreditCard,
  Invoice,
  Transaction,
} from "./types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

// TODO(integração real): ler o token do fluxo de autenticação (E05) quando
// o login estiver implementado no frontend — hoje não há sessão nenhuma.
function getAccessToken(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem("accessToken");
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getAccessToken();

  const response = await fetch(`${API_BASE_URL}/api/v1${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  if (!response.ok) {
    const body = await response.json().catch(() => null);
    throw new Error(body?.message ?? `Erro ${response.status} ao chamar ${path}`);
  }

  return response.json() as Promise<T>;
}

// ---------- Accounts (E07) ----------
export const apiClient = {
  accounts: {
    list: (spaceId: string) => request<Account[]>(`/spaces/${spaceId}/accounts`),
    get: (spaceId: string, accountId: string) =>
      request<Account>(`/spaces/${spaceId}/accounts/${accountId}`),
    create: (
      spaceId: string,
      dto: {
        name: string;
        type?: Account["type"];
        institutionName?: string;
        institutionCode?: string;
        initialBalance?: string;
        currency?: string;
      },
    ) =>
      request<Account>(`/spaces/${spaceId}/accounts`, {
        method: "POST",
        body: JSON.stringify(dto),
      }),
    update: (
      spaceId: string,
      accountId: string,
      dto: Partial<Pick<Account, "name" | "institutionName" | "institutionCode" | "status">>,
    ) =>
      request<Account>(`/spaces/${spaceId}/accounts/${accountId}`, {
        method: "PATCH",
        body: JSON.stringify(dto),
      }),
    balance: (spaceId: string, accountId: string) =>
      request<AccountBalance>(`/spaces/${spaceId}/accounts/${accountId}/balance`),
  },

  // ---------- Categories (E08) ----------
  categories: {
    list: (spaceId: string) => request<Category[]>(`/spaces/${spaceId}/categories`),
    get: (spaceId: string, categoryId: string) =>
      request<Category>(`/spaces/${spaceId}/categories/${categoryId}`),
    create: (
      spaceId: string,
      dto: { name: string; type?: Category["type"]; parentId?: string; icon?: string; color?: string },
    ) =>
      request<Category>(`/spaces/${spaceId}/categories`, {
        method: "POST",
        body: JSON.stringify(dto),
      }),
    update: (
      spaceId: string,
      categoryId: string,
      dto: Partial<Pick<Category, "name" | "icon" | "color" | "status">> & { parentId?: string },
    ) =>
      request<Category>(`/spaces/${spaceId}/categories/${categoryId}`, {
        method: "PATCH",
        body: JSON.stringify(dto),
      }),
  },

  // ---------- Transactions (E09) ----------
  transactions: {
    list: (spaceId: string) => request<Transaction[]>(`/spaces/${spaceId}/transactions`),
    get: (spaceId: string, transactionId: string) =>
      request<Transaction>(`/spaces/${spaceId}/transactions/${transactionId}`),
    create: (
      spaceId: string,
      dto: {
        type: Transaction["type"];
        description: string;
        amount: string;
        transactionDate: string;
        accountId?: string;
        categoryId?: string;
        status?: "PENDING" | "CONFIRMED";
        notes?: string;
      },
    ) =>
      request<Transaction>(`/spaces/${spaceId}/transactions`, {
        method: "POST",
        body: JSON.stringify(dto),
      }),
    update: (spaceId: string, transactionId: string, dto: Record<string, unknown>) =>
      request<Transaction>(`/spaces/${spaceId}/transactions/${transactionId}`, {
        method: "PATCH",
        body: JSON.stringify(dto),
      }),
    cancel: (spaceId: string, transactionId: string) =>
      request<Transaction>(`/spaces/${spaceId}/transactions/${transactionId}/cancel`, {
        method: "POST",
      }),
  },

  // ---------- Cards + Invoices (E11.1) ----------
  cards: {
    list: (spaceId: string) => request<CreditCard[]>(`/spaces/${spaceId}/cards`),
    get: (spaceId: string, cardId: string) =>
      request<CreditCard>(`/spaces/${spaceId}/cards/${cardId}`),
    create: (
      spaceId: string,
      dto: {
        name: string;
        institutionName?: string;
        institutionCode?: string;
        lastFourDigits: string;
        creditLimit: string;
        closingDay: number;
        dueDay: number;
      },
    ) =>
      request<CreditCard>(`/spaces/${spaceId}/cards`, {
        method: "POST",
        body: JSON.stringify(dto),
      }),
    update: (spaceId: string, cardId: string, dto: Record<string, unknown>) =>
      request<CreditCard>(`/spaces/${spaceId}/cards/${cardId}`, {
        method: "PATCH",
        body: JSON.stringify(dto),
      }),
    limit: (spaceId: string, cardId: string) =>
      request<CardLimit>(`/spaces/${spaceId}/cards/${cardId}/limit`),
    registerPurchase: (
      spaceId: string,
      cardId: string,
      dto: { description: string; amount: string; transactionDate: string; categoryId?: string; status?: "PENDING" | "CONFIRMED" },
    ) =>
      request<Transaction>(`/spaces/${spaceId}/cards/${cardId}/purchases`, {
        method: "POST",
        body: JSON.stringify(dto),
      }),
  },

  invoices: {
    list: (spaceId: string, cardId: string) =>
      request<Invoice[]>(`/spaces/${spaceId}/cards/${cardId}/invoices`),
    get: (spaceId: string, cardId: string, invoiceId: string) =>
      request<Invoice>(`/spaces/${spaceId}/cards/${cardId}/invoices/${invoiceId}`),
    registerPayment: (
      spaceId: string,
      cardId: string,
      invoiceId: string,
      dto: { accountId: string; amount: string; transactionDate: string; description?: string },
    ) =>
      request<{ payment: Transaction; invoice: Invoice }>(
        `/spaces/${spaceId}/cards/${cardId}/invoices/${invoiceId}/payments`,
        { method: "POST", body: JSON.stringify(dto) },
      ),
  },

  // ---------- Spaces (E06) ----------
  spaces: {
    list: () => request<Array<{ id: string; name: string; type: string }>>("/spaces"),
  },
};
