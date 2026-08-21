// Tipos espelhando os contratos reais da API (apps/api), restritos aos
// campos que os endpoints já implementados (E07-E11.1) realmente retornam.
// Nenhum campo inventado aqui deve existir sem contrapartida no backend.

export type AccountType = "CHECKING" | "SAVINGS" | "DIGITAL" | "CASH" | "OTHER";

export interface Account {
  id: string;
  spaceId: string;
  name: string;
  institutionName: string | null;
  institutionCode: string | null;
  type: AccountType;
  initialBalance: string;
  currency: string;
  status: string;
}

export type CategoryType = "INCOME" | "EXPENSE" | "BOTH";

export interface Category {
  id: string;
  spaceId: string;
  name: string;
  type: CategoryType;
  parentId: string | null;
  icon: string | null;
  color: string | null;
  isSystem: boolean;
  status: string;
}

// TRANSFER existe no enum do backend, mas E09 não permite criá-la — por
// isso não é oferecida como opção no frontend nesta etapa.
export type TransactionType = "INCOME" | "EXPENSE";
export type TransactionStatus = "PENDING" | "CONFIRMED" | "CANCELLED";

export interface Transaction {
  id: string;
  spaceId: string;
  accountId: string | null;
  creditCardId: string | null;
  invoiceId: string | null;
  categoryId: string | null;
  type: TransactionType;
  description: string;
  amount: string;
  transactionDate: string;
  status: TransactionStatus;
  notes: string | null;
}

export interface CreditCard {
  id: string;
  spaceId: string;
  name: string;
  institutionName: string | null;
  lastFourDigits: string;
  creditLimit: string;
  closingDay: number;
  dueDay: number;
  status: string;
}

export interface CardLimit {
  creditLimit: string;
  committedAmount: string;
  availableLimit: string;
}

export type InvoiceStatus = "OPEN" | "CLOSED" | "PAID" | "OVERDUE" | "CANCELLED";

export interface Invoice {
  id: string;
  creditCardId: string;
  referenceMonth: string;
  closingDate: string;
  dueDate: string;
  status: InvoiceStatus;
  totalAmount: string;
  paidAmount: string;
  remainingAmount: string;
}

export interface AccountBalance {
  accountId: string;
  spaceId: string;
  initialBalance: string;
  currentBalance: string;
}

export interface FinancialSpace {
  id: string;
  name: string;
  type: "PERSONAL" | "BUSINESS" | "SHARED";
}
