import { createClient } from '@/lib/supabase/server';
import { AppHeader } from '@/components/app-header';
import { RealtimeRefresher } from '@/components/realtime-refresher';
import { StatusBadge } from '@/components/status-badge';

export default async function PainelPage() {
  const supabase = await createClient();

  const inicioHoje = new Date();
  inicioHoje.setHours(0, 0, 0, 0);

  const [
    { count: emExecucao },
    { count: concluidosHoje },
    { count: maquinasParadas },
    { count: totalOperacoes },
    { data: setores },
    { data: apontamentos },
  ] = await Promise.all([
    supabase.from('item_operacoes').select('id', { count: 'exact', head: true }).eq('status', 'em_execucao'),
    supabase.from('item_operacoes').select('id', { count: 'exact', head: true }).eq('status', 'concluido').gte('concluido_em', inicioHoje.toISOString()),
    supabase.from('maquinas').select('id', { count: 'exact', head: true }).in('status', ['manutencao']),
    supabase.from('item_operacoes').select('id', { count: 'exact', head: true }),
    supabase.from('setores').select('id, nome, ordem').order('ordem'),
    supabase
      .from('apontamentos')
      .select('id, acao, motivo_parada, quantidade, medida_extra, criado_em, usuario:perfis(nome), item_operacoes(nome, itens(codigo, ordens_servico(numero)))')
      .order('criado_em', { ascending: false })
      .limit(12),
  ]);

  const setoresComProgresso = await Promise.all(
    (setores ?? []).map(async setor => {
      const { count: total } = await supabase
        .from('item_operacoes')
        .select('id', { count: 'exact', head: true })
        .eq('setor_id', setor.id);
      const { count: concluidas } = await supabase
        .from('item_operacoes')
        .select('id', { count: 'exact', head: true })
        .eq('setor_id', setor.id)
        .eq('status', 'concluido');
      const pct = total ? Math.round(((concluidas ?? 0) / total) * 100) : 0;
      return { ...setor, total: total ?? 0, concluidas: concluidas ?? 0, pct };
    })
  );

  return (
    <main className="min-h-screen bg-ice">
      <RealtimeRefresher />
      <AppHeader title="Painel" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 flex flex-col gap-6">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Kpi label="Em execução" value={emExecucao ?? 0} color="text-amarelo" />
          <Kpi label="Concluídos hoje" value={concluidosHoje ?? 0} color="text-verde" />
          <Kpi label="Máquinas em manutenção" value={maquinasParadas ?? 0} color="text-vermelho" />
          <Kpi label="Operações cadastradas" value={totalOperacoes ?? 0} color="text-navy" />
        </div>

        <section className="bg-white border border-line rounded-2xl p-5">
          <h2 className="text-sm font-semibold tracking-wide text-navy uppercase mb-4">
            Progresso por setor
          </h2>
          <div className="flex flex-col gap-3">
            {setoresComProgresso.map(s => (
              <div key={s.id}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="font-medium text-ink">{s.nome}</span>
                  <span className="text-muted">{s.concluidas} de {s.total} operações · {s.pct}%</span>
                </div>
                <div className="h-2 bg-ice rounded-full overflow-hidden">
                  <div className="h-full bg-steel rounded-full" style={{ width: `${Math.max(s.pct, 2)}%` }} />
                </div>
              </div>
            ))}
            {setoresComProgresso.length === 0 && (
              <p className="text-muted text-sm">Nenhum setor cadastrado ainda.</p>
            )}
          </div>
        </section>

        <section className="bg-white border border-line rounded-2xl p-5">
          <h2 className="text-sm font-semibold tracking-wide text-navy uppercase mb-4">
            Últimos apontamentos
          </h2>
          <div className="flex flex-col divide-y divide-line">
            {(apontamentos ?? []).map((a: any) => (
              <div key={a.id} className="py-3 flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm text-ink">
                    <b>{a.usuario?.nome ?? '—'}</b>{' '}
                    <span className="text-muted">
                      {a.item_operacoes?.itens?.ordens_servico?.numero} · {a.item_operacoes?.itens?.codigo} · {a.item_operacoes?.nome}
                    </span>
                  </p>
                  {a.motivo_parada && <p className="text-xs text-vermelho mt-0.5">{a.motivo_parada}</p>}
                </div>
                <span className="text-xs text-muted whitespace-nowrap">
                  {new Date(a.criado_em).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            ))}
            {(apontamentos ?? []).length === 0 && (
              <p className="text-muted text-sm py-2">Nenhum apontamento ainda.</p>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}

function Kpi({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="bg-white border border-line rounded-2xl p-4">
      <div className={`text-2xl font-bold ${color}`}>{value}</div>
      <div className="text-xs text-muted mt-1">{label}</div>
    </div>
  );
}
