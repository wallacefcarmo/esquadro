import { createClient } from '@/lib/supabase/server';
import { AppHeader } from '@/components/app-header';
import { ProgramacaoForm } from '@/components/programacao-form';
import Link from 'next/link';

const DIAS = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex'];

function semanaAtual() {
  const hoje = new Date();
  const jan1 = new Date(hoje.getFullYear(), 0, 1);
  const semana = Math.ceil(((+hoje - +jan1) / 86400000 + jan1.getDay() + 1) / 7);
  return `Semana ${semana} · ${hoje.getFullYear()}`;
}

export default async function ProgramacaoPage({
  searchParams,
}: {
  searchParams: Promise<{ setor?: string; semana?: string }>;
}) {
  const { setor: setorParam, semana: semanaParam } = await searchParams;
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  const { data: perfil } = user
    ? await supabase.from('perfis').select('role, setor_id').eq('id', user.id).single()
    : { data: null };

  const { data: setores } = await supabase.from('setores').select('id, nome, ordem').order('ordem');
  const setorAtual = setorParam ?? perfil?.setor_id ?? setores?.[0]?.id;
  const semana = semanaParam ?? semanaAtual();

  const podeGerenciar = perfil?.role === 'admin' || perfil?.role === 'gestor';

  const [{ data: entradas }, { data: ordensServico }] = await Promise.all([
    setorAtual
      ? supabase
          .from('programacao_semanal')
          .select('id, responsavel_nome, dia_semana, descricao, tipo, publicada, ordens_servico(numero)')
          .eq('setor_id', setorAtual)
          .eq('semana', semana)
          .order('responsavel_nome')
      : Promise.resolve({ data: [] }),
    supabase.from('ordens_servico').select('id, numero').order('numero'),
  ]);

  const responsaveis = Array.from(new Set((entradas ?? []).map((e: any) => e.responsavel_nome)));
  const publicada = (entradas ?? []).some((e: any) => e.publicada);

  return (
    <main className="min-h-screen bg-ice">
      <AppHeader
        title="Programação semanal"
        actions={<span className="text-xs text-muted">{semana}{publicada ? ' · publicada' : ''}</span>}
      />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 flex flex-col gap-4">
        <div className="flex gap-2 overflow-x-auto pb-1">
          {(setores ?? []).map(s => (
            <Link
              key={s.id}
              href={`/programacao?setor=${s.id}&semana=${encodeURIComponent(semana)}`}
              className={`px-3.5 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${
                setorAtual === s.id ? 'bg-navy text-white' : 'bg-white border border-line text-ink'
              }`}
            >
              {s.nome}
            </Link>
          ))}
        </div>

        <div className="bg-white border border-line rounded-2xl overflow-x-auto">
          <table className="w-full text-sm min-w-[560px]">
            <thead>
              <tr className="border-b border-line">
                <th className="text-left px-4 py-2.5 text-xs text-muted uppercase">Responsável</th>
                {DIAS.map(d => <th key={d} className="text-left px-3 py-2.5 text-xs text-muted uppercase">{d}</th>)}
              </tr>
            </thead>
            <tbody>
              {responsaveis.map(nome => (
                <tr key={nome} className="border-b border-line last:border-0">
                  <td className="px-4 py-3 font-medium text-ink whitespace-nowrap">{nome}</td>
                  {DIAS.map((_, i) => {
                    const entrada: any = (entradas ?? []).find(
                      (e: any) => e.responsavel_nome === nome && e.dia_semana === i + 1
                    );
                    return (
                      <td key={i} className="px-3 py-3 align-top">
                        {entrada ? (
                          <div className={entrada.tipo === 'manutencao' ? 'text-vermelho' : 'text-ink'}>
                            {entrada.ordens_servico?.numero && <b className="block">{entrada.ordens_servico.numero}</b>}
                            <span className="text-xs">{entrada.descricao}</span>
                          </div>
                        ) : (
                          <span className="text-muted text-xs">livre</span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
              {responsaveis.length === 0 && (
                <tr><td colSpan={6} className="px-4 py-6 text-center text-muted text-sm">Nenhuma programação para esta semana.</td></tr>
              )}
            </tbody>
          </table>
        </div>

        {podeGerenciar && setorAtual && (
          <ProgramacaoForm setorId={setorAtual} semana={semana} ordensServico={ordensServico ?? []} />
        )}
      </div>
    </main>
  );
}
