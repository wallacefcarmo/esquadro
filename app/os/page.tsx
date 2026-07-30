import { createClient } from '@/lib/supabase/server';
import { AppHeader } from '@/components/app-header';
import { StatusBadge } from '@/components/status-badge';

export default async function OsPage() {
  const supabase = await createClient();

  const { data: ordens } = await supabase
    .from('ordens_servico')
    .select(`
      id, numero, desenho, descricao, status,
      itens (
        id, codigo, quantidade, material,
        item_operacoes ( id, nome, ordem, status )
      )
    `)
    .order('numero');

  return (
    <main className="min-h-screen bg-ice">
      <AppHeader title="OS por item/operação" />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 flex flex-col gap-3">
        {(ordens ?? []).map((os: any) => (
          <details key={os.id} className="bg-white border border-line rounded-2xl overflow-hidden group" open>
            <summary className="px-5 py-4 flex items-center justify-between gap-3 cursor-pointer list-none">
              <div>
                <b className="text-ink">{os.numero}</b>
                {os.desenho && <em className="text-muted text-sm not-italic ml-2">{os.desenho}</em>}
                {os.descricao && <p className="text-xs text-muted mt-0.5">{os.descricao}</p>}
              </div>
              <StatusBadge status={os.status} />
            </summary>
            <div className="border-t border-line divide-y divide-line">
              {(os.itens ?? [])
                .sort((a: any, b: any) => a.ordem - b.ordem)
                .map((item: any) => (
                  <div key={item.id} className="px-5 py-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-ink">Item {item.codigo} — {item.quantidade} un</span>
                      <span className="text-muted">{item.material}</span>
                    </div>
                    <div className="flex flex-wrap items-center gap-1.5 mt-2">
                      {(item.item_operacoes ?? [])
                        .sort((a: any, b: any) => a.ordem - b.ordem)
                        .map((op: any, i: number) => (
                          <span key={op.id} className="inline-flex items-center gap-1.5">
                            {i > 0 && <span className="text-muted">→</span>}
                            <span className="text-xs text-ink">{op.nome}</span>
                            <StatusBadge status={op.status} />
                          </span>
                        ))}
                    </div>
                  </div>
                ))}
              {(os.itens ?? []).length === 0 && (
                <p className="px-5 py-3 text-muted text-sm">Ainda não iniciado.</p>
              )}
            </div>
          </details>
        ))}
        {(ordens ?? []).length === 0 && (
          <p className="text-muted text-sm text-center py-8">Nenhuma OS cadastrada ainda.</p>
        )}
      </div>
    </main>
  );
}
