import { createClient } from '@/lib/supabase/server';
import { AppShell } from '@/components/app-shell';

const TAG: Record<string, { label: string; cls: string }> = {
  livre:       { label: 'LIVRE', cls: 't-idle' },
  em_operacao: { label: 'EM OPERAÇÃO', cls: 't-warn' },
  manutencao:  { label: 'MANUTENÇÃO', cls: 't-bad' },
};

export default async function MaquinasPage() {
  const supabase = await createClient();

  const { data: maquinas } = await supabase
    .from('maquinas')
    .select(`
      id, nome, status, manutencao_motivo, manutencao_ate, setores(nome),
      item_operacoes ( nome, status, itens ( codigo, ordens_servico(numero) ) )
    `)
    .order('nome');

  return (
    <AppShell>
      <header className="dtop">
        <div>
          <h2>Máquinas</h2>
          <p>Status e alocação atual</p>
        </div>
      </header>

      <div className="wrap" style={{ padding: 20 }}>
        <div className="mach">
          {(maquinas ?? []).map((m: any) => {
            const t = TAG[m.status];
            const emUso = (m.item_operacoes ?? []).find((o: any) => o.status === 'em_execucao');
            return (
              <div key={m.id} className="mc">
                <div className="r1">
                  <div>
                    <div className="nm">{m.nome}</div>
                    <div className="os">
                      {m.status === 'manutencao'
                        ? (m.manutencao_motivo ?? 'Em manutenção') + (m.manutencao_ate ? ` · até ${new Date(m.manutencao_ate).toLocaleDateString('pt-BR')}` : '')
                        : emUso
                          ? `OS ${emUso.itens?.ordens_servico?.numero} · item ${emUso.itens?.codigo} · ${emUso.nome}`
                          : m.setores?.nome ?? 'sem alocação'}
                    </div>
                  </div>
                  <span className={`tag ${t.cls}`}>{t.label}</span>
                </div>
              </div>
            );
          })}
        </div>
        {(maquinas ?? []).length === 0 && <p className="sub" style={{ textAlign: 'center', padding: '40px 0' }}>Nenhuma máquina cadastrada ainda.</p>}
      </div>
    </AppShell>
  );
}
