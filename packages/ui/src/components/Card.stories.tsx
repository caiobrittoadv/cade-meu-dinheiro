import type { Meta, StoryObj } from "@storybook/react-vite";
import { Card } from "./Card";
import { MoneyDisplay } from "./MoneyDisplay";

const meta: Meta<typeof Card> = {
  title: "Componentes/Card",
  component: Card,
};
export default meta;

type Story = StoryObj<typeof Card>;

export const Padrao: Story = {
  render: () => (
    <Card>
      <div style={{ fontSize: 13, color: "var(--color-text-secondary)", marginBottom: 8 }}>
        Saldo total
      </div>
      <MoneyDisplay amount="12450.32" tone="positive" size="lg" />
    </Card>
  ),
};
