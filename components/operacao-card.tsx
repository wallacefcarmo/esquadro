'use client';

import { useState, useTransition } from 'react';
import { iniciarOperacao, encerrarOperacao, pararOperacao, retomarOperacao } from '@/app/actions/apontamentos';
import { StatusBadge } from './status-badge';
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

export function OperacaoCard(props: OperacaoCardProps) {
  const [status, setStatus]   = useState(props.status);
  const [qtd, setQtd]         = useState('');
  const [medida, setMedida]   = useState('');
  const [pending, start]      = useTransition();
  const [erro, setErro]       = useState('');

  function run(action: () => Promise<{ error?: string; success?: boolean }>, next?: string) {
    setErro('');
    start(async () => {
      const res = await action();
      if (res.error) setErro(res.error);
      else if (next) setStatus(next);
    });
  }

  return (
    <div className="bg-white border border-line rounded-2xl p-4 flex flex-col gap-3">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="font-semibold text-ink text-sm">{props.nome}</div>
          <div className="text-xs text-muted mt-0.5">
            OS {props.osNumero} · item {props.itemCodigo}
            {props.material ? ` · ${props.material}` : ''}
          </div>
          {props.iniciadoEm && status === 'em_execucao' && (
            <div className="text-[11px] text-muted mt-1">
              início {new Date(props.iniciadoEm).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
            </div>
          )}
        </div>
        <StatusBadge status={status} />
      </div>

      {erro && <p className="text-xs text-vermelho">{erro}</p>}

      {status === 'aguardando' && (
        <div className="flex gap-2">
          <button
            disabled={pending}
            onClick={() => run(() => iniciarOperacao(props.id), 'em_execucao')}
            className="flex-1 py-2.5 bg-navy text-white rounded-lg text-sm font-semibold disabled:opacity-40"
          >
            Iniciar
          </button>
          <button
            disabled={pending}
            onClick={() => run(() => pararOperacao(props.id, 'Aguard. material'), 'parado')}
            className="py-2.5 px-4 bg-ice text-ink rounded-lg text-sm font-semibold disabled:opacity-40"
          >
            Parada
          </button>
        </div>
      )}

      {status === 'em_execucao' && (
        <>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[11px] text-muted uppercase tracking-wide">Qtd concluída</label>
              <input
                value={qtd}
                onChange={e => setQtd(e.target.value)}
                placeholder="0"
                inputMode="decimal"
                className="w-full bg-ice border border-line rounded-lg px-3 py-2 text-sm mt-1"
              />
            </div>
            <div>
              <label className="text-[11px] text-muted uppercase tracking-wide">
                {props.unidadeExtra ?? 'Medida'}
              </label>
              <input
                value={medida}
                onChange={e => setMedida(e.target.value)}
                placeholder="0"
                inputMode="decimal"
                className="w-full bg-ice border border-line rounded-lg px-3 py-2 text-sm mt-1"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <button
              disabled={pending}
              onClick={() => run(
                () => encerrarOperacao(props.id, qtd ? Number(qtd) : undefined, medida ? Number(medida) : undefined),
                'concluido'
              )}
              className="flex-1 py-2.5 bg-verde text-white rounded-lg text-sm font-semibold disabled:opacity-40"
            >
              Encerrar
            </button>
            <button
              disabled={pending}
              onClick={() => run(() => pararOperacao(props.id, 'Aguard. material'), 'parado')}
              className="py-2.5 px-4 bg-ice text-ink rounded-lg text-sm font-semibold disabled:opacity-40"
            >
              Parada
            </button>
          </div>
        </>
      )}

      {status === 'parado' && (
        <>
          <div className="flex flex-wrap gap-1.5">
            {MOTIVOS_PARADA.map(m => (
              <button
                key={m}
                disabled={pending}
                onClick={() => run(() => pararOperacao(props.id, m))}
                className="px-2.5 py-1.5 rounded-full text-[11px] font-medium bg-ice text-ink hover:bg-vermelho/10 disabled:opacity-40"
              >
                {m}
              </button>
            ))}
          </div>
          <button
            disabled={pending}
            onClick={() => run(() => retomarOperacao(props.id), 'em_execucao')}
            className="py-2.5 bg-navy text-white rounded-lg text-sm font-semibold disabled:opacity-40"
          >
            Retomar
          </button>
        </>
      )}

      {status === 'concluido' && (
        <button
          disabled={pending}
          onClick={() => run(() => iniciarOperacao(props.id), 'em_execucao')}
          className="py-2.5 bg-ice text-ink rounded-lg text-sm font-semibold disabled:opacity-40"
        >
          Reabrir
        </button>
      )}
    </div>
  );
}
