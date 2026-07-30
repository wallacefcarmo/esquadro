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
      else { setNome(''); setEmail(''); setSenha(''); setSetorId(''); router.refresh(); }
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
    <div className="stack">
      <form onSubmit={adicionar} className="card pad" style={{ display: 'flex', flexWrap: 'wrap', gap: 10, alignItems: 'end' }}>
        <div>
          <label className="lab">Nome</label>
          <input className="field" style={{ width: 160 }} value={nome} onChange={e => setNome(e.target.value)} required />
        </div>
        <div>
          <label className="lab">Email</label>
          <input type="email" className="field" style={{ width: 200 }} value={email} onChange={e => setEmail(e.target.value)} required />
        </div>
        <div>
          <label className="lab">Senha inicial</label>
          <input type="password" className="field" style={{ width: 130 }} value={senha} onChange={e => setSenha(e.target.value)} required minLength={6} />
        </div>
        <div>
          <label className="lab">Perfil</label>
          <select className="field" value={role} onChange={e => setRole(e.target.value as UserRole)}>
            <option value="lider">Líder</option>
            <option value="gestor">Gestor</option>
            <option value="admin">Admin</option>
          </select>
        </div>
        <div>
          <label className="lab">Setor</label>
          <select className="field" value={setorId} onChange={e => setSetorId(e.target.value)}>
            <option value="">—</option>
            {setores.map(s => <option key={s.id} value={s.id}>{s.nome}</option>)}
          </select>
        </div>
        <button className="btn pri" disabled={pending}>Criar usuário</button>
      </form>
      {erro && <p style={{ fontSize: 12, color: 'var(--red)' }}>{erro}</p>}

      <div className="card">
        {perfis.map(p => (
          <div key={p.id} className="res" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--ink)' }}>{p.nome} <span className="sub" style={{ fontWeight: 400 }}>({p.email})</span></div>
              <div className="sub" style={{ textTransform: 'capitalize' }}>{p.role} · {p.setores?.nome ?? 'sem setor'}</div>
            </div>
            <button disabled={pending} onClick={() => alternarAtivo(p)} className="btn"
              style={{ padding: '6px 10px', fontSize: 11.5, color: p.ativo ? 'var(--red)' : 'var(--green)' }}>
              {p.ativo ? 'Desativar' : 'Ativar'}
            </button>
          </div>
        ))}
        {perfis.length === 0 && <p className="sub" style={{ padding: 16 }}>Nenhum usuário cadastrado ainda.</p>}
      </div>
    </div>
  );
}
