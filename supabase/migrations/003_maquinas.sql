-- Máquinas do chão de fábrica (principalmente Usinagem — tornos, fresas, etc.)
CREATE TYPE maquina_status AS ENUM ('livre', 'em_operacao', 'manutencao');

CREATE TABLE IF NOT EXISTS maquinas (
  id                uuid            DEFAULT gen_random_uuid() PRIMARY KEY,
  nome              text            NOT NULL UNIQUE,
  setor_id          uuid            REFERENCES setores(id) ON DELETE SET NULL,
  status            maquina_status  NOT NULL DEFAULT 'livre',
  manutencao_motivo text,
  manutencao_ate    date,
  ativo             boolean         NOT NULL DEFAULT true,
  created_at        timestamptz     DEFAULT now()
);

ALTER TABLE maquinas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "maquinas_select"
  ON maquinas FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "maquinas_insert"
  ON maquinas FOR INSERT
  WITH CHECK (get_my_role() IN ('admin', 'gestor'));

CREATE POLICY "maquinas_update"
  ON maquinas FOR UPDATE
  USING (get_my_role() IN ('admin', 'gestor') OR get_my_setor_id() = setor_id);

CREATE POLICY "maquinas_delete"
  ON maquinas FOR DELETE
  USING (get_my_role() IN ('admin', 'gestor'));
