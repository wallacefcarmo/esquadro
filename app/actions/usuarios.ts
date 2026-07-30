'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import type { UserRole } from '@/lib/types';

export interface CriarUsuarioInput {
  nome: string;
  email: string;
  senha: string;
  role: UserRole;
  setor_id?: string;
}

export async function criarUsuario(input: CriarUsuarioInput) {
  const supabase = await createClient();

  const { data, error } = await supabase.rpc('criar_usuario_perfil', {
    p_email:    input.email,
    p_senha:    input.senha,
    p_nome:     input.nome,
    p_role:     input.role,
    p_setor_id: input.setor_id || null,
  });

  if (error) return { error: error.message };

  const result = data as { success?: boolean; error?: string };
  if (result?.error) return { error: result.error };

  revalidatePath('/cadastros');
  return { success: true };
}

export async function toggleAtivoPerfil(id: string, ativo: boolean) {
  const supabase = await createClient();

  const { data, error } = await supabase.rpc('toggle_usuario_ativo', {
    p_user_id: id,
    p_ativo:   ativo,
  });

  if (error) return { error: error.message };

  const result = data as { success?: boolean; error?: string };
  if (result?.error) return { error: result.error };

  revalidatePath('/cadastros');
  return { success: true };
}

export interface EditarUsuarioInput {
  nome: string;
  role: UserRole;
  setor_id?: string | null;
}

export async function editarUsuario(id: string, input: EditarUsuarioInput) {
  const supabase = await createClient();
  const nome = input.nome.trim();
  if (!nome) return { error: 'Nome não pode ser vazio.' };

  const { error } = await supabase
    .from('perfis')
    .update({ nome, role: input.role, setor_id: input.setor_id || null })
    .eq('id', id);

  if (error) return { error: error.message === 'new row violates row-level security policy for table "perfis"' ? 'Sem permissão para editar usuários.' : error.message };

  revalidatePath('/cadastros');
  return { success: true };
}

export async function excluirUsuario(id: string) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Não autenticado.' };

  const { data: perfil } = await supabase.from('perfis').select('role').eq('id', user.id).single();
  if (perfil?.role !== 'admin') return { error: 'Apenas administradores podem excluir usuários.' };

  if (id === user.id) return { error: 'Você não pode excluir seu próprio usuário.' };

  const { supabaseAdmin } = await import('@/lib/supabase/admin');
  const { error } = await supabaseAdmin.auth.admin.deleteUser(id);
  if (error) return { error: error.message };

  revalidatePath('/cadastros');
  return { success: true };
}
