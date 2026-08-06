import type { Metadata, Viewport } from 'next';
import { SwRegister } from '@/components/sw-register';
import './globals.css';

export const viewport: Viewport = {
  themeColor: '#0F2C4C',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
};

export const metadata: Metadata = {
  title: 'Esquadro — PCP',
  description: 'Gestão de produção da BNG Metalmecânica — PCP, apontamento de chão de fábrica e acompanhamento de OS por item/operação.',
  manifest: '/manifest.webmanifest',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Esquadro',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>
        {children}
        <SwRegister />
      </body>
    </html>
  );
}
