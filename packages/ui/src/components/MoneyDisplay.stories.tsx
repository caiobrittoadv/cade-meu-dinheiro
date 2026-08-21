import type { Meta, StoryObj } from "@storybook/react-vite";
import { MoneyDisplay } from "./MoneyDisplay";

const meta: Meta<typeof MoneyDisplay> = {
  title: "Componentes/MoneyDisplay",
  component: MoneyDisplay,
};
export default meta;

type Story = StoryObj<typeof MoneyDisplay>;

export const Exemplos: Story = {
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <MoneyDisplay amount="12450.32" tone="auto" size="lg" />
      <MoneyDisplay amount="-380.90" tone="auto" size="lg" />
      <MoneyDisplay amount="0.00" tone="muted" size="md" />
      <MoneyDisplay amount="1234567.89" tone="neutral" size="md" />
    </div>
  ),
};
