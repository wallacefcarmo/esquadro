import { createClient } from '@/lib/supabase/server';
import { AppShell } from '@/components/app-shell';

const ACAO_LABEL: Record<string, string> = { INSERT: 'criou', UPDATE: 'editou', DELETE: 'excluiu' };

export default async function HistoricoPage() {
  const supabase = await createClient();

  const { data: registros } = await supabase
    .from('historico_alteracoes')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(100);

  return (
    <AppShell>
      <header className="dtop">
        <div>
          <h2>Histórico</h2>
          <p>Log de alterações em setores, máquinas, OS, itens e usuários</p>
        </div>
      </header>

      <div className="wrap" style={{ padding: 20 }}>
        <div className="card feed" style={{ padding: '4px 20px' }}>
          {(registros ?? []).map(r => (
            <div key={r.id}>
              <time style={{ flex: '0 0 90px' }}>{new Date(r.created_at).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}</time>
              <p>
                <b>{r.usuario_nome ?? 'sistema'}</b> {ACAO_LABEL[r.acao] ?? r.acao.toLowerCase()} um registro em <b>{r.tabela}</b>
              </p>
            </div>
          ))}
          {(registros ?? []).length === 0 && <p className="sub" style={{ padding: '16px 0' }}>Nenhuma alteração registrada ainda.</p>}
        </div>
      </div>
    </AppShell>
  );
}
