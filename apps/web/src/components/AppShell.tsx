"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  House,
  Bank,
  ArrowsLeftRight,
  Tag,
  CreditCard,
  Receipt,
  Target,
  Sparkle,
} from "@phosphor-icons/react/dist/ssr";
import { Header, Sidebar, type SidebarItem } from "@cade-meu-dinheiro/ui";
import { mockSpace, mockUser } from "@/lib/mock-data";

const ICON_SIZE = 18;

const NAV_ITEMS: SidebarItem[] = [
  { key: "overview", label: "Visão geral", href: "/", icon: <House size={ICON_SIZE} weight="regular" /> },
  { key: "accounts", label: "Contas", href: "/accounts", icon: <Bank size={ICON_SIZE} weight="regular" /> },
  {
    key: "transactions",
    label: "Transações",
    href: "/transactions",
    icon: <ArrowsLeftRight size={ICON_SIZE} weight="regular" />,
  },
  { key: "categories", label: "Categorias", href: "/categories", icon: <Tag size={ICON_SIZE} weight="regular" /> },
  { key: "cards", label: "Cartões", href: "/cards", icon: <CreditCard size={ICON_SIZE} weight="regular" /> },
  { key: "invoices", label: "Faturas", href: "/invoices", icon: <Receipt size={ICON_SIZE} weight="regular" /> },
  {
    key: "goals",
    label: "Metas",
    href: "/goals",
    icon: <Target size={ICON_SIZE} weight="regular" />,
    comingSoon: true,
  },
  { key: "ai", label: "IA", href: "/ai", icon: <Sparkle size={ICON_SIZE} weight="regular" />, comingSoon: true },
];

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  return (
    <div style={{ display: "flex", height: "100vh", overflow: "hidden", position: "relative", zIndex: 1 }}>
      <div className="cmd-app-ambient" aria-hidden="true" />
      <Sidebar
        items={NAV_ITEMS}
        activeHref={pathname}
        brandName="Cadê Meu Dinheiro?"
        open={mobileNavOpen}
        renderLink={(item, className, content) => (
          <Link href={item.href} className={className} onClick={() => setMobileNavOpen(false)}>
            {content}
          </Link>
        )}
      />

      {mobileNavOpen && (
        <div
          role="presentation"
          onClick={() => setMobileNavOpen(false)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(13,13,18,0.4)",
            zIndex: "var(--z-overlay)",
          }}
        />
      )}

      <div style={{ display: "flex", flexDirection: "column", flex: 1, minWidth: 0 }}>
        <Header
          spaceName={mockSpace.name}
          userName={mockUser.name}
          userEmail={mockUser.email}
          onMenuClick={() => setMobileNavOpen((open) => !open)}
        />
        <main
          style={{
            flex: 1,
            overflowY: "auto",
            padding: "var(--space-10) var(--space-10) var(--space-20)",
            background: "transparent",
            position: "relative",
          }}
        >
          <div style={{ maxWidth: 1180, margin: "0 auto" }}>{children}</div>
        </main>
      </div>
    </div>
  );
}
