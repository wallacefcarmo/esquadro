import { createClient } from '@/lib/supabase/server';
import { AppHeader } from '@/components/app-header';
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
    <main className="min-h-screen bg-ice">
      <AppHeader title="Cadastros" />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 flex flex-col gap-4">
        <div className="flex gap-2">
          {ABAS.map(a => (
            <Link
              key={a.id}
              href={`/cadastros?aba=${a.id}`}
              className={`px-4 py-2 rounded-full text-sm font-semibold transition-colors ${
                aba === a.id ? 'bg-navy text-white' : 'bg-white border border-line text-ink'
              }`}
            >
              {a.label}
            </Link>
          ))}
        </div>
        {conteudo}
      </div>
    </main>
  );
}
