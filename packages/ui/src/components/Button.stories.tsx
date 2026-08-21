import type { Meta, StoryObj } from "@storybook/react-vite";
import { Button } from "./Button";

const meta: Meta<typeof Button> = {
  title: "Componentes/Button",
  component: Button,
  argTypes: {
    variant: { control: "select", options: ["primary", "secondary", "ghost", "danger"] },
    size: { control: "select", options: ["sm", "md", "lg"] },
  },
};
export default meta;

type Story = StoryObj<typeof Button>;

export const Primary: Story = { args: { children: "Nova conta", variant: "primary" } };
export const Secondary: Story = { args: { children: "Cancelar", variant: "secondary" } };
export const Ghost: Story = { args: { children: "Ver mais", variant: "ghost" } };
export const Danger: Story = { args: { children: "Excluir", variant: "danger" } };
export const Disabled: Story = { args: { children: "Indisponível", disabled: true } };

export const Sizes: Story = {
  render: () => (
    <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
      <Button size="sm">Pequeno</Button>
      <Button size="md">Médio</Button>
      <Button size="lg">Grande</Button>
    </div>
  ),
};
