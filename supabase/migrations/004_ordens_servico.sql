-- Ordens de serviço (desenhos) — ex: "OS 018/26", desenho "C133-WL101"
CREATE TYPE os_status AS ENUM ('nao_iniciado', 'em_andamento', 'atencao', 'concluido');

CREATE TABLE IF NOT EXISTS ordens_servico (
  id          uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  numero      text        NOT NULL UNIQUE,
  desenho     text,
  descricao   text,
  status      os_status   NOT NULL DEFAULT 'nao_iniciado',
  created_at  timestamptz DEFAULT now(),
  updated_at  timestamptz DEFAULT now()
);

ALTER TABLE ordens_servico ENABLE ROW LEVEL SECURITY;

CREATE POLICY "os_select"
  ON ordens_servico FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "os_insert"
  ON ordens_servico FOR INSERT
  WITH CHECK (get_my_role() IN ('admin', 'gestor'));

CREATE POLICY "os_update"
  ON ordens_servico FOR UPDATE
  USING (get_my_role() IN ('admin', 'gestor'));

CREATE POLICY "os_delete"
  ON ordens_servico FOR DELETE
  USING (get_my_role() IN ('admin', 'gestor'));
