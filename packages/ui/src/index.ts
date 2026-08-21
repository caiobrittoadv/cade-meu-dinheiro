// Design System — Cadê Meu Dinheiro?
// Tokens (Documento 02 — Brandbook) + componentes reutilizáveis.
// CSS: importar "@cade-meu-dinheiro/ui/src/styles/tokens.css" e
// "/components.css" uma vez na raiz do app consumidor.

export { colors } from "./tokens/colors";
export type { ColorToken } from "./tokens/colors";

export { Button } from "./components/Button";
export type { ButtonProps, ButtonVariant, ButtonSize } from "./components/Button";

export { Input } from "./components/Input";
export type { InputProps } from "./components/Input";

export { Select } from "./components/Select";
export type { SelectProps, SelectOption } from "./components/Select";

export { Card } from "./components/Card";
export type { CardProps } from "./components/Card";

export { Badge } from "./components/Badge";
export type { BadgeProps, BadgeTone } from "./components/Badge";

export { StatusBadge } from "./components/StatusBadge";
export type { StatusBadgeProps } from "./components/StatusBadge";

export { Modal } from "./components/Modal";
export type { ModalProps } from "./components/Modal";

export { Table } from "./components/Table";
export type { TableProps, TableColumn } from "./components/Table";

export { EmptyState } from "./components/EmptyState";
export type { EmptyStateProps } from "./components/EmptyState";

export { LoadingState } from "./components/LoadingState";
export type { LoadingStateProps } from "./components/LoadingState";

export { MoneyDisplay } from "./components/MoneyDisplay";
export type { MoneyDisplayProps, MoneyTone } from "./components/MoneyDisplay";

export { Sidebar } from "./components/Sidebar";
export type { SidebarProps, SidebarItem } from "./components/Sidebar";

export { Header } from "./components/Header";
export type { HeaderProps } from "./components/Header";

export { Skeleton } from "./components/Skeleton";
export type { SkeletonProps } from "./components/Skeleton";
