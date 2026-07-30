'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';

export default function TrocarSenhaPage() {
  const router = useRouter();
  const [novaSenha, setNovaSenha] = useState('');
  const [confirmar, setConfirmar] = useState('');
  const [erro, setErro]           = useState('');
  const [loading, setLoading]     = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErro('');

    if (novaSenha.length < 6) { setErro('A senha deve ter pelo menos 6 caracteres.'); return; }
    if (novaSenha !== confirmar) { setErro('As senhas não coincidem.'); return; }

    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password: novaSenha });
    if (error) { setErro(error.message); setLoading(false); return; }

    const { data: { user } } = await supabase.auth.getUser();
    if (user) await supabase.from('perfis').update({ primeiro_acesso: false }).eq('id', user.id);

    router.push('/painel');
    router.refresh();
  }

  return (
    <main style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div style={{ width: '100%', maxWidth: 360 }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 28 }}>
          <div style={{ color: 'var(--ink)', fontSize: 20, fontWeight: 800, letterSpacing: '.3px' }}>ESQUADRO</div>
        </div>

        <div className="auth-card stack">
          <div>
            <h2 className="h3">Definir nova senha</h2>
            <p className="sub" style={{ marginTop: 4 }}>Este é seu primeiro acesso. Escolha uma nova senha para continuar.</p>
          </div>

          <form onSubmit={handleSubmit} className="stack" style={{ gap: 10 }}>
            <input
              type="password" className="field" value={novaSenha} onChange={e => setNovaSenha(e.target.value)}
              placeholder="Nova senha (mín. 6 caracteres)" required autoComplete="new-password"
            />
            <input
              type="password" className="field" value={confirmar} onChange={e => setConfirmar(e.target.value)}
              placeholder="Confirmar nova senha" required autoComplete="new-password"
            />

            {erro && <p style={{ fontSize: 12, color: 'var(--red)' }}>{erro}</p>}

            <button type="submit" disabled={loading} className="btn pri block">
              {loading ? '…' : 'SALVAR NOVA SENHA'}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}
