-- Itens de uma OS (ex: item "1.1", "2.6") e a sequência de operações de cada um
-- (Corte → Chanfro → Solda → Montagem, ou Corte CNC → Chanfro → Solda → Montagem)
CREATE TABLE IF NOT EXISTS itens (
  id             uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  os_id          uuid        NOT NULL REFERENCES ordens_servico(id) ON DELETE CASCADE,
  codigo         text        NOT NULL,
  quantidade     numeric(10,2) NOT NULL DEFAULT 1,
  material       text,
  responsavel_id uuid        REFERENCES perfis(id) ON DELETE SET NULL,
  ordem          int         NOT NULL DEFAULT 0,
  created_at     timestamptz DEFAULT now(),
  UNIQUE (os_id, codigo)
);

CREATE TYPE operacao_status AS ENUM ('aguardando', 'em_execucao', 'parado', 'concluido');

CREATE TABLE IF NOT EXISTS item_operacoes (
  id                  uuid              DEFAULT gen_random_uuid() PRIMARY KEY,
  item_id             uuid              NOT NULL REFERENCES itens(id) ON DELETE CASCADE,
  setor_id            uuid              REFERENCES setores(id) ON DELETE SET NULL,
  nome                text              NOT NULL,
  ordem               int               NOT NULL DEFAULT 0,
  status              operacao_status   NOT NULL DEFAULT 'aguardando',
  responsavel_id      uuid              REFERENCES perfis(id) ON DELETE SET NULL,
  maquina_id          uuid              REFERENCES maquinas(id) ON DELETE SET NULL,
  quantidade_concluida numeric(10,2)    NOT NULL DEFAULT 0,
  medida_extra        numeric(10,2),
  unidade_extra       text,
  iniciado_em         timestamptz,
  concluido_em        timestamptz,
  created_at          timestamptz       DEFAULT now(),
  UNIQUE (item_id, ordem)
);

ALTER TABLE itens ENABLE ROW LEVEL SECURITY;
ALTER TABLE item_operacoes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "itens_select"
  ON itens FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "itens_insert"
  ON itens FOR INSERT
  WITH CHECK (get_my_role() IN ('admin', 'gestor'));

CREATE POLICY "itens_update"
  ON itens FOR UPDATE
  USING (get_my_role() IN ('admin', 'gestor'));

CREATE POLICY "itens_delete"
  ON itens FOR DELETE
  USING (get_my_role() IN ('admin', 'gestor'));

CREATE POLICY "item_operacoes_select"
  ON item_operacoes FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "item_operacoes_insert"
  ON item_operacoes FOR INSERT
  WITH CHECK (get_my_role() IN ('admin', 'gestor'));

-- Líder aponta (inicia/encerra/atualiza quantidade) apenas nas operações do próprio setor
CREATE POLICY "item_operacoes_update"
  ON item_operacoes FOR UPDATE
  USING (get_my_role() IN ('admin', 'gestor') OR get_my_setor_id() = setor_id);

CREATE POLICY "item_operacoes_delete"
  ON item_operacoes FOR DELETE
  USING (get_my_role() IN ('admin', 'gestor'));
