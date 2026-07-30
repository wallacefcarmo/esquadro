-- Log de alterações (histórico) — captura automática via trigger genérico
CREATE TABLE IF NOT EXISTS historico_alteracoes (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  usuario_id    UUID        REFERENCES perfis(id) ON DELETE SET NULL,
  usuario_nome  TEXT,
  tabela        TEXT        NOT NULL,
  acao          TEXT        NOT NULL, -- INSERT | UPDATE | DELETE
  registro_id   UUID,
  dados_antes   JSONB,
  dados_depois  JSONB
);

CREATE INDEX IF NOT EXISTS idx_historico_created_at ON historico_alteracoes (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_historico_tabela      ON historico_alteracoes (tabela);

ALTER TABLE historico_alteracoes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "historico_select"
  ON historico_alteracoes FOR SELECT
  USING (get_my_role() IN ('admin', 'gestor'));

-- Função genérica de trigger — registra INSERT/UPDATE/DELETE de qualquer tabela
CREATE OR REPLACE FUNCTION registrar_historico()
RETURNS TRIGGER
LANGUAGE plpgsql SECURITY DEFINER
AS $$
DECLARE
  v_nome         TEXT;
  v_dados_antes  JSONB;
  v_dados_depois JSONB;
  v_registro_id  UUID;
BEGIN
  SELECT nome INTO v_nome FROM perfis WHERE id = auth.uid();

  v_dados_antes  := CASE WHEN TG_OP IN ('UPDATE', 'DELETE') THEN to_jsonb(OLD) ELSE NULL END;
  v_dados_depois := CASE WHEN TG_OP IN ('UPDATE', 'INSERT') THEN to_jsonb(NEW) ELSE NULL END;
  v_registro_id  := COALESCE(v_dados_depois ->> 'id', v_dados_antes ->> 'id')::UUID;

  INSERT INTO historico_alteracoes
    (usuario_id, usuario_nome, tabela, acao, registro_id, dados_antes, dados_depois)
  VALUES
    (auth.uid(), v_nome, TG_TABLE_NAME, TG_OP, v_registro_id, v_dados_antes, v_dados_depois);

  RETURN COALESCE(NEW, OLD);
EXCEPTION
  WHEN OTHERS THEN
    -- Nunca deixa o log quebrar a operação original
    RETURN COALESCE(NEW, OLD);
END;
$$;

REVOKE EXECUTE ON FUNCTION registrar_historico() FROM PUBLIC;

DROP TRIGGER IF EXISTS trg_historico_setores          ON setores;
DROP TRIGGER IF EXISTS trg_historico_perfis           ON perfis;
DROP TRIGGER IF EXISTS trg_historico_maquinas         ON maquinas;
DROP TRIGGER IF EXISTS trg_historico_os               ON ordens_servico;
DROP TRIGGER IF EXISTS trg_historico_itens            ON itens;
DROP TRIGGER IF EXISTS trg_historico_item_operacoes   ON item_operacoes;
DROP TRIGGER IF EXISTS trg_historico_programacao      ON programacao_semanal;

CREATE TRIGGER trg_historico_setores
  AFTER INSERT OR UPDATE OR DELETE ON setores
  FOR EACH ROW EXECUTE FUNCTION registrar_historico();

CREATE TRIGGER trg_historico_perfis
  AFTER INSERT OR UPDATE OR DELETE ON perfis
  FOR EACH ROW EXECUTE FUNCTION registrar_historico();

CREATE TRIGGER trg_historico_maquinas
  AFTER INSERT OR UPDATE OR DELETE ON maquinas
  FOR EACH ROW EXECUTE FUNCTION registrar_historico();

CREATE TRIGGER trg_historico_os
  AFTER INSERT OR UPDATE OR DELETE ON ordens_servico
  FOR EACH ROW EXECUTE FUNCTION registrar_historico();

CREATE TRIGGER trg_historico_itens
  AFTER INSERT OR UPDATE OR DELETE ON itens
  FOR EACH ROW EXECUTE FUNCTION registrar_historico();

CREATE TRIGGER trg_historico_item_operacoes
  AFTER INSERT OR UPDATE OR DELETE ON item_operacoes
  FOR EACH ROW EXECUTE FUNCTION registrar_historico();

CREATE TRIGGER trg_historico_programacao
  AFTER INSERT OR UPDATE OR DELETE ON programacao_semanal
  FOR EACH ROW EXECUTE FUNCTION registrar_historico();
