'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import { LogoMark } from '@/components/logo-mark';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail]     = useState('');
  const [senha, setSenha]     = useState('');
  const [erro, setErro]       = useState('');
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setErro('');
    setLoading(true);

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password: senha,
    });

    if (error || !data.user) {
      setErro('Email ou senha incorretos.');
      setLoading(false);
      return;
    }

    const { data: perfil } = await supabase
      .from('perfis')
      .select('primeiro_acesso')
      .eq('id', data.user.id)
      .single();

    if (perfil?.primeiro_acesso) {
      router.push('/trocar-senha');
    } else {
      router.push('/');
    }
    router.refresh();
  }

  return (
    <main className="min-h-screen bg-ice flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center mb-8">
          <LogoMark size={48} />
          <h1 className="font-bold text-2xl tracking-wide text-navy mt-3">
            ESQU<span className="text-amber">A</span>DRO
          </h1>
          <p className="text-muted text-sm mt-1 tracking-wide">PCP · BNG Metalmecânica</p>
        </div>

        <form
          onSubmit={handleLogin}
          className="bg-white border border-line rounded-2xl p-6 flex flex-col gap-4"
        >
          <h2 className="font-semibold text-xs tracking-[3px] uppercase text-muted">
            Acesso ao sistema
          </h2>

          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="Email"
            required
            autoComplete="email"
            className="bg-ice border border-line rounded-lg px-4 py-3 text-ink placeholder-muted focus:outline-none focus:border-steel text-sm"
          />

          <input
            type="password"
            value={senha}
            onChange={e => setSenha(e.target.value)}
            placeholder="Senha"
            required
            autoComplete="current-password"
            className="bg-ice border border-line rounded-lg px-4 py-3 text-ink placeholder-muted focus:outline-none focus:border-steel text-sm"
          />

          {erro && <p className="text-xs text-vermelho">{erro}</p>}

          <button
            type="submit"
            disabled={loading}
            className="py-3 bg-amber text-navy rounded-lg font-semibold tracking-wide hover:opacity-90 disabled:opacity-40 transition-opacity"
          >
            {loading ? '…' : 'ENTRAR'}
          </button>
        </form>
      </div>
    </main>
  );
}
