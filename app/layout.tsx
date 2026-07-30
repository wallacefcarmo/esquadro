import type { Metadata, Viewport } from 'next';
import './globals.css';

export const viewport: Viewport = {
  themeColor: '#0F2C4C',
  width: 'device-width',
  initialScale: 1,
};

export const metadata: Metadata = {
  title: 'Esquadro — PCP',
  description: 'Gestão de produção da BNG Metalmecânica — PCP, apontamento de chão de fábrica e acompanhamento de OS por item/operação.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body className="bg-ice text-ink min-h-screen">
        {children}
      </body>
    </html>
  );
}
