import { createClient } from '@/lib/supabase/server';
import { AppShell } from '@/components/app-shell';
import { ProgramacaoForm } from '@/components/programacao-form';
import Link from 'next/link';

const DIAS = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex'];
const DIAS_DATA = ['SEG', 'TER', 'QUA', 'QUI', 'SEX'];

function semanaAtual() {
  const hoje = new Date();
  const jan1 = new Date(hoje.getFullYear(), 0, 1);
  const semana = Math.ceil(((+hoje - +jan1) / 86400000 + jan1.getDay() + 1) / 7);
  return `Semana ${semana} · ${hoje.getFullYear()}`;
}

export default async function ProgramacaoPage({
  searchParams,
}: {
  searchParams: Promise<{ setor?: string; semana?: string; dia?: string }>;
}) {
  const { setor: setorParam, semana: semanaParam, dia: diaParam } = await searchParams;
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  const { data: perfil } = user
    ? await supabase.from('perfis').select('role, setor_id').eq('id', user.id).single()
    : { data: null };

  const { data: setores } = await supabase.from('setores').select('id, nome, ordem').order('ordem');
  const setorAtual = setorParam ?? perfil?.setor_id ?? setores?.[0]?.id;
  const semana = semanaParam ?? semanaAtual();
  const diaAtivo = Number(diaParam ?? (new Date().getDay() || 1));

  const podeGerenciar = perfil?.role === 'admin' || perfil?.role === 'gestor';

  const [{ data: entradas }, { data: ordensServico }] = await Promise.all([
    setorAtual
      ? supabase
          .from('programacao_semanal')
          .select('id, responsavel_nome, dia_semana, descricao, tipo, publicada, ordens_servico(numero)')
          .eq('setor_id', setorAtual)
          .eq('semana', semana)
          .order('responsavel_nome')
      : Promise.resolve({ data: [] as any[] }),
    supabase.from('ordens_servico').select('id, numero').order('numero'),
  ]);

  const responsaveis = Array.from(new Set((entradas ?? []).map((e: any) => e.responsavel_nome)));
  const publicada = (entradas ?? []).some((e: any) => e.publicada);

  function entradaDe(nome: string, dia: number) {
    return (entradas ?? []).find((e: any) => e.responsavel_nome === nome && e.dia_semana === dia);
  }

  return (
    <AppShell>
      <header className="dtop">
        <div>
          <h2>Programação semanal</h2>
          <p>{semana}{publicada ? ' · publicada' : ' · rascunho, não publicada'}</p>
        </div>
      </header>

      <div className="wrap" style={{ padding: 20 }}>
        <div className="stack">
          <div className="hs">
            {(setores ?? []).map(s => (
              <Link key={s.id} href={`/programacao?setor=${s.id}&semana=${encodeURIComponent(semana)}`} className={`pill ${setorAtual === s.id ? 'on' : ''}`}>
                {s.nome}
              </Link>
            ))}
          </div>

          {/* ---------- desktop: tabela ---------- */}
          <div className="desktop-only card sched">
            <table>
              <thead>
                <tr>
                  <th>RESPONSÁVEL</th>
                  {DIAS_DATA.map(d => <th key={d}>{d}</th>)}
                </tr>
              </thead>
              <tbody>
                {responsaveis.map(nome => (
                  <tr key={nome}>
                    <td>{nome}</td>
                    {DIAS.map((_, i) => {
                      const e = entradaDe(nome, i + 1);
                      return (
                        <td key={i}>
                          {e ? (
                            <div className={`chip ${e.tipo === 'manutencao' ? 'mt' : ''}`}>
                              {e.ordens_servico?.numero && <b>{e.ordens_servico.numero}</b>}
                              <span>{e.descricao}</span>
                            </div>
                          ) : <div className="empty">livre</div>}
                        </td>
                      );
                    })}
                  </tr>
                ))}
                {responsaveis.length === 0 && (
                  <tr><td colSpan={6} className="sub" style={{ textAlign: 'center', padding: 20 }}>Nenhuma programação para esta semana.</td></tr>
                )}
              </tbody>
            </table>
          </div>

          {/* ---------- mobile: dia + lista ---------- */}
          <div className="mobile-only stack">
            <div className="hs">
              {DIAS.map((d, i) => (
                <Link key={i} href={`/programacao?setor=${setorAtual}&semana=${encodeURIComponent(semana)}&dia=${i + 1}`} className={`daypill ${diaAtivo === i + 1 ? 'on' : ''}`}>
                  {d}
                </Link>
              ))}
            </div>
            <div className="card">
              {responsaveis.map(nome => {
                const e = entradaDe(nome, diaAtivo);
                return (
                  <div key={nome} className="res">
                    <div className="r1"><div><b>{nome}</b></div></div>
                    {e ? (
                      <div className="task"><b>{e.ordens_servico?.numero}</b><span style={{ display: 'block', color: 'var(--muted)' }}>{e.descricao}</span></div>
                    ) : <div className="free">livre neste dia</div>}
                    <div className="dots">
                      {DIAS.map((_, i) => {
                        const ent = entradaDe(nome, i + 1);
                        let cls = ent ? (ent.tipo === 'manutencao' ? 'on mt' : 'on') : '';
                        if (i + 1 === diaAtivo) cls += ' today';
                        return <i key={i} className={cls} />;
                      })}
                    </div>
                  </div>
                );
              })}
              {responsaveis.length === 0 && <p className="sub" style={{ padding: 16 }}>Nenhuma programação para esta semana.</p>}
            </div>
          </div>

          {podeGerenciar && setorAtual && (
            <ProgramacaoForm setorId={setorAtual} semana={semana} ordensServico={ordensServico ?? []} publicada={publicada} />
          )}

          <div className="banner">Publicou, todos os líderes veem a versão vigente na hora — inclusive no celular.</div>
        </div>
      </div>
    </AppShell>
  );
}
