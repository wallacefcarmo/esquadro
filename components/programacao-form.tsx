'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { criarProgramacao, publicarProgramacao } from '@/app/actions/cadastros';

interface ProgramacaoFormProps {
  setorId: string;
  semana: string;
  ordensServico: { id: string; numero: string }[];
  publicada: boolean;
}

const DIAS = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex'];

export function ProgramacaoForm({ setorId, semana, ordensServico, publicada }: ProgramacaoFormProps) {
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
        setor_id: setorId, semana, responsavel_nome: responsavel,
        dia_semana: Number(dia), os_id: osId || undefined, descricao, tipo,
      });
      if (res.error) setErro(res.error);
      else { setResponsavel(''); setDescricao(''); setOsId(''); router.refresh(); }
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
    <div className="card pad stack">
      <form onSubmit={submit} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(120px,1fr))', gap: 10, alignItems: 'end' }}>
        <div>
          <label className="lab">Responsável</label>
          <input className="field" value={responsavel} onChange={e => setResponsavel(e.target.value)} required />
        </div>
        <div>
          <label className="lab">Dia</label>
          <select className="field" value={dia} onChange={e => setDia(e.target.value)}>
            {DIAS.map((d, i) => <option key={i} value={i + 1}>{d}</option>)}
          </select>
        </div>
        <div>
          <label className="lab">OS</label>
          <select className="field" value={osId} onChange={e => setOsId(e.target.value)}>
            <option value="">—</option>
            {ordensServico.map(os => <option key={os.id} value={os.id}>{os.numero}</option>)}
          </select>
        </div>
        <div>
          <label className="lab">Descrição</label>
          <input className="field" value={descricao} onChange={e => setDescricao(e.target.value)} />
        </div>
        <div>
          <label className="lab">Tipo</label>
          <select className="field" value={tipo} onChange={e => setTipo(e.target.value as any)}>
            <option value="producao">Produção</option>
            <option value="manutencao">Manutenção</option>
          </select>
        </div>
        <button className="btn pri" disabled={pending}>Adicionar</button>
      </form>
      {erro && <p style={{ fontSize: 12, color: 'var(--red)' }}>{erro}</p>}
      <button onClick={publicar} disabled={pending || publicada} className={`btn ${publicada ? 'done' : 'pri'}`} style={{ alignSelf: 'flex-start' }}>
        {publicada ? '✓ Publicada' : 'Publicar programação da semana'}
      </button>
    </div>
  );
}
