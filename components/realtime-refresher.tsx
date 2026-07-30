'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';

/** Escuta mudanças em apontamentos/item_operacoes e atualiza a página automaticamente. */
export function RealtimeRefresher() {
  const router = useRouter();

  useEffect(() => {
    const channel = supabase
      .channel('esquadro-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'apontamentos' }, () => router.refresh())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'item_operacoes' }, () => router.refresh())
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [router]);

  return null;
}
