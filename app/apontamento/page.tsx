import { createClient } from '@/lib/supabase/server';
import { AppHeader } from '@/components/app-header';
import { OperacaoCard } from '@/components/operacao-card';
import Link from 'next/link';

export default async function ApontamentoPage({
  searchParams,
}: {
  searchParams: Promise<{ setor?: string }>;
}) {
  const { setor: setorParam } = await searchParams;
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  const { data: perfil } = user
    ? await supabase.from('perfis').select('role, setor_id').eq('id', user.id).single()
    : { data: null };

  const { data: setores } = await supabase.from('setores').select('id, nome, ordem').order('ordem');

  const podeTrocarSetor = perfil?.role === 'admin' || perfil?.role === 'gestor';
  const setorAtual = podeTrocarSetor
    ? (setorParam ?? perfil?.setor_id ?? setores?.[0]?.id)
    : perfil?.setor_id ?? setores?.[0]?.id;

  const { data: operacoes } = setorAtual
    ? await supabase
        .from('item_operacoes')
        .select('id, nome, status, ordem, unidade_extra, iniciado_em, itens(codigo, material, ordens_servico(numero))')
        .eq('setor_id', setorAtual)
        .neq('status', 'concluido')
        .order('ordem')
    : { data: [] };

  return (
    <main className="min-h-screen bg-ice">
      <AppHeader title="Apontamento" />

      <div className="max-w-lg mx-auto px-4 py-6 flex flex-col gap-4">
        {podeTrocarSetor && (
          <div className="flex gap-2 overflow-x-auto pb-1">
            {(setores ?? []).map(s => (
              <Link
                key={s.id}
                href={`/apontamento?setor=${s.id}`}
                className={`px-3.5 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${
                  setorAtual === s.id ? 'bg-navy text-white' : 'bg-white border border-line text-ink'
                }`}
              >
                {s.nome}
              </Link>
            ))}
          </div>
        )}

        <div className="flex flex-col gap-3">
          {(operacoes ?? []).map((op: any) => (
            <OperacaoCard
              key={op.id}
              id={op.id}
              nome={op.nome}
              status={op.status}
              osNumero={op.itens?.ordens_servico?.numero ?? '—'}
              itemCodigo={op.itens?.codigo ?? '—'}
              material={op.itens?.material ?? null}
              unidadeExtra={op.unidade_extra}
              iniciadoEm={op.iniciado_em}
            />
          ))}
          {(operacoes ?? []).length === 0 && (
            <p className="text-muted text-sm text-center py-8">
              Nenhuma operação pendente neste setor.
            </p>
          )}
        </div>
      </div>
    </main>
  );
}
