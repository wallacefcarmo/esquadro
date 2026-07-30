'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { criarUsuario, toggleAtivoPerfil } from '@/app/actions/usuarios';
import type { Perfil, Setor, UserRole } from '@/lib/types';

interface Props {
  perfis: (Perfil & { setores?: { nome: string } | null })[];
  setores: Setor[];
}

export function CadastroUsuarios({ perfis, setores }: Props) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [erro, setErro] = useState('');
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [role, setRole] = useState<UserRole>('lider');
  const [setorId, setSetorId] = useState('');

  function adicionar(e: React.FormEvent) {
    e.preventDefault();
    setErro('');
    start(async () => {
      const res = await criarUsuario({ nome, email, senha, role, setor_id: setorId || undefined });
      if (res.error) setErro(res.error);
      else {
        setNome(''); setEmail(''); setSenha(''); setSetorId('');
        router.refresh();
      }
    });
  }

  function alternarAtivo(p: Perfil) {
    start(async () => {
      const res = await toggleAtivoPerfil(p.id, !p.ativo);
      if (res.error) setErro(res.error);
      else router.refresh();
    });
  }

  return (
    <div className="flex flex-col gap-4">
      <form onSubmit={adicionar} className="bg-white border border-line rounded-2xl p-4 flex flex-wrap gap-2 items-end">
        <div>
          <label className="text-[11px] text-muted uppercase">Nome</label>
          <input value={nome} onChange={e => setNome(e.target.value)} required
            className="bg-ice border border-line rounded-lg px-3 py-2 text-sm mt-1 w-40" />
        </div>
        <div>
          <label className="text-[11px] text-muted uppercase">Email</label>
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
            className="bg-ice border border-line rounded-lg px-3 py-2 text-sm mt-1 w-48" />
        </div>
        <div>
          <label className="text-[11px] text-muted uppercase">Senha inicial</label>
          <input type="password" value={senha} onChange={e => setSenha(e.target.value)} required minLength={6}
            className="bg-ice border border-line rounded-lg px-3 py-2 text-sm mt-1 w-32" />
        </div>
        <div>
          <label className="text-[11px] text-muted uppercase">Perfil</label>
          <select value={role} onChange={e => setRole(e.target.value as UserRole)}
            className="bg-ice border border-line rounded-lg px-3 py-2 text-sm mt-1">
            <option value="lider">Líder</option>
            <option value="gestor">Gestor</option>
            <option value="admin">Admin</option>
          </select>
        </div>
        <div>
          <label className="text-[11px] text-muted uppercase">Setor</label>
          <select value={setorId} onChange={e => setSetorId(e.target.value)}
            className="bg-ice border border-line rounded-lg px-3 py-2 text-sm mt-1">
            <option value="">—</option>
            {setores.map(s => <option key={s.id} value={s.id}>{s.nome}</option>)}
          </select>
        </div>
        <button disabled={pending} className="py-2 px-4 bg-navy text-white rounded-lg text-sm font-semibold disabled:opacity-40">
          Criar usuário
        </button>
      </form>
      {erro && <p className="text-xs text-vermelho">{erro}</p>}

      <div className="bg-white border border-line rounded-2xl divide-y divide-line">
        {perfis.map(p => (
          <div key={p.id} className="px-4 py-3 flex items-center justify-between gap-3">
            <div>
              <div className="text-sm font-medium text-ink">{p.nome} <span className="text-muted font-normal text-xs">({p.email})</span></div>
              <div className="text-xs text-muted capitalize">{p.role} · {p.setores?.nome ?? 'sem setor'}</div>
            </div>
            <button disabled={pending} onClick={() => alternarAtivo(p)}
              className={`text-xs font-medium ${p.ativo ? 'text-vermelho' : 'text-verde'}`}>
              {p.ativo ? 'Desativar' : 'Ativar'}
            </button>
          </div>
        ))}
        {perfis.length === 0 && <p className="px-4 py-4 text-sm text-muted">Nenhum usuário cadastrado ainda.</p>}
      </div>
    </div>
  );
}
