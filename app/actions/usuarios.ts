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
