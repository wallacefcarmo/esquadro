'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import { LogoMark } from '@/components/logo-mark';

export default function TrocarSenhaPage() {
  const router = useRouter();
  const [novaSenha, setNovaSenha] = useState('');
  const [confirmar, setConfirmar] = useState('');
  const [erro, setErro]           = useState('');
  const [loading, setLoading]     = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErro('');

    if (novaSenha.length < 6) {
      setErro('A senha deve ter pelo menos 6 caracteres.');
      return;
    }
    if (novaSenha !== confirmar) {
      setErro('As senhas não coincidem.');
      return;
    }

    setLoading(true);

    const { error } = await supabase.auth.updateUser({ password: novaSenha });
    if (error) {
      setErro(error.message);
      setLoading(false);
      return;
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await supabase.from('perfis').update({ primeiro_acesso: false }).eq('id', user.id);
    }

    router.push('/');
    router.refresh();
  }

  return (
    <main className="min-h-screen bg-ice flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center mb-8">
          <LogoMark size={40} />
          <h1 className="font-bold text-xl tracking-wide text-navy mt-3">ESQUADRO</h1>
        </div>

        <div className="bg-white border border-line rounded-2xl p-6 flex flex-col gap-4">
          <div>
            <h2 className="font-semibold text-base tracking-wide text-ink">
              Definir nova senha
            </h2>
            <p className="text-muted text-sm mt-1">
              Este é seu primeiro acesso. Escolha uma nova senha para continuar.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            <input
              type="password"
              value={novaSenha}
              onChange={e => setNovaSenha(e.target.value)}
              placeholder="Nova senha (mín. 6 caracteres)"
              required
              autoComplete="new-password"
              className="bg-ice border border-line rounded-lg px-4 py-3 text-ink placeholder-muted focus:outline-none focus:border-steel text-sm"
            />
            <input
              type="password"
              value={confirmar}
              onChange={e => setConfirmar(e.target.value)}
              placeholder="Confirmar nova senha"
              required
              autoComplete="new-password"
              className="bg-ice border border-line rounded-lg px-4 py-3 text-ink placeholder-muted focus:outline-none focus:border-steel text-sm"
            />

            {erro && <p className="text-xs text-vermelho">{erro}</p>}

            <button
              type="submit"
              disabled={loading}
              className="py-3 bg-amber text-navy rounded-lg font-semibold tracking-wide hover:opacity-90 disabled:opacity-40 transition-opacity mt-1"
            >
              {loading ? '…' : 'SALVAR NOVA SENHA'}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}
