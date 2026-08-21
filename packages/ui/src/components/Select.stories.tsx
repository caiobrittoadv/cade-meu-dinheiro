import type { Meta, StoryObj } from "@storybook/react-vite";
import { Select } from "./Select";

const meta: Meta<typeof Select> = {
  title: "Componentes/Select",
  component: Select,
};
export default meta;

type Story = StoryObj<typeof Select>;

export const Padrao: Story = {
  args: {
    label: "Tipo de conta",
    placeholder: "Selecione",
    options: [
      { value: "CHECKING", label: "Conta corrente" },
      { value: "SAVINGS", label: "Poupança" },
      { value: "DIGITAL", label: "Conta digital" },
      { value: "CASH", label: "Dinheiro" },
    ],
  },
};
