import type { Meta, StoryObj } from "@storybook/react-vite";
import { Badge } from "./Badge";
import { StatusBadge } from "./StatusBadge";

const meta: Meta<typeof Badge> = {
  title: "Componentes/Badge",
  component: Badge,
};
export default meta;

type Story = StoryObj<typeof Badge>;

export const Tons: Story = {
  render: () => (
    <div style={{ display: "flex", gap: 8 }}>
      <Badge tone="neutral">Neutro</Badge>
      <Badge tone="primary">Destaque</Badge>
      <Badge tone="success">Sucesso</Badge>
      <Badge tone="danger">Erro</Badge>
      <Badge tone="warning">Atenção</Badge>
    </div>
  ),
};

export const StatusReais: Story = {
  render: () => (
    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
      <StatusBadge status="ACTIVE" />
      <StatusBadge status="ARCHIVED" />
      <StatusBadge status="PENDING" />
      <StatusBadge status="CONFIRMED" />
      <StatusBadge status="CANCELLED" />
      <StatusBadge status="OPEN" />
      <StatusBadge status="CLOSED" />
      <StatusBadge status="PAID" />
      <StatusBadge status="OVERDUE" />
    </div>
  ),
};
