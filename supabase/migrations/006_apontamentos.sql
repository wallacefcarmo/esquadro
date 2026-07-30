-- Log imutável de cada apontamento do líder no chão de fábrica
-- (iniciar / encerrar / parada / retomar), separado do estado atual em item_operacoes
CREATE TYPE apontamento_acao AS ENUM ('iniciar', 'encerrar', 'parada', 'retomar');

CREATE TABLE IF NOT EXISTS apontamentos (
  id                uuid              DEFAULT gen_random_uuid() PRIMARY KEY,
  item_operacao_id  uuid              NOT NULL REFERENCES item_operacoes(id) ON DELETE CASCADE,
  usuario_id        uuid              REFERENCES perfis(id) ON DELETE SET NULL,
  acao              apontamento_acao  NOT NULL,
  motivo_parada     text,
  quantidade        numeric(10,2),
  medida_extra      numeric(10,2),
  criado_em         timestamptz       DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_apontamentos_item_operacao ON apontamentos (item_operacao_id);
CREATE INDEX IF NOT EXISTS idx_apontamentos_criado_em      ON apontamentos (criado_em DESC);

ALTER TABLE apontamentos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "apontamentos_select"
  ON apontamentos FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "apontamentos_insert"
  ON apontamentos FOR INSERT
  WITH CHECK (usuario_id = auth.uid() OR get_my_role() IN ('admin', 'gestor'));

-- Expõe ao Realtime para o /painel atualizar sozinho
ALTER PUBLICATION supabase_realtime ADD TABLE apontamentos;
ALTER PUBLICATION supabase_realtime ADD TABLE item_operacoes;
