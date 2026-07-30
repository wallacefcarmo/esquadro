'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';

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

    const { data, error } = await supabase.auth.signInWithPassword({ email, password: senha });

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

    router.push(perfil?.primeiro_acesso ? '/trocar-senha' : '/painel');
    router.refresh();
  }

  return (
    <main style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div style={{ width: '100%', maxWidth: 360 }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 28 }}>
          <div className="brand" style={{ color: 'var(--ink)', fontSize: 22, fontWeight: 800, letterSpacing: '.3px' }}>
            ESQU<span style={{ color: 'var(--amber)' }}>A</span>DRO
          </div>
          <p className="sub" style={{ marginTop: 6 }}>Gestão de produção · BNG Metalmecânica</p>
        </div>

        <form onSubmit={handleLogin} className="auth-card stack">
          <h2 style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.5px', textTransform: 'uppercase', color: 'var(--muted)' }}>
            Acesso ao sistema
          </h2>

          <input
            type="email" className="field" value={email} onChange={e => setEmail(e.target.value)}
            placeholder="Email" required autoComplete="email"
          />
          <input
            type="password" className="field" value={senha} onChange={e => setSenha(e.target.value)}
            placeholder="Senha" required autoComplete="current-password"
          />

          {erro && <p style={{ fontSize: 12, color: 'var(--red)' }}>{erro}</p>}

          <button type="submit" disabled={loading} className="btn pri block">
            {loading ? '…' : 'ENTRAR'}
          </button>
        </form>
      </div>
    </main>
  );
}
