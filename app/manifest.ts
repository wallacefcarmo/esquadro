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
      { src: '/icon', sizes: '32x32', type: 'image/png', purpose: 'any' },
      { src: '/apple-icon', sizes: '180x180', type: 'image/png', purpose: 'any' },
    ],
  };
}
