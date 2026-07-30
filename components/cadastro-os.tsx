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
  const [prazo, setPrazo] = useState('');
  const [osSelecionada, setOsSelecionada] = useState('');
  const [codigo, setCodigo] = useState('');
  const [quantidade, setQuantidade] = useState('1');
  const [material, setMaterial] = useState('');
  const [operacoes, setOperacoes] = useState([{ nome: '', setorId: '' }]);

  function adicionarOs(e: React.FormEvent) {
    e.preventDefault();
    setErro('');
    start(async () => {
      const res = await criarOrdemServico({ numero, desenho, prazo });
      if (res.error) setErro(res.error);
      else { setNumero(''); setDesenho(''); setPrazo(''); router.refresh(); }
    });
  }

  function adicionarItem(e: React.FormEvent) {
    e.preventDefault();
    setErro('');
    const validas = operacoes.filter(o => o.nome.trim());
    if (!osSelecionada || validas.length === 0) { setErro('Selecione a OS e ao menos uma operação.'); return; }
    start(async () => {
      const res = await criarItem({
        os_id: osSelecionada, codigo, quantidade: Number(quantidade) || 1, material,
        operacoes: validas.map(o => o.nome.trim()), setor_ids: validas.map(o => o.setorId || null),
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
    <div className="stack">
      <form onSubmit={adicionarOs} className="card pad" style={{ display: 'flex', flexWrap: 'wrap', gap: 10, alignItems: 'end' }}>
        <div>
          <label className="lab">Número da OS</label>
          <input className="field" style={{ width: 130 }} value={numero} onChange={e => setNumero(e.target.value)} placeholder="018/26" required />
        </div>
        <div>
          <label className="lab">Desenho</label>
          <input className="field" style={{ width: 160 }} value={desenho} onChange={e => setDesenho(e.target.value)} placeholder="C133-WL101" />
        </div>
        <div>
          <label className="lab">Prazo</label>
          <input type="date" className="field" value={prazo} onChange={e => setPrazo(e.target.value)} />
        </div>
        <button className="btn pri" disabled={pending}>Nova OS</button>
      </form>

      <form onSubmit={adicionarItem} className="card pad stack">
        <h3 className="h3" style={{ fontSize: 12, textTransform: 'uppercase', letterSpacing: '.4px' }}>Adicionar item a uma OS</h3>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, alignItems: 'end' }}>
          <div>
            <label className="lab">OS</label>
            <select className="field" value={osSelecionada} onChange={e => setOsSelecionada(e.target.value)} required>
              <option value="">selecione</option>
              {ordens.map(os => <option key={os.id} value={os.id}>{os.numero}</option>)}
            </select>
          </div>
          <div>
            <label className="lab">Código</label>
            <input className="field" style={{ width: 90 }} value={codigo} onChange={e => setCodigo(e.target.value)} placeholder="1.1" required />
          </div>
          <div>
            <label className="lab">Qtd</label>
            <input className="field" style={{ width: 70 }} value={quantidade} onChange={e => setQuantidade(e.target.value)} inputMode="decimal" />
          </div>
          <div>
            <label className="lab">Material</label>
            <input className="field" style={{ width: 130 }} value={material} onChange={e => setMaterial(e.target.value)} placeholder="chapa #19" />
          </div>
        </div>

        <div className="stack" style={{ gap: 8 }}>
          <label className="lab">Sequência de operações</label>
          {operacoes.map((op, i) => (
            <div key={i} style={{ display: 'flex', gap: 8 }}>
              <input
                className="field" style={{ flex: 1 }}
                value={op.nome}
                onChange={e => setOperacoes(ops => ops.map((o, j) => j === i ? { ...o, nome: e.target.value } : o))}
                placeholder="Corte, Chanfro, Solda, Montagem…"
              />
              <select
                className="field" style={{ width: 140 }}
                value={op.setorId}
                onChange={e => setOperacoes(ops => ops.map((o, j) => j === i ? { ...o, setorId: e.target.value } : o))}
              >
                <option value="">setor</option>
                {setores.map(s => <option key={s.id} value={s.id}>{s.nome}</option>)}
              </select>
              {operacoes.length > 1 && (
                <button type="button" onClick={() => setOperacoes(ops => ops.filter((_, j) => j !== i))}
                  style={{ color: 'var(--red)', fontSize: 15, padding: '0 6px', background: 'none', border: 0, cursor: 'pointer' }}>×</button>
              )}
            </div>
          ))}
          <button type="button" onClick={() => setOperacoes(ops => [...ops, { nome: '', setorId: '' }])}
            className="btn" style={{ alignSelf: 'flex-start', padding: '6px 12px', fontSize: 11.5 }}>+ operação</button>
        </div>

        {erro && <p style={{ fontSize: 12, color: 'var(--red)' }}>{erro}</p>}
        <button className="btn pri" style={{ alignSelf: 'flex-start' }} disabled={pending}>Adicionar item</button>
      </form>

      <div className="card">
        {ordens.map(os => (
          <div key={os.id} className="res" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--ink)' }}>{os.numero} <span className="sub" style={{ fontWeight: 400 }}>{os.desenho}</span></div>
              <div className="sub">{(os.itens ?? []).length} item(ns)</div>
            </div>
            <button disabled={pending} onClick={() => remover(() => excluirOrdemServico(os.id))} className="btn" style={{ padding: '6px 10px', fontSize: 11.5, color: 'var(--red)' }}>
              Excluir
            </button>
          </div>
        ))}
        {ordens.length === 0 && <p className="sub" style={{ padding: 16 }}>Nenhuma OS cadastrada.</p>}
      </div>
    </div>
  );
}
