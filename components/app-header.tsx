import type { ReactNode } from 'react';
import Link from 'next/link';
import { LogoMark } from './logo-mark';
import { NavMenu } from './nav-menu';

interface AppHeaderProps {
  title?: string;
  actions?: ReactNode;
  className?: string;
}

/** Header padrão de todas as páginas internas — logo leva pra tela inicial ("/"). */
export function AppHeader({ title, actions, className = '' }: AppHeaderProps) {
  return (
    <header
      className={`border-b border-line px-4 sm:px-6 py-3.5 sm:py-4 flex flex-wrap items-center justify-between gap-3 bg-white ${className}`}
    >
      <div className="flex items-center gap-2.5 sm:gap-3 no-print min-w-0">
        <Link
          href="/"
          aria-label="Voltar para tela inicial"
          className="flex items-center gap-2 rounded-lg -ml-1 p-1 hover:bg-ice transition-colors flex-shrink-0"
        >
          <LogoMark size={26} />
          <span className="font-bold text-base sm:text-lg tracking-wide text-navy hidden sm:inline">
            ESQUADRO
          </span>
        </Link>
        <span className="w-px h-5 bg-line flex-shrink-0" />
        <NavMenu />
        {title && (
          <span className="text-xs sm:text-sm text-muted tracking-widest uppercase truncate">
            {title}
          </span>
        )}
      </div>

      {actions && (
        <div className="flex items-center gap-2 sm:gap-3 no-print flex-wrap">
          {actions}
        </div>
      )}
    </header>
  );
}
