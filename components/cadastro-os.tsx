'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { criarOrdemServico, excluirOrdemServico, criarItem } from '@/app/actions/cadastros';
import type { OrdemServico, Setor } from '@/lib/types';

interface Props {
  ordens: (OrdemServico & { itens?: { id: string; codigo: string }[] })[];
  setores: Setor[];
}

export function CadastroOs({ ordens, setores }: Props) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [erro, setErro] = useState('');
  const [numero, setNumero] = useState('');
  const [desenho, setDesenho] = useState('');
  const [osSelecionada, setOsSelecionada] = useState('');
  const [codigo, setCodigo] = useState('');
  const [quantidade, setQuantidade] = useState('1');
  const [material, setMaterial] = useState('');
  const [operacoes, setOperacoes] = useState([{ nome: '', setorId: '' }]);

  function adicionarOs(e: React.FormEvent) {
    e.preventDefault();
    setErro('');
    start(async () => {
      const res = await criarOrdemServico({ numero, desenho });
      if (res.error) setErro(res.error);
      else { setNumero(''); setDesenho(''); router.refresh(); }
    });
  }

  function adicionarItem(e: React.FormEvent) {
    e.preventDefault();
    setErro('');
    const validas = operacoes.filter(o => o.nome.trim());
    if (!osSelecionada || validas.length === 0) { setErro('Selecione a OS e ao menos uma operação.'); return; }
    start(async () => {
      const res = await criarItem({
        os_id: osSelecionada,
        codigo,
        quantidade: Number(quantidade) || 1,
        material,
        operacoes: validas.map(o => o.nome.trim()),
        setor_ids: validas.map(o => o.setorId || null),
      });
      if (res.error) setErro(res.error);
      else {
        setCodigo(''); setQuantidade('1'); setMaterial(''); setOperacoes([{ nome: '', setorId: '' }]);
        router.refresh();
      }
    });
  }

  function remover(fn: () => Promise<{ error?: string }>) {
    start(async () => {
      const res = await fn();
      if (res.error) setErro(res.error);
      else router.refresh();
    });
  }

  return (
    <div className="flex flex-col gap-4">
      <form onSubmit={adicionarOs} className="bg-white border border-line rounded-2xl p-4 flex flex-wrap gap-2 items-end">
        <div>
          <label className="text-[11px] text-muted uppercase">Número da OS</label>
          <input value={numero} onChange={e => setNumero(e.target.value)} placeholder="018/26" required
            className="bg-ice border border-line rounded-lg px-3 py-2 text-sm mt-1 w-32" />
        </div>
        <div>
          <label className="text-[11px] text-muted uppercase">Desenho</label>
          <input value={desenho} onChange={e => setDesenho(e.target.value)} placeholder="C133-WL101"
            className="bg-ice border border-line rounded-lg px-3 py-2 text-sm mt-1 w-40" />
        </div>
        <button disabled={pending} className="py-2 px-4 bg-navy text-white rounded-lg text-sm font-semibold disabled:opacity-40">
          Nova OS
        </button>
      </form>

      <form onSubmit={adicionarItem} className="bg-white border border-line rounded-2xl p-4 flex flex-col gap-3">
        <h3 className="text-xs font-semibold text-navy uppercase">Adicionar item a uma OS</h3>
        <div className="flex flex-wrap gap-2 items-end">
          <div>
            <label className="text-[11px] text-muted uppercase">OS</label>
            <select value={osSelecionada} onChange={e => setOsSelecionada(e.target.value)} required
              className="bg-ice border border-line rounded-lg px-3 py-2 text-sm mt-1">
              <option value="">selecione</option>
              {ordens.map(os => <option key={os.id} value={os.id}>{os.numero}</option>)}
            </select>
          </div>
          <div>
            <label className="text-[11px] text-muted uppercase">Código</label>
            <input value={codigo} onChange={e => setCodigo(e.target.value)} placeholder="1.1" required
              className="bg-ice border border-line rounded-lg px-3 py-2 text-sm mt-1 w-24" />
          </div>
          <div>
            <label className="text-[11px] text-muted uppercase">Qtd</label>
            <input value={quantidade} onChange={e => setQuantidade(e.target.value)} inputMode="decimal"
              className="bg-ice border border-line rounded-lg px-3 py-2 text-sm mt-1 w-20" />
          </div>
          <div>
            <label className="text-[11px] text-muted uppercase">Material</label>
            <input value={material} onChange={e => setMaterial(e.target.value)} placeholder="chapa #19"
              className="bg-ice border border-line rounded-lg px-3 py-2 text-sm mt-1 w-32" />
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-[11px] text-muted uppercase">Sequência de operações</label>
          {operacoes.map((op, i) => (
            <div key={i} className="flex gap-2">
              <input
                value={op.nome}
                onChange={e => setOperacoes(ops => ops.map((o, j) => j === i ? { ...o, nome: e.target.value } : o))}
                placeholder="Corte, Chanfro, Solda, Montagem…"
                className="flex-1 bg-ice border border-line rounded-lg px-3 py-2 text-sm"
              />
              <select
                value={op.setorId}
                onChange={e => setOperacoes(ops => ops.map((o, j) => j === i ? { ...o, setorId: e.target.value } : o))}
                className="bg-ice border border-line rounded-lg px-3 py-2 text-sm"
              >
                <option value="">setor</option>
                {setores.map(s => <option key={s.id} value={s.id}>{s.nome}</option>)}
              </select>
              {operacoes.length > 1 && (
                <button type="button" onClick={() => setOperacoes(ops => ops.filter((_, j) => j !== i))}
                  className="text-vermelho text-sm px-2">×</button>
              )}
            </div>
          ))}
          <button type="button" onClick={() => setOperacoes(ops => [...ops, { nome: '', setorId: '' }])}
            className="self-start text-xs text-steel font-medium">+ operação</button>
        </div>

        {erro && <p className="text-xs text-vermelho">{erro}</p>}
        <button disabled={pending} className="self-start py-2 px-4 bg-amber text-navy rounded-lg text-sm font-semibold disabled:opacity-40">
          Adicionar item
        </button>
      </form>

      <div className="bg-white border border-line rounded-2xl divide-y divide-line">
        {ordens.map(os => (
          <div key={os.id} className="px-4 py-3 flex items-center justify-between gap-3">
            <div>
              <div className="text-sm font-medium text-ink">{os.numero} <span className="text-muted font-normal">{os.desenho}</span></div>
              <div className="text-xs text-muted">{(os.itens ?? []).length} item(ns)</div>
            </div>
            <button disabled={pending} onClick={() => remover(() => excluirOrdemServico(os.id))} className="text-xs text-vermelho font-medium">
              Excluir
            </button>
          </div>
        ))}
        {ordens.length === 0 && <p className="px-4 py-4 text-sm text-muted">Nenhuma OS cadastrada.</p>}
      </div>
    </div>
  );
}
