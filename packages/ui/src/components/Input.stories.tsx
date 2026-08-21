import type { Meta, StoryObj } from "@storybook/react-vite";
import { Input } from "./Input";

const meta: Meta<typeof Input> = {
  title: "Componentes/Input",
  component: Input,
};
export default meta;

type Story = StoryObj<typeof Input>;

export const Padrao: Story = { args: { label: "Nome da conta", placeholder: "Ex.: Conta Corrente" } };
export const ComAjuda: Story = {
  args: { label: "Saldo inicial", helperText: "Use ponto ou vírgula para decimais.", placeholder: "0,00" },
};
export const ComErro: Story = {
  args: { label: "Nome", value: "", error: "Nome é obrigatório." },
};
export const Desabilitado: Story = { args: { label: "Código", disabled: true, value: "0001" } };
