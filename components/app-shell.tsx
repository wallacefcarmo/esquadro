'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import type { UserRole } from '@/lib/types';
import {
  IconPainel, IconProgramacao, IconApontamento, IconOs, IconMaquinas,
  IconCadastros, IconHistorico, IconSair,
} from './icons';

interface NavItem {
  href: string;
  label: string;
  mobileLabel: string;
  subtitle: string;
  Icon: (p: { className?: string }) => React.ReactElement;
  roles: UserRole[];
  group: string;
}

const NAV: NavItem[] = [
  { href: '/painel', label: 'Painel do dia', mobileLabel: 'Painel', subtitle: 'Visão geral da produção, ao vivo', Icon: IconPainel, roles: ['admin', 'gestor', 'lider'], group: 'ACOMPANHAR' },
  { href: '/os', label: 'Ordens de serviço', mobileLabel: 'OS', subtitle: 'OS por item e operação', Icon: IconOs, roles: ['admin', 'gestor', 'lider'], group: 'ACOMPANHAR' },
  { href: '/maquinas', label: 'Máquinas', mobileLabel: 'Máquinas', subtitle: 'Ocupação da semana', Icon: IconMaquinas, roles: ['admin', 'gestor', 'lider'], group: 'ACOMPANHAR' },
  { href: '/programacao', label: 'Programação semanal', mobileLabel: 'Programar', subtitle: 'Grade da semana por setor', Icon: IconProgramacao, roles: ['admin', 'gestor', 'lider'], group: 'PLANEJAR' },
  { href: '/apontamento', label: 'Chão de fábrica', mobileLabel: 'Apontar', subtitle: 'Apontamento do líder', Icon: IconApontamento, roles: ['admin', 'gestor', 'lider'], group: 'EXECUTAR' },
  { href: '/cadastros', label: 'Cadastros', mobileLabel: 'Cadastros', subtitle: 'Máquinas, OS e usuários', Icon: IconCadastros, roles: ['admin', 'gestor'], group: 'ADMINISTRAR' },
  { href: '/historico', label: 'Histórico', mobileLabel: 'Histórico', subtitle: 'Log de alterações', Icon: IconHistorico, roles: ['admin', 'gestor'], group: 'ADMINISTRAR' },
];

const MOBILE_TABS = NAV.filter(n => n.group !== 'ADMINISTRAR');

export function AppShell({ children }: { children: React.ReactNode }) {
  const path = usePathname();
  const { perfil, logout } = useAuth();

  const items = NAV.filter(n => !perfil || n.roles.includes(perfil.role));
  const groups = Array.from(new Set(items.map(i => i.group)));
  const current = NAV.find(n => n.href === path);

  return (
    <div className="lg:flex min-h-screen">
      {/* ---------- desktop sidebar ---------- */}
      <aside className="side">
        <div className="brand">
          <h1>ESQU<span>A</span>DRO</h1>
          <p>Gestão de produção · BNG Metalmecânica</p>
        </div>
        <nav className="side-nav">
          {groups.map(g => (
            <div key={g}>
              <div className="grp">{g}</div>
              {items.filter(i => i.group === g).map(i => (
                <Link key={i.href} href={i.href} className={path === i.href ? 'on' : ''}>
                  <i.Icon className="ic" />
                  {i.label}
                </Link>
              ))}
            </div>
          ))}
        </nav>
        {perfil && (
          <div className="who">
            <div>
              <b>{perfil.nome}</b>
              <span className="capitalize">{perfil.role}</span>
            </div>
            <button onClick={logout}>SAIR</button>
          </div>
        )}
      </aside>

      {/* ---------- mobile top header ---------- */}
      <header className="mtop lg:hidden">
        <div className="row1">
          <div className="brand">ESQU<span>A</span>DRO</div>
          <div className="sync" style={{ fontSize: 10.5, color: '#8FA8BE', display: 'flex', alignItems: 'center', gap: 5 }}>
            <i style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--green)', display: 'inline-block' }} />
            ao vivo
          </div>
        </div>
        <div className="scr-title">{current?.label ?? 'Esquadro'}</div>
        <div className="scr-sub">{current?.subtitle ?? ''}</div>
      </header>

      {/* ---------- content ---------- */}
      <main className="flex-1 min-w-0">{children}</main>

      {/* ---------- mobile bottom tabbar ---------- */}
      <nav className="tabbar lg:hidden">
        {MOBILE_TABS.filter(n => !perfil || n.roles.includes(perfil.role)).map(n => (
          <Link key={n.href} href={n.href} className={path === n.href ? 'on' : ''}>
            <n.Icon />
            <span>{n.mobileLabel}</span>
          </Link>
        ))}
      </nav>
    </div>
  );
}
