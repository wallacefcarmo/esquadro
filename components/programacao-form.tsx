'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { criarProgramacao, publicarProgramacao } from '@/app/actions/cadastros';

interface ProgramacaoFormProps {
  setorId: string;
  semana: string;
  ordensServico: { id: string; numero: string }[];
}

const DIAS = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex'];

export function ProgramacaoForm({ setorId, semana, ordensServico }: ProgramacaoFormProps) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [erro, setErro] = useState('');
  const [responsavel, setResponsavel] = useState('');
  const [dia, setDia] = useState('1');
  const [osId, setOsId] = useState('');
  const [descricao, setDescricao] = useState('');
  const [tipo, setTipo] = useState<'producao' | 'manutencao'>('producao');

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setErro('');
    start(async () => {
      const res = await criarProgramacao({
        setor_id: setorId,
        semana,
        responsavel_nome: responsavel,
        dia_semana: Number(dia),
        os_id: osId || undefined,
        descricao,
        tipo,
      });
      if (res.error) setErro(res.error);
      else {
        setResponsavel(''); setDescricao(''); setOsId('');
        router.refresh();
      }
    });
  }

  function publicar() {
    start(async () => {
      const res = await publicarProgramacao(setorId, semana);
      if (res.error) setErro(res.error);
      else router.refresh();
    });
  }

  return (
    <div className="bg-white border border-line rounded-2xl p-4 flex flex-col gap-3">
      <form onSubmit={submit} className="grid grid-cols-2 sm:grid-cols-6 gap-2 items-end">
        <div className="col-span-2">
          <label className="text-[11px] text-muted uppercase">Responsável</label>
          <input value={responsavel} onChange={e => setResponsavel(e.target.value)} required
            className="w-full bg-ice border border-line rounded-lg px-3 py-2 text-sm mt-1" />
        </div>
        <div>
          <label className="text-[11px] text-muted uppercase">Dia</label>
          <select value={dia} onChange={e => setDia(e.target.value)} className="w-full bg-ice border border-line rounded-lg px-3 py-2 text-sm mt-1">
            {DIAS.map((d, i) => <option key={i} value={i + 1}>{d}</option>)}
          </select>
        </div>
        <div>
          <label className="text-[11px] text-muted uppercase">OS</label>
          <select value={osId} onChange={e => setOsId(e.target.value)} className="w-full bg-ice border border-line rounded-lg px-3 py-2 text-sm mt-1">
            <option value="">—</option>
            {ordensServico.map(os => <option key={os.id} value={os.id}>{os.numero}</option>)}
          </select>
        </div>
        <div className="col-span-2">
          <label className="text-[11px] text-muted uppercase">Descrição</label>
          <input value={descricao} onChange={e => setDescricao(e.target.value)}
            className="w-full bg-ice border border-line rounded-lg px-3 py-2 text-sm mt-1" />
        </div>
        <div>
          <label className="text-[11px] text-muted uppercase">Tipo</label>
          <select value={tipo} onChange={e => setTipo(e.target.value as any)} className="w-full bg-ice border border-line rounded-lg px-3 py-2 text-sm mt-1">
            <option value="producao">Produção</option>
            <option value="manutencao">Manutenção</option>
          </select>
        </div>
        <button disabled={pending} className="py-2 bg-navy text-white rounded-lg text-sm font-semibold disabled:opacity-40">
          Adicionar
        </button>
      </form>
      {erro && <p className="text-xs text-vermelho">{erro}</p>}
      <button onClick={publicar} disabled={pending} className="self-start px-4 py-2 bg-amber text-navy rounded-lg text-sm font-semibold disabled:opacity-40">
        Publicar programação
      </button>
    </div>
  );
}
