import { createClient } from '@/lib/supabase/server';
import { AppShell } from '@/components/app-shell';
import { OperacaoCard } from '@/components/operacao-card';
import { RealtimeRefresher } from '@/components/realtime-refresher';
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
    ? await supabase.from('perfis').select('nome, role, setor_id').eq('id', user.id).single()
    : { data: null };

  const { data: setores } = await supabase.from('setores').select('id, nome, ordem').order('ordem');

  const podeTrocarSetor = perfil?.role === 'admin' || perfil?.role === 'gestor';
  const setorAtual = podeTrocarSetor
    ? (setorParam ?? perfil?.setor_id ?? setores?.[0]?.id)
    : perfil?.setor_id ?? setores?.[0]?.id;

  const setorNome = setores?.find(s => s.id === setorAtual)?.nome ?? '';

  const { data: operacoes } = setorAtual
    ? await supabase
        .from('item_operacoes')
        .select('id, nome, status, ordem, unidade_extra, iniciado_em, itens(codigo, material, ordens_servico(numero))')
        .eq('setor_id', setorAtual)
        .order('ordem')
    : { data: [] };

  const todas = operacoes ?? [];
  const concluidas = todas.filter((o: any) => o.status === 'concluido').length;
  const pct = todas.length ? Math.round((concluidas / todas.length) * 100) : 0;

  return (
    <AppShell>
      <RealtimeRefresher />

      <header className="dtop">
        <div>
          <h2>Chão de fábrica</h2>
          <p>{perfil?.nome ?? 'Líder'} · {setorNome}</p>
        </div>
      </header>

      <div className="wrap" style={{ padding: 20, maxWidth: 640, margin: '0 auto' }}>
        <div className="stack">
          {podeTrocarSetor && (
            <div className="hs">
              {(setores ?? []).map(s => (
                <Link key={s.id} href={`/apontamento?setor=${s.id}`} className={`pill ${setorAtual === s.id ? 'on' : ''}`}>
                  {s.nome}
                </Link>
              ))}
            </div>
          )}

          <div style={{
            display: 'flex', alignItems: 'center', gap: 9, background: 'var(--ink2)', color: '#fff',
            borderRadius: 10, padding: '10px 12px',
          }}>
            <div className="bar" style={{ flex: 1, background: 'rgba(255,255,255,.2)' }}>
              <i style={{ width: `${Math.max(pct, 4)}%`, background: 'var(--amber)' }} />
            </div>
            <span style={{ fontSize: 11.5, fontWeight: 700, whiteSpace: 'nowrap' }}>{concluidas} de {todas.length} concluídos</span>
          </div>

          <div className="stack">
            {todas.map((op: any) => (
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
            {todas.length === 0 && <p className="sub" style={{ textAlign: 'center', padding: '32px 0' }}>Nenhuma operação neste setor ainda.</p>}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
