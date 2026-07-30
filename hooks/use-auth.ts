'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import type { Perfil } from '@/lib/types';

export function useAuth() {
  const [perfil, setPerfil]   = useState<Perfil | null>(null);
  const [loading, setLoading] = useState(true);

  async function loadPerfil() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setPerfil(null); setLoading(false); return; }

    const { data } = await supabase
      .from('perfis')
      .select('*')
      .eq('id', user.id)
      .single();

    setPerfil((data as Perfil) ?? null);
    setLoading(false);
  }

  useEffect(() => {
    loadPerfil();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      loadPerfil();
    });

    return () => subscription.unsubscribe();
  }, []);

  async function logout() {
    await supabase.auth.signOut();
    window.location.href = '/login';
  }

  return { perfil, loading, logout };
}
