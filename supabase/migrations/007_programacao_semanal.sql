-- Programação semanal por setor (grade de segunda a sexta, por pessoa/dupla)
CREATE TABLE IF NOT EXISTS programacao_semanal (
  id                uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  setor_id          uuid        NOT NULL REFERENCES setores(id) ON DELETE CASCADE,
  semana            text        NOT NULL, -- ex: "Semana 27 · 2026"
  responsavel_nome  text        NOT NULL, -- pessoa ou dupla, ex: "Angelo / Yan"
  responsavel_id    uuid        REFERENCES perfis(id) ON DELETE SET NULL,
  dia_semana        int         NOT NULL CHECK (dia_semana BETWEEN 1 AND 5), -- 1=seg .. 5=sex
  os_id             uuid        REFERENCES ordens_servico(id) ON DELETE SET NULL,
  item_id           uuid        REFERENCES itens(id) ON DELETE SET NULL,
  descricao         text,
  tipo              text        NOT NULL DEFAULT 'producao' CHECK (tipo IN ('producao', 'manutencao')),
  publicada         boolean     NOT NULL DEFAULT false,
  publicada_em      timestamptz,
  created_at        timestamptz DEFAULT now()
);

ALTER TABLE programacao_semanal ENABLE ROW LEVEL SECURITY;

CREATE POLICY "programacao_select"
  ON programacao_semanal FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "programacao_insert"
  ON programacao_semanal FOR INSERT
  WITH CHECK (get_my_role() IN ('admin', 'gestor'));

CREATE POLICY "programacao_update"
  ON programacao_semanal FOR UPDATE
  USING (get_my_role() IN ('admin', 'gestor'));

CREATE POLICY "programacao_delete"
  ON programacao_semanal FOR DELETE
  USING (get_my_role() IN ('admin', 'gestor'));
