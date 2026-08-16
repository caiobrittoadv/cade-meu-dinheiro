import type { Metadata } from "next";
import "./globals.css";

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
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
