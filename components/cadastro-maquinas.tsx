'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { criarMaquina, atualizarStatusMaquina, excluirMaquina } from '@/app/actions/cadastros';
import type { Maquina, Setor } from '@/lib/types';

const TAG: Record<string, { label: string; cls: string }> = {
  livre: { label: 'LIVRE', cls: 't-idle' },
  em_operacao: { label: 'EM OPERAÇÃO', cls: 't-warn' },
  manutencao: { label: 'MANUTENÇÃO', cls: 't-bad' },
};

interface Props {
  maquinas: (Maquina & { setores?: { nome: string } | null })[];
  setores: Setor[];
}

export function CadastroMaquinas({ maquinas, setores }: Props) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [erro, setErro] = useState('');
  const [nome, setNome] = useState('');
  const [setorId, setSetorId] = useState('');

  function adicionar(e: React.FormEvent) {
    e.preventDefault();
    setErro('');
    start(async () => {
      const res = await criarMaquina({ nome, setor_id: setorId || null });
      if (res.error) setErro(res.error);
      else { setNome(''); router.refresh(); }
    });
  }

  function alternarManutencao(m: Maquina) {
    start(async () => {
      const novo = m.status === 'manutencao' ? 'livre' : 'manutencao';
      const res = await atualizarStatusMaquina(m.id, novo, novo === 'manutencao' ? 'Manutenção preventiva' : undefined);
      if (res.error) setErro(res.error);
      else router.refresh();
    });
  }

  function remover(id: string) {
    start(async () => {
      const res = await excluirMaquina(id);
      if (res.error) setErro(res.error);
      else router.refresh();
    });
  }

  return (
    <div className="stack">
      <form onSubmit={adicionar} className="card pad" style={{ display: 'flex', flexWrap: 'wrap', gap: 10, alignItems: 'end' }}>
        <div style={{ flex: 1, minWidth: 160 }}>
          <label className="lab">Nome da máquina</label>
          <input className="field" value={nome} onChange={e => setNome(e.target.value)} required />
        </div>
        <div>
          <label className="lab">Setor</label>
          <select className="field" value={setorId} onChange={e => setSetorId(e.target.value)}>
            <option value="">—</option>
            {setores.map(s => <option key={s.id} value={s.id}>{s.nome}</option>)}
          </select>
        </div>
        <button className="btn pri" disabled={pending}>Adicionar</button>
      </form>
      {erro && <p style={{ fontSize: 12, color: 'var(--red)' }}>{erro}</p>}

      <div className="card">
        {maquinas.map(m => {
          const t = TAG[m.status];
          return (
            <div key={m.id} className="res" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--ink)' }}>{m.nome}</div>
                <div className="sub">{m.setores?.nome ?? 'sem setor'}</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span className={`tag ${t.cls}`}>{t.label}</span>
                <button disabled={pending} onClick={() => alternarManutencao(m)} className="btn" style={{ padding: '6px 10px', fontSize: 11.5 }}>
                  {m.status === 'manutencao' ? 'Liberar' : 'Manutenção'}
                </button>
                <button disabled={pending} onClick={() => remover(m.id)} className="btn" style={{ padding: '6px 10px', fontSize: 11.5, color: 'var(--red)' }}>
                  Excluir
                </button>
              </div>
            </div>
          );
        })}
        {maquinas.length === 0 && <p className="sub" style={{ padding: 16 }}>Nenhuma máquina cadastrada.</p>}
      </div>
    </div>
  );
}
