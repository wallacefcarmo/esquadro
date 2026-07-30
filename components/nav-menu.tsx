'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, LogOut } from 'lucide-react';
import { LogoMark } from './logo-mark';
import { useAuth } from '@/hooks/use-auth';
import type { UserRole } from '@/lib/types';

const ALL_LINKS = [
  { href: '/painel',      label: 'Painel',               roles: ['admin', 'gestor', 'lider'] as UserRole[] },
  { href: '/apontamento', label: 'Apontamento',          roles: ['admin', 'gestor', 'lider'] as UserRole[] },
  { href: '/os',          label: 'OS por item/operação', roles: ['admin', 'gestor', 'lider'] as UserRole[] },
  { href: '/maquinas',    label: 'Máquinas',             roles: ['admin', 'gestor', 'lider'] as UserRole[] },
  { href: '/programacao', label: 'Programação semanal',  roles: ['admin', 'gestor', 'lider'] as UserRole[] },
  { href: '/cadastros',   label: 'Cadastros',            roles: ['admin', 'gestor'] as UserRole[] },
  { href: '/historico',   label: 'Histórico',            roles: ['admin', 'gestor'] as UserRole[] },
];

export function NavMenu() {
  const [open, setOpen]    = useState(false);
  const path                = usePathname();
  const { perfil, logout }  = useAuth();

  const links = ALL_LINKS.filter(l => !perfil || l.roles.includes(perfil.role));

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        aria-label="Abrir menu"
        className="flex items-center justify-center w-9 h-9 rounded-lg hover:bg-ice transition-colors text-navy"
      >
        <Menu size={20} />
      </button>

      <div
        onClick={() => setOpen(false)}
        className={`fixed inset-0 z-40 bg-black/40 transition-opacity duration-300 ${
          open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      />

      <div
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-line flex flex-col
          transform transition-transform duration-300 ease-out ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between px-5 py-5 border-b border-line">
          <Link href="/" onClick={() => setOpen(false)} className="flex items-center gap-3">
            <LogoMark size={28} />
            <span className="font-bold text-lg tracking-wide text-navy">ESQUADRO</span>
          </Link>
          <button
            onClick={() => setOpen(false)}
            aria-label="Fechar menu"
            className="text-muted hover:text-ink transition-colors w-7 h-7 flex items-center justify-center"
          >
            <X size={20} />
          </button>
        </div>

        <nav className="flex flex-col px-3 py-4 gap-1 flex-1">
          {links.map(link => {
            const active = path === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className={`px-4 py-3 rounded-xl font-semibold text-sm tracking-wide transition-colors ${
                  active ? 'bg-amber text-navy' : 'text-ink hover:bg-ice hover:text-navy'
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="px-5 py-4 border-t border-line">
          {perfil ? (
            <div className="flex items-center justify-between">
              <div className="min-w-0">
                <p className="text-ink text-xs font-medium truncate">{perfil.nome}</p>
                <p className="text-muted text-[11px] capitalize">{perfil.role}</p>
              </div>
              <button
                onClick={() => { setOpen(false); logout(); }}
                aria-label="Sair"
                title="Sair"
                className="flex items-center gap-1.5 text-[11px] text-muted hover:text-vermelho transition-colors ml-3 flex-shrink-0 font-semibold tracking-wide"
              >
                <LogOut size={14} />
                SAIR
              </button>
            </div>
          ) : (
            <p className="text-muted text-xs tracking-wide">PCP · BNG Metalmecânica</p>
          )}
        </div>
      </div>
    </>
  );
}
