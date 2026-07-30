import { createClient } from '@/lib/supabase/server';
import { AppShell } from '@/components/app-shell';

const OP_ICON: Record<string, string> = { concluido: ' ✓', em_execucao: '', aguardando: '', parado: '' };
const OP_CLS: Record<string, string> = { concluido: 'ok', em_execucao: 'run', aguardando: 'wait', parado: 'blk' };
const STATUS_TAG: Record<string, { label: string; cls: string }> = {
  nao_iniciado: { label: 'NÃO INICIADO', cls: 't-idle' },
  em_andamento: { label: 'EM EXECUÇÃO', cls: 't-warn' },
  atencao:      { label: 'ATENÇÃO', cls: 't-warn' },
  concluido:    { label: 'CONCLUÍDO', cls: 't-ok' },
};

export default async function OsPage() {
  const supabase = await createClient();

  const { data: ordens } = await supabase
    .from('ordens_servico')
    .select(`
      id, numero, desenho, descricao, status, prazo,
      itens ( id, codigo, quantidade, material, ordem,
        item_operacoes ( id, nome, ordem, status ) )
    `)
    .order('numero');

  return (
    <AppShell>
      <header className="dtop">
        <div>
          <h2>Ordens de serviço</h2>
          <p>Acompanhamento por item e operação</p>
        </div>
      </header>

      <div className="wrap" style={{ padding: 20 }}>
        <div className="stack">
          {(ordens ?? []).map((os: any) => {
            const st = STATUS_TAG[os.status];
            const itens = (os.itens ?? []).sort((a: any, b: any) => a.ordem - b.ordem);
            return (
              <div key={os.id} className="card" style={{ overflow: 'hidden' }}>
                {/* ---------- desktop: cabeçalho + tabela ---------- */}
                <div className="desktop-only">
                  <div className="dw">
                    <div className="dh">
                      <div><b>{os.numero}</b><em>{os.desenho}{os.descricao ? ` · ${os.descricao}` : ''}</em></div>
                      <span className={`tag ${st.cls}`}>{st.label}{os.prazo ? ` · prazo ${new Date(os.prazo + 'T00:00:00').toLocaleDateString('pt-BR')}` : ''}</span>
                    </div>
                    {itens.length > 0 ? (
                      <div style={{ padding: '6px 8px 10px' }}>
                        <table>
                          <thead><tr><th>ITEM</th><th>QTD</th><th>MATERIAL</th><th>OPERAÇÕES</th></tr></thead>
                          <tbody>
                            {itens.map((it: any) => (
                              <tr key={it.id}>
                                <td className="mono">{it.codigo}</td>
                                <td>{it.quantidade} un</td>
                                <td>{it.material ?? '—'}</td>
                                <td>
                                  <div className="ops">
                                    {(it.item_operacoes ?? []).sort((a: any, b: any) => a.ordem - b.ordem).map((op: any) => (
                                      <span key={op.id} className={`op ${OP_CLS[op.status]}`}>{op.nome}{OP_ICON[op.status]}</span>
                                    ))}
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <p className="sub" style={{ padding: '12px 20px' }}>Ainda não iniciado.</p>
                    )}
                  </div>
                </div>

                {/* ---------- mobile: lista ---------- */}
                <div className="mobile-only">
                  <div className="ah">
                    <div><b>{os.numero}</b><em>{os.desenho}</em></div>
                    <span className={`tag ${st.cls}`}>{st.label}</span>
                  </div>
                  <div className="ab" style={{ display: 'block' }}>
                    {itens.map((it: any) => (
                      <div key={it.id} className="it">
                        <div className="r1"><span>Item {it.codigo} — {it.quantidade} un</span><span style={{ color: 'var(--muted)', fontWeight: 600 }}>{it.material}</span></div>
                        <div className="ops">
                          {(it.item_operacoes ?? []).sort((a: any, b: any) => a.ordem - b.ordem).map((op: any) => (
                            <span key={op.id} className={`op ${OP_CLS[op.status]}`}>{op.nome}{OP_ICON[op.status]}</span>
                          ))}
                        </div>
                      </div>
                    ))}
                    {itens.length === 0 && <div className="it" style={{ color: 'var(--muted)' }}>Ainda não iniciado.</div>}
                  </div>
                </div>
              </div>
            );
          })}
          {(ordens ?? []).length === 0 && <p className="sub" style={{ textAlign: 'center', padding: '40px 0' }}>Nenhuma OS cadastrada ainda.</p>}
        </div>
      </div>
    </AppShell>
  );
}
