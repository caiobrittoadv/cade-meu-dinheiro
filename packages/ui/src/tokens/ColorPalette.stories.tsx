import type { Meta, StoryObj } from "@storybook/react-vite";
import { colors } from "./colors";

function Swatch({ name, hex }: { name: string; hex: string }) {
  const isLight = hex === "#FFFFFF" || hex === "#C77DFF";
  return (
    <div style={{ display: "flex", flexDirection: "column", width: 160 }}>
      <div
        style={{
          height: 72,
          borderRadius: 8,
          background: hex,
          border: "1px solid #24242E22",
          display: "flex",
          alignItems: "flex-end",
          padding: 8,
          boxSizing: "border-box",
        }}
      >
        <span
          style={{
            fontFamily: "monospace",
            fontSize: 12,
            color: isLight ? "#17171F" : "#FFFFFF",
          }}
        >
          {hex}
        </span>
      </div>
      <span style={{ fontSize: 13, marginTop: 6 }}>{name}</span>
    </div>
  );
}

function Group({ title, entries }: { title: string; entries: [string, string][] }) {
  return (
    <div style={{ marginBottom: 32 }}>
      <h3 style={{ fontFamily: "sans-serif", marginBottom: 12 }}>{title}</h3>
      <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
        {entries.map(([name, hex]) => (
          <Swatch key={name} name={name} hex={hex} />
        ))}
      </div>
    </div>
  );
}

function Palette() {
  return (
    <div style={{ padding: 24 }}>
      <Group title="Roxo Nubank (cor primária)" entries={Object.entries(colors.purple)} />
      <Group title="Paleta escura (tema único)" entries={Object.entries(colors.dark)} />
    </div>
  );
}

const meta: Meta<typeof Palette> = {
  title: "Design Tokens/Cores",
  component: Palette,
};

export default meta;
type Story = StoryObj<typeof Palette>;

export const Padrao: Story = {};
