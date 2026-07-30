'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import type { MaquinaStatus, OsStatus } from '@/lib/types';

// ── Máquinas ─────────────────────────────────────────────────────────────────

export async function criarMaquina(dados: { nome: string; setor_id: string | null }) {
  const supabase = await createClient();
  const nome = dados.nome.trim();
  if (!nome) return { error: 'Nome não pode ser vazio.' };

  const { error } = await supabase.from('maquinas').insert({ nome, setor_id: dados.setor_id });
  if (error) return { error: error.code === '23505' ? 'Máquina já cadastrada.' : error.message };
  revalidatePath('/cadastros');
  revalidatePath('/maquinas');
  return { success: true };
}

export async function atualizarStatusMaquina(
  id: string,
  status: MaquinaStatus,
  manutencaoMotivo?: string,
  manutencaoAte?: string
) {
  const supabase = await createClient();
  const { error } = await supabase
    .from('maquinas')
    .update({
      status,
      manutencao_motivo: status === 'manutencao' ? manutencaoMotivo ?? null : null,
      manutencao_ate: status === 'manutencao' ? manutencaoAte ?? null : null,
    })
    .eq('id', id);
  if (error) return { error: error.message };
  revalidatePath('/cadastros');
  revalidatePath('/maquinas');
  return { success: true };
}

export async function excluirMaquina(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from('maquinas').delete().eq('id', id);
  if (error) return { error: error.message };
  revalidatePath('/cadastros');
  revalidatePath('/maquinas');
  return { success: true };
}

// ── Ordens de serviço ────────────────────────────────────────────────────────

export async function criarOrdemServico(dados: {
  numero: string;
  desenho?: string;
  descricao?: string;
}) {
  const supabase = await createClient();
  const numero = dados.numero.trim();
  if (!numero) return { error: 'Número da OS não pode ser vazio.' };

  const { error } = await supabase.from('ordens_servico').insert({
    numero,
    desenho: dados.desenho || null,
    descricao: dados.descricao || null,
  });
  if (error) return { error: error.code === '23505' ? 'OS já cadastrada.' : error.message };
  revalidatePath('/cadastros');
  revalidatePath('/os');
  return { success: true };
}

export async function atualizarStatusOs(id: string, status: OsStatus) {
  const supabase = await createClient();
  const { error } = await supabase
    .from('ordens_servico')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', id);
  if (error) return { error: error.message };
  revalidatePath('/cadastros');
  revalidatePath('/os');
  revalidatePath('/painel');
  return { success: true };
}

export async function excluirOrdemServico(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from('ordens_servico').delete().eq('id', id);
  if (error) return { error: error.message };
  revalidatePath('/cadastros');
  revalidatePath('/os');
  return { success: true };
}

// ── Itens e operações ────────────────────────────────────────────────────────

export async function criarItem(dados: {
  os_id: string;
  codigo: string;
  quantidade: number;
  material?: string;
  operacoes: string[];
  setor_ids: (string | null)[];
}) {
  const supabase = await createClient();
  const codigo = dados.codigo.trim();
  if (!codigo) return { error: 'Código do item não pode ser vazio.' };
  if (dados.operacoes.length === 0) return { error: 'Informe ao menos uma operação.' };

  const { data: item, error } = await supabase
    .from('itens')
    .insert({
      os_id: dados.os_id,
      codigo,
      quantidade: dados.quantidade,
      material: dados.material || null,
    })
    .select('id')
    .single();
  if (error) return { error: error.code === '23505' ? 'Item já existe nesta OS.' : error.message };

  const operacoes = dados.operacoes.map((nome, i) => ({
    item_id: item.id,
    nome,
    ordem: i,
    setor_id: dados.setor_ids[i] ?? null,
  }));
  const { error: opError } = await supabase.from('item_operacoes').insert(operacoes);
  if (opError) return { error: opError.message };

  revalidatePath('/cadastros');
  revalidatePath('/os');
  return { success: true };
}

export async function excluirItem(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from('itens').delete().eq('id', id);
  if (error) return { error: error.message };
  revalidatePath('/cadastros');
  revalidatePath('/os');
  return { success: true };
}

// ── Programação semanal ──────────────────────────────────────────────────────

export async function criarProgramacao(dados: {
  setor_id: string;
  semana: string;
  responsavel_nome: string;
  dia_semana: number;
  os_id?: string;
  descricao?: string;
  tipo: 'producao' | 'manutencao';
}) {
  const supabase = await createClient();
  const responsavel = dados.responsavel_nome.trim();
  if (!responsavel) return { error: 'Informe o responsável.' };

  const { error } = await supabase.from('programacao_semanal').insert({
    setor_id: dados.setor_id,
    semana: dados.semana,
    responsavel_nome: responsavel,
    dia_semana: dados.dia_semana,
    os_id: dados.os_id || null,
    descricao: dados.descricao || null,
    tipo: dados.tipo,
  });
  if (error) return { error: error.message };
  revalidatePath('/programacao');
  return { success: true };
}

export async function publicarProgramacao(setorId: string, semana: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from('programacao_semanal')
    .update({ publicada: true, publicada_em: new Date().toISOString() })
    .eq('setor_id', setorId)
    .eq('semana', semana);
  if (error) return { error: error.message };
  revalidatePath('/programacao');
  return { success: true };
}

export async function excluirProgramacao(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from('programacao_semanal').delete().eq('id', id);
  if (error) return { error: error.message };
  revalidatePath('/programacao');
  return { success: true };
}
