import { createClient } from '@/lib/supabase/server';
import { AppShell } from '@/components/app-shell';
import { RealtimeRefresher } from '@/components/realtime-refresher';

const STATUS_TAG: Record<string, { label: string; cls: string; bar: string }> = {
  nao_iniciado: { label: 'NÃO INICIADO', cls: 't-idle', bar: '#A9B7C4' },
  em_andamento: { label: 'NO PRAZO',     cls: 't-ok',   bar: 'var(--green)' },
  atencao:      { label: 'ATENÇÃO',      cls: 't-warn', bar: 'var(--amber)' },
  concluido:    { label: 'CONCLUÍDO',    cls: 't-ok',   bar: 'var(--green)' },
};

function formatDate(d: string | null) {
  if (!d) return '—';
  return new Date(d + 'T00:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
}

function horasPerdidasPorMotivo(apontamentos: { item_operacao_id: string; acao: string; motivo_parada: string | null; criado_em: string }[]) {
  const porItem = new Map<string, typeof apontamentos>();
  for (const a of apontamentos) {
    if (!porItem.has(a.item_operacao_id)) porItem.set(a.item_operacao_id, []);
    porItem.get(a.item_operacao_id)!.push(a);
  }
  const totais = new Map<string, number>();
  for (const eventos of porItem.values()) {
    eventos.sort((a, b) => +new Date(a.criado_em) - +new Date(b.criado_em));
    for (let i = 0; i < eventos.length; i++) {
      const ev = eventos[i];
      if (ev.acao !== 'parada' || !ev.motivo_parada) continue;
      const fim = eventos[i + 1] ? +new Date(eventos[i + 1].criado_em) : Date.now();
      const horas = (fim - +new Date(ev.criado_em)) / 3_600_000;
      totais.set(ev.motivo_parada, (totais.get(ev.motivo_parada) ?? 0) + horas);
    }
  }
  return Array.from(totais.entries()).sort((a, b) => b[1] - a[1]);
}

export default async function PainelPage() {
  const supabase = await createClient();
  const inicioHoje = new Date();
  inicioHoje.setHours(0, 0, 0, 0);

  const [
    { count: osAbertas },
    { count: osEmAndamento },
    { count: concluidosHoje },
    { count: emExecucao },
    { count: maquinasManutencao },
    { data: ordens },
    { data: apontamentos },
  ] = await Promise.all([
    supabase.from('ordens_servico').select('id', { count: 'exact', head: true }).neq('status', 'concluido'),
    supabase.from('ordens_servico').select('id', { count: 'exact', head: true }).eq('status', 'em_andamento'),
    supabase.from('item_operacoes').select('id', { count: 'exact', head: true }).eq('status', 'concluido').gte('concluido_em', inicioHoje.toISOString()),
    supabase.from('item_operacoes').select('id', { count: 'exact', head: true }).eq('status', 'em_execucao'),
    supabase.from('maquinas').select('id', { count: 'exact', head: true }).eq('status', 'manutencao'),
    supabase.from('ordens_servico').select('id, numero, desenho, descricao, status, prazo').order('numero'),
    supabase.from('apontamentos').select('item_operacao_id, acao, motivo_parada, criado_em').order('criado_em', { ascending: false }).limit(500),
  ]);

  const obras = await Promise.all(
    (ordens ?? []).map(async os => {
      const { count: total } = await supabase.from('item_operacoes').select('id, itens!inner(os_id)', { count: 'exact', head: true }).eq('itens.os_id', os.id);
      const { count: concluidas } = await supabase.from('item_operacoes').select('id, itens!inner(os_id)', { count: 'exact', head: true }).eq('itens.os_id', os.id).eq('status', 'concluido');
      const pct = total ? Math.round(((concluidas ?? 0) / total) * 100) : 0;
      return { ...os, pct };
    })
  );

  const perdas = horasPerdidasPorMotivo((apontamentos ?? []) as any).slice(0, 6);
  const maxPerda = Math.max(...perdas.map(p => p[1]), 1);

  const feed = (
    await supabase
      .from('apontamentos')
      .select('id, acao, motivo_parada, quantidade, medida_extra, criado_em, usuario:perfis(nome), item_operacoes(nome, setores(nome), itens(codigo, ordens_servico(numero)))')
      .order('criado_em', { ascending: false })
      .limit(10)
  ).data as any[] ?? [];

  const AÇÃO_TXT: Record<string, string> = {
    iniciar: 'iniciou',
    encerrar: 'encerrou',
    parada: 'parou',
    retomar: 'retomou',
  };

  return (
    <AppShell>
      <RealtimeRefresher />

      <header className="dtop">
        <div>
          <h2>Painel do dia</h2>
          <p>{new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric' })} · ao vivo</p>
        </div>
      </header>

      <div className="wrap" style={{ padding: '22px 20px 60px' }}>
        <div className="stack">

          <div className="kpis">
            <div className="kpi"><div className="lab">OS EM ABERTO</div><div className="val">{osAbertas ?? 0}</div><div className="note">{osEmAndamento ?? 0} em andamento</div></div>
            <div className="kpi"><div className="lab">OPERAÇÕES CONCLUÍDAS HOJE</div><div className="val">{concluidosHoje ?? 0}</div><div className="note">itens finalizados</div></div>
            <div className="kpi"><div className="lab">EM EXECUÇÃO AGORA</div><div className="val" style={{ color: '#8A5D06' }}>{emExecucao ?? 0}</div><div className="note">operações ativas</div></div>
            <div className="kpi"><div className="lab">MÁQUINAS EM MANUTENÇÃO</div><div className="val" style={{ color: 'var(--red)' }}>{maquinasManutencao ?? 0}</div><div className="note">bloqueadas na programação</div></div>
            <div className="kpi"><div className="lab">OS EM ATENÇÃO</div><div className="val" style={{ color: 'var(--red)' }}>{obras.filter(o => o.status === 'atencao').length}</div><div className="note">prazo ou avanço crítico</div></div>
          </div>

          <div className="card">
            <div className="pad" style={{ borderBottom: '1px solid var(--line)' }}>
              <div className="h3">Andamento das obras</div>
              <div className="sub">Avanço calculado pelas operações concluídas — nunca digitado</div>
            </div>

            {/* desktop: tabela */}
            <div className="desktop-only" style={{ padding: '14px 8px 8px' }}>
              <table>
                <thead><tr><th>OS</th><th>DESCRIÇÃO</th><th>PRAZO</th><th style={{ width: 150 }}>AVANÇO</th><th>STATUS</th></tr></thead>
                <tbody>
                  {obras.map(o => {
                    const st = STATUS_TAG[o.status];
                    return (
                      <tr key={o.id}>
                        <td className="mono">{o.numero}</td>
                        <td>{o.desenho ?? o.descricao ?? '—'}</td>
                        <td>{formatDate(o.prazo)}</td>
                        <td>
                          <div className="bar"><i style={{ width: `${Math.max(o.pct, 2)}%`, background: st.bar }} /></div>
                          <div className="sub" style={{ marginTop: 4 }}>{o.pct}%</div>
                        </td>
                        <td><span className={`tag ${st.cls}`}>{st.label}</span></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              {obras.length === 0 && <p className="sub" style={{ padding: 16 }}>Nenhuma OS cadastrada ainda.</p>}
            </div>

            {/* mobile: cards */}
            <div className="mobile-only">
              {obras.map(o => {
                const st = STATUS_TAG[o.status];
                return (
                  <div key={o.id} className="obra">
                    <div className="r1">
                      <div><b className="mono">{o.numero}</b><div className="ds">{o.desenho ?? o.descricao ?? '—'}</div></div>
                      <span className={`tag ${st.cls}`}>{st.label}</span>
                    </div>
                    <div className="r2"><div className="bar"><i style={{ width: `${Math.max(o.pct, 2)}%`, background: st.bar }} /></div><span className="pc">{o.pct}%</span></div>
                    <div className="r3">prazo {formatDate(o.prazo)}</div>
                  </div>
                );
              })}
              {obras.length === 0 && <p className="sub" style={{ padding: 16 }}>Nenhuma OS cadastrada ainda.</p>}
            </div>
          </div>

          <div className="card pad">
            <div className="h3">Onde a hora se perde</div>
            <div className="sub" style={{ marginBottom: 10 }}>Motivos de parada apontados</div>
            {perdas.map(([motivo, horas]) => (
              <div key={motivo} className="loss">
                <span>{motivo}</span>
                <div className="bar"><i style={{ width: `${Math.max((horas / maxPerda) * 100, 4)}%`, background: 'var(--amber)' }} /></div>
                <span>{horas.toFixed(1)}h</span>
              </div>
            ))}
            {perdas.length === 0 && <p className="sub">Nenhuma parada registrada ainda.</p>}
          </div>

          <div className="card pad">
            <div className="h3">Últimos apontamentos</div>
            <div className="feed" style={{ marginTop: 6 }}>
              {feed.map(a => (
                <div key={a.id}>
                  <time>{new Date(a.criado_em).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</time>
                  <p>
                    <b>{a.usuario?.nome ?? '—'}</b> · {a.item_operacoes?.setores?.nome ?? ''} — OS {a.item_operacoes?.itens?.ordens_servico?.numero ?? '—'}
                    {' '}{a.item_operacoes?.itens?.codigo ? `item ${a.item_operacoes.itens.codigo}` : ''}
                    {a.acao === 'parada'
                      ? <span style={{ color: 'var(--red)' }}> · parada: {a.motivo_parada}</span>
                      : ` — ${AÇÃO_TXT[a.acao] ?? a.acao}${a.quantidade ? ` · ${a.quantidade} un` : ''}`}
                  </p>
                </div>
              ))}
              {feed.length === 0 && <p className="sub">Nenhum apontamento ainda.</p>}
            </div>
          </div>

          <div className="banner">Nenhum número desta tela é digitado. Tudo sai do <b>apontamento do líder</b>.</div>
        </div>
      </div>
    </AppShell>
  );
}
