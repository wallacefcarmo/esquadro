import { createClient } from '@/lib/supabase/server';
import { AppHeader } from '@/components/app-header';
import { StatusBadge } from '@/components/status-badge';

export default async function MaquinasPage() {
  const supabase = await createClient();

  const { data: maquinas } = await supabase
    .from('maquinas')
    .select('id, nome, status, manutencao_motivo, manutencao_ate, setores(nome)')
    .order('nome');

  return (
    <main className="min-h-screen bg-ice">
      <AppHeader title="Máquinas" />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {(maquinas ?? []).map((m: any) => (
            <div key={m.id} className="bg-white border border-line rounded-2xl p-4 flex items-start justify-between gap-3">
              <div>
                <div className="font-semibold text-ink text-sm">{m.nome}</div>
                <div className="text-xs text-muted mt-0.5">{m.setores?.nome ?? 'sem setor'}</div>
                {m.status === 'manutencao' && m.manutencao_motivo && (
                  <div className="text-xs text-vermelho mt-1">
                    {m.manutencao_motivo}
                    {m.manutencao_ate && ` · até ${new Date(m.manutencao_ate).toLocaleDateString('pt-BR')}`}
                  </div>
                )}
              </div>
              <StatusBadge status={m.status} />
            </div>
          ))}
        </div>
        {(maquinas ?? []).length === 0 && (
          <p className="text-muted text-sm text-center py-8">Nenhuma máquina cadastrada ainda.</p>
        )}
      </div>
    </main>
  );
}
