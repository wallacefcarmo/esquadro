const STYLES: Record<string, { label: string; className: string }> = {
  aguardando:   { label: 'AGUARDANDO',    className: 'bg-ice text-muted' },
  em_execucao:  { label: 'EM EXECUÇÃO',   className: 'bg-amarelo/15 text-amarelo' },
  parado:       { label: 'PARADO',        className: 'bg-vermelho/15 text-vermelho' },
  concluido:    { label: 'CONCLUÍDO',     className: 'bg-verde/15 text-verde' },
  livre:        { label: 'LIVRE',         className: 'bg-verde/15 text-verde' },
  em_operacao:  { label: 'EM OPERAÇÃO',   className: 'bg-amarelo/15 text-amarelo' },
  manutencao:   { label: 'MANUTENÇÃO',    className: 'bg-vermelho/15 text-vermelho' },
  nao_iniciado: { label: 'NÃO INICIADO',  className: 'bg-ice text-muted' },
  em_andamento: { label: 'EM ANDAMENTO',  className: 'bg-amarelo/15 text-amarelo' },
  atencao:      { label: 'ATENÇÃO',       className: 'bg-vermelho/15 text-vermelho' },
};

export function StatusBadge({ status }: { status: string }) {
  const s = STYLES[status] ?? { label: status.toUpperCase(), className: 'bg-ice text-muted' };
  return (
    <span className={`inline-block px-2.5 py-1 rounded-full text-[11px] font-semibold tracking-wide ${s.className}`}>
      {s.label}
    </span>
  );
}
