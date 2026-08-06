-- 010_fix_perfis_update_self.sql
--
-- Corrige a política "perfis_update_self" (criada em 002_perfis.sql), que
-- não tinha WITH CHECK explícito. Sem WITH CHECK, o Postgres reaproveita a
-- condição do USING (id = auth.uid()) para validar a linha nova também —
-- ou seja, qualquer usuário autenticado podia, via update direto na tabela
-- (fora da UI), alterar o próprio "role" para 'admin' ou trocar o próprio
-- "setor_id" e "ativo". Isso é uma escalação de privilégio.
--
-- Esta migration recria a política com WITH CHECK, garantindo que o
-- próprio usuário só possa atualizar campos "seguros" (ex: primeiro_acesso,
-- usado na troca de senha obrigatória no 1º login) e nunca role, setor_id
-- ou ativo.

DROP POLICY IF EXISTS "perfis_update_self" ON perfis;

CREATE POLICY "perfis_update_self"
  ON perfis FOR UPDATE
  USING (id = auth.uid())
  WITH CHECK (
    id = auth.uid()
    AND role      = (SELECT role      FROM perfis WHERE id = auth.uid())
    AND setor_id  IS NOT DISTINCT FROM (SELECT setor_id FROM perfis WHERE id = auth.uid())
    AND ativo     = (SELECT ativo     FROM perfis WHERE id = auth.uid())
  );

-- Nada muda para admin: "perfis_update_admin" continua permitindo update
-- irrestrito por quem já é admin (inclusive troca de role/setor/ativo de
-- outros usuários).
