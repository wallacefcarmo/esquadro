-- Enum de perfis de acesso ao sistema
CREATE TYPE user_role AS ENUM ('admin', 'gestor', 'lider');

-- Tabela de perfis vinculada ao auth.users
CREATE TABLE IF NOT EXISTS perfis (
  id              UUID        PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nome            TEXT        NOT NULL,
  email           TEXT        NOT NULL,
  role            user_role   NOT NULL DEFAULT 'lider',
  setor_id        UUID        REFERENCES setores(id) ON DELETE SET NULL,
  primeiro_acesso BOOLEAN     NOT NULL DEFAULT TRUE,
  ativo           BOOLEAN     NOT NULL DEFAULT TRUE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Funções helper com SECURITY DEFINER para evitar recursão no RLS
CREATE OR REPLACE FUNCTION get_my_role()
RETURNS user_role
LANGUAGE SQL STABLE SECURITY DEFINER
AS $$ SELECT role FROM perfis WHERE id = auth.uid() $$;

CREATE OR REPLACE FUNCTION get_my_setor_id()
RETURNS UUID
LANGUAGE SQL STABLE SECURITY DEFINER
AS $$ SELECT setor_id FROM perfis WHERE id = auth.uid() $$;

-- RLS em perfis
ALTER TABLE perfis ENABLE ROW LEVEL SECURITY;

CREATE POLICY "perfis_select"
  ON perfis FOR SELECT
  USING (id = auth.uid() OR get_my_role() IN ('admin', 'gestor'));

CREATE POLICY "perfis_insert"
  ON perfis FOR INSERT
  WITH CHECK (get_my_role() IN ('admin', 'gestor'));

CREATE POLICY "perfis_update_admin"
  ON perfis FOR UPDATE
  USING (get_my_role() = 'admin');

CREATE POLICY "perfis_update_self"
  ON perfis FOR UPDATE
  USING (id = auth.uid());

CREATE POLICY "perfis_delete"
  ON perfis FOR DELETE
  USING (get_my_role() = 'admin');
