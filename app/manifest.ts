import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Esquadro — PCP',
    short_name: 'Esquadro',
    description: 'Gestão de produção da BNG Metalmecânica — PCP, apontamento de chão de fábrica e acompanhamento de OS por item/operação.',
    start_url: '/painel',
    display: 'standalone',
    background_color: '#F1F4F7',
    theme_color: '#0F2C4C',
    orientation: 'portrait-primary',
    categories: ['productivity', 'business'],
    icons: [
      { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
      { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
    ],
  };
}
