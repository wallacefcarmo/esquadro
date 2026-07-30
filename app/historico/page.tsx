import { createClient } from '@/lib/supabase/server';
import { AppHeader } from '@/components/app-header';

const ACAO_LABEL: Record<string, string> = { INSERT: 'criou', UPDATE: 'editou', DELETE: 'excluiu' };

export default async function HistoricoPage() {
  const supabase = await createClient();

  const { data: registros } = await supabase
    .from('historico_alteracoes')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(100);

  return (
    <main className="min-h-screen bg-ice">
      <AppHeader title="Histórico" />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6">
        <div className="bg-white border border-line rounded-2xl divide-y divide-line">
          {(registros ?? []).map((r: any) => (
            <div key={r.id} className="px-4 py-3">
              <div className="flex items-center justify-between gap-3 text-sm">
                <span className="text-ink">
                  <b>{r.usuario_nome ?? 'sistema'}</b> {ACAO_LABEL[r.acao] ?? r.acao.toLowerCase()} um registro em <b>{r.tabela}</b>
                </span>
                <span className="text-xs text-muted whitespace-nowrap">
                  {new Date(r.created_at).toLocaleString('pt-BR')}
                </span>
              </div>
            </div>
          ))}
          {(registros ?? []).length === 0 && (
            <p className="px-4 py-6 text-center text-muted text-sm">Nenhuma alteração registrada ainda.</p>
          )}
        </div>
      </div>
    </main>
  );
}
