import { createClient } from '@/lib/supabase/server';
import { AppShell } from '@/components/app-shell';
import { CadastroMaquinas } from '@/components/cadastro-maquinas';
import { CadastroOs } from '@/components/cadastro-os';
import { CadastroUsuarios } from '@/components/cadastro-usuarios';
import Link from 'next/link';

const ABAS = [
  { id: 'maquinas', label: 'Máquinas' },
  { id: 'os', label: 'OS e itens' },
  { id: 'usuarios', label: 'Usuários' },
] as const;

export default async function CadastrosPage({
  searchParams,
}: {
  searchParams: Promise<{ aba?: string }>;
}) {
  const { aba: abaParam } = await searchParams;
  const aba = ABAS.find(a => a.id === abaParam)?.id ?? 'maquinas';
  const supabase = await createClient();

  const { data: setores } = await supabase.from('setores').select('id, nome, ordem, ativo').order('ordem');

  let conteudo = null;
  if (aba === 'maquinas') {
    const { data: maquinas } = await supabase.from('maquinas').select('*, setores(nome)').order('nome');
    conteudo = <CadastroMaquinas maquinas={maquinas ?? []} setores={setores ?? []} />;
  } else if (aba === 'os') {
    const { data: ordens } = await supabase.from('ordens_servico').select('*, itens(id, codigo)').order('numero');
    conteudo = <CadastroOs ordens={ordens ?? []} setores={setores ?? []} />;
  } else {
    const { data: perfis } = await supabase.from('perfis').select('*, setores(nome)').order('nome');
    conteudo = <CadastroUsuarios perfis={perfis ?? []} setores={setores ?? []} />;
  }

  return (
    <AppShell>
      <header className="dtop">
        <div>
          <h2>Cadastros</h2>
          <p>Máquinas, OS/itens e usuários</p>
        </div>
      </header>

      <div className="wrap" style={{ padding: 20 }}>
        <div className="stack">
          <div className="hs">
            {ABAS.map(a => (
              <Link key={a.id} href={`/cadastros?aba=${a.id}`} className={`pill ${aba === a.id ? 'on' : ''}`}>
                {a.label}
              </Link>
            ))}
          </div>
          {conteudo}
        </div>
      </div>
    </AppShell>
  );
}
