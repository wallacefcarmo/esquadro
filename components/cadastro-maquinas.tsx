'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { criarMaquina, atualizarStatusMaquina, excluirMaquina } from '@/app/actions/cadastros';
import { StatusBadge } from './status-badge';
import type { Maquina, Setor } from '@/lib/types';

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
    <div className="flex flex-col gap-4">
      <form onSubmit={adicionar} className="bg-white border border-line rounded-2xl p-4 flex flex-wrap gap-2 items-end">
        <div className="flex-1 min-w-[160px]">
          <label className="text-[11px] text-muted uppercase">Nome da máquina</label>
          <input value={nome} onChange={e => setNome(e.target.value)} required
            className="w-full bg-ice border border-line rounded-lg px-3 py-2 text-sm mt-1" />
        </div>
        <div>
          <label className="text-[11px] text-muted uppercase">Setor</label>
          <select value={setorId} onChange={e => setSetorId(e.target.value)} className="bg-ice border border-line rounded-lg px-3 py-2 text-sm mt-1">
            <option value="">—</option>
            {setores.map(s => <option key={s.id} value={s.id}>{s.nome}</option>)}
          </select>
        </div>
        <button disabled={pending} className="py-2 px-4 bg-navy text-white rounded-lg text-sm font-semibold disabled:opacity-40">
          Adicionar
        </button>
      </form>
      {erro && <p className="text-xs text-vermelho">{erro}</p>}

      <div className="bg-white border border-line rounded-2xl divide-y divide-line">
        {maquinas.map(m => (
          <div key={m.id} className="px-4 py-3 flex items-center justify-between gap-3">
            <div>
              <div className="text-sm font-medium text-ink">{m.nome}</div>
              <div className="text-xs text-muted">{m.setores?.nome ?? 'sem setor'}</div>
            </div>
            <div className="flex items-center gap-2">
              <StatusBadge status={m.status} />
              <button disabled={pending} onClick={() => alternarManutencao(m)} className="text-xs text-steel font-medium">
                {m.status === 'manutencao' ? 'Liberar' : 'Manutenção'}
              </button>
              <button disabled={pending} onClick={() => remover(m.id)} className="text-xs text-vermelho font-medium">
                Excluir
              </button>
            </div>
          </div>
        ))}
        {maquinas.length === 0 && <p className="px-4 py-4 text-sm text-muted">Nenhuma máquina cadastrada.</p>}
      </div>
    </div>
  );
}
