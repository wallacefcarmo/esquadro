'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

function refreshApontamento() {
  revalidatePath('/apontamento');
  revalidatePath('/os');
  revalidatePath('/painel');
  revalidatePath('/maquinas');
}

async function currentUser() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  return { supabase, user };
}

export async function iniciarOperacao(itemOperacaoId: string) {
  const { supabase, user } = await currentUser();
  if (!user) return { error: 'Não autenticado.' };

  const agora = new Date().toISOString();
  const { error: upErr } = await supabase
    .from('item_operacoes')
    .update({ status: 'em_execucao', iniciado_em: agora, responsavel_id: user.id })
    .eq('id', itemOperacaoId);
  if (upErr) return { error: upErr.message };

  const { error: apErr } = await supabase
    .from('apontamentos')
    .insert({ item_operacao_id: itemOperacaoId, usuario_id: user.id, acao: 'iniciar' });
  if (apErr) return { error: apErr.message };

  refreshApontamento();
  return { success: true };
}

export async function encerrarOperacao(
  itemOperacaoId: string,
  quantidade?: number,
  medidaExtra?: number
) {
  const { supabase, user } = await currentUser();
  if (!user) return { error: 'Não autenticado.' };

  const agora = new Date().toISOString();
  const update: Record<string, unknown> = { status: 'concluido', concluido_em: agora };
  if (quantidade !== undefined) update.quantidade_concluida = quantidade;
  if (medidaExtra !== undefined) update.medida_extra = medidaExtra;

  const { error: upErr } = await supabase.from('item_operacoes').update(update).eq('id', itemOperacaoId);
  if (upErr) return { error: upErr.message };

  const { error: apErr } = await supabase.from('apontamentos').insert({
    item_operacao_id: itemOperacaoId,
    usuario_id: user.id,
    acao: 'encerrar',
    quantidade,
    medida_extra: medidaExtra,
  });
  if (apErr) return { error: apErr.message };

  refreshApontamento();
  return { success: true };
}

export async function pararOperacao(itemOperacaoId: string, motivo: string) {
  const { supabase, user } = await currentUser();
  if (!user) return { error: 'Não autenticado.' };

  const { error: upErr } = await supabase
    .from('item_operacoes')
    .update({ status: 'parado' })
    .eq('id', itemOperacaoId);
  if (upErr) return { error: upErr.message };

  const { error: apErr } = await supabase.from('apontamentos').insert({
    item_operacao_id: itemOperacaoId,
    usuario_id: user.id,
    acao: 'parada',
    motivo_parada: motivo,
  });
  if (apErr) return { error: apErr.message };

  refreshApontamento();
  return { success: true };
}

export async function retomarOperacao(itemOperacaoId: string) {
  const { supabase, user } = await currentUser();
  if (!user) return { error: 'Não autenticado.' };

  const { error: upErr } = await supabase
    .from('item_operacoes')
    .update({ status: 'em_execucao' })
    .eq('id', itemOperacaoId);
  if (upErr) return { error: upErr.message };

  const { error: apErr } = await supabase
    .from('apontamentos')
    .insert({ item_operacao_id: itemOperacaoId, usuario_id: user.id, acao: 'retomar' });
  if (apErr) return { error: apErr.message };

  refreshApontamento();
  return { success: true };
}
