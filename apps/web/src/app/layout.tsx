import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "@cade-meu-dinheiro/ui/src/styles/tokens.css";
import "@cade-meu-dinheiro/ui/src/styles/components.css";
import "./globals.css";
import { AppShell } from "@/components/AppShell";

// Substitui o fallback genérico do design system (system-ui) por uma fonte
// com identidade — Outfit é carregada de verdade via next/font (self-hosted
// pelo Next, sem chamada de rede em runtime).
const outfit = Outfit({ subsets: ["latin"], variable: "--font-outfit", display: "swap" });

export const metadata: Metadata = {
  title: "Cadê Meu Dinheiro?",
  description: "Organização financeira pessoal com captura inteligente de documentos.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className={outfit.variable}>
      <body>
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
