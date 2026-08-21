import type { Meta, StoryObj } from "@storybook/react-vite";
import { EmptyState } from "./EmptyState";
import { LoadingState } from "./LoadingState";
import { Button } from "./Button";

const meta: Meta = {
  title: "Componentes/Estados",
};
export default meta;

type Story = StoryObj;

export const Vazio: Story = {
  render: () => (
    <EmptyState
      icon="💳"
      title="Nenhuma conta cadastrada"
      description="Adicione sua primeira conta para começar a organizar suas finanças."
      action={<Button variant="primary">+ Nova conta</Button>}
    />
  ),
};

export const Carregando: Story = {
  render: () => <LoadingState label="Carregando contas..." />,
};
