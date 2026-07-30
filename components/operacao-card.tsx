'use client';

import { useState, useTransition } from 'react';
import { iniciarOperacao, encerrarOperacao, pararOperacao, retomarOperacao } from '@/app/actions/apontamentos';
import { MOTIVOS_PARADA } from '@/lib/types';

interface OperacaoCardProps {
  id: string;
  nome: string;
  status: string;
  osNumero: string;
  itemCodigo: string;
  material: string | null;
  unidadeExtra: string | null;
  iniciadoEm: string | null;
}

const TAG: Record<string, { label: string; cls: string }> = {
  aguardando:  { label: 'NÃO INICIADO', cls: 't-idle' },
  em_execucao: { label: 'EM EXECUÇÃO', cls: 't-warn' },
  parado:      { label: 'PARADO', cls: 't-bad' },
  concluido:   { label: 'ENCERRADO', cls: 't-ok' },
};

export function OperacaoCard(props: OperacaoCardProps) {
  const [status, setStatus] = useState(props.status);
  const [qtd, setQtd]       = useState('');
  const [medida, setMedida] = useState('');
  const [pending, start]    = useTransition();
  const [erro, setErro]     = useState('');

  function run(action: () => Promise<{ error?: string; success?: boolean }>, next?: string) {
    setErro('');
    start(async () => {
      const res = await action();
      if (res.error) setErro(res.error);
      else if (next) setStatus(next);
    });
  }

  const tag = TAG[status];
  const cls = status === 'em_execucao' ? 'job act' : status === 'concluido' ? 'job fin' : 'job';

  return (
    <div className={cls}>
      <div className="r1">
        <div>
          <div className="nm">{props.nome}</div>
          <div className="os">
            OS {props.osNumero} · item {props.itemCodigo}
            {props.material ? ` · ${props.material}` : ''}
          </div>
        </div>
        <span className={`tag ${tag.cls}`}>{tag.label}</span>
      </div>

      {props.iniciadoEm && status === 'em_execucao' && (
        <div className="tm">início {new Date(props.iniciadoEm).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</div>
      )}

      {erro && <p style={{ fontSize: 11.5, color: 'var(--red)', marginTop: 8 }}>{erro}</p>}

      {status === 'aguardando' && (
        <div className="acts">
          <button className="go" disabled={pending} onClick={() => run(() => iniciarOperacao(props.id), 'em_execucao')}>Iniciar</button>
          <button className="halt" disabled={pending} onClick={() => run(() => pararOperacao(props.id, 'Aguard. material'), 'parado')}>Parada</button>
        </div>
      )}

      {status === 'em_execucao' && (
        <>
          <div className="fields">
            <div><label>QTD CONCLUÍDA</label><input value={qtd} onChange={e => setQtd(e.target.value)} placeholder="0" inputMode="decimal" /></div>
            <div><label>{props.unidadeExtra ?? 'MEDIDA'}</label><input value={medida} onChange={e => setMedida(e.target.value)} placeholder="0" inputMode="decimal" /></div>
          </div>
          <div className="acts">
            <button className="stop" disabled={pending}
              onClick={() => run(() => encerrarOperacao(props.id, qtd ? Number(qtd) : undefined, medida ? Number(medida) : undefined), 'concluido')}>
              Encerrar
            </button>
            <button className="halt" disabled={pending} onClick={() => run(() => pararOperacao(props.id, 'Aguard. material'), 'parado')}>Parada</button>
          </div>
        </>
      )}

      {status === 'parado' && (
        <>
          <div className="motivos">
            {MOTIVOS_PARADA.map(m => (
              <button key={m} disabled={pending} onClick={() => run(() => pararOperacao(props.id, m))}>{m}</button>
            ))}
          </div>
          <div className="acts" style={{ marginTop: 11 }}>
            <button className="go" disabled={pending} onClick={() => run(() => retomarOperacao(props.id), 'em_execucao')}>Retomar</button>
          </div>
        </>
      )}

      {status === 'concluido' && (
        <div className="acts">
          <button className="halt" disabled={pending} onClick={() => run(() => iniciarOperacao(props.id), 'em_execucao')}>Reabrir apontamento</button>
        </div>
      )}
    </div>
  );
}
