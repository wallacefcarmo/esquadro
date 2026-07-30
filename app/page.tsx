import Link from 'next/link';
import { LogoMark } from '@/components/logo-mark';
import { NavMenu } from '@/components/nav-menu';

export default function Home() {
  return (
    <main className="min-h-screen bg-ice flex flex-col">
      <div className="flex items-center px-4 pt-4">
        <NavMenu />
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-6 py-8">
        <div className="flex items-center gap-5 mb-4">
          <LogoMark size={64} />
          <div>
            <h1 className="font-bold text-4xl tracking-wide text-navy leading-none">
              ESQU<span className="text-amber">A</span>DRO
            </h1>
            <p className="text-muted text-xs tracking-[3px] uppercase mt-1.5">
              PCP · BNG Metalmecânica
            </p>
          </div>
        </div>

        <p className="text-muted text-sm text-center max-w-xs mt-6 mb-12 leading-relaxed">
          Preparação, Soldagem, Montagem e Usinagem — apontamento de chão de
          fábrica e acompanhamento de OS por item e operação, em tempo real.
        </p>

        <div className="flex flex-col gap-3 w-full max-w-xs">
          <Link
            href="/painel"
            className="block text-center py-4 px-6 bg-amber text-navy rounded-xl font-semibold text-base tracking-wide hover:opacity-90 transition-opacity"
          >
            Painel
          </Link>
          <Link
            href="/apontamento"
            className="block text-center py-4 px-6 bg-white text-navy border border-line rounded-xl font-semibold text-base tracking-wide hover:border-steel transition-colors"
          >
            Apontamento (líder)
          </Link>
        </div>
      </div>
    </main>
  );
}
