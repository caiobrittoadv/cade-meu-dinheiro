import type { Meta, StoryObj } from "@storybook/react-vite";
import { Skeleton } from "./Skeleton";

const meta: Meta<typeof Skeleton> = {
  title: "Componentes/Skeleton",
  component: Skeleton,
};
export default meta;

type Story = StoryObj<typeof Skeleton>;

export const LinhaDeTabela: Story = {
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: 12, width: 400 }}>
      {[0, 1, 2].map((i) => (
        <div key={i} style={{ display: "flex", gap: 16, alignItems: "center" }}>
          <Skeleton width={120} height={14} />
          <Skeleton width={80} height={14} />
          <Skeleton width={60} height={14} style={{ marginLeft: "auto" }} />
        </div>
      ))}
    </div>
  ),
};

export const Card: Story = {
  render: () => (
    <div style={{ width: 260, display: "flex", flexDirection: "column", gap: 8 }}>
      <Skeleton width="60%" height={18} />
      <Skeleton width="40%" height={28} />
    </div>
  ),
};
