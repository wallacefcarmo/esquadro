-- Dados de demonstração (Semana 27) — mesmo cenário do protótipo estático em /prototype
-- Rode depois de 001..009. Não cria usuários (isso é feito no passo "Crie o primeiro usuário admin").

-- Máquinas (Usinagem)
INSERT INTO maquinas (nome, setor_id, status)
SELECT m.nome, s.id, m.status::maquina_status
FROM (VALUES
  ('Torno TR2',            'Usinagem', 'em_operacao'),
  ('Torno Vertical',       'Usinagem', 'em_operacao'),
  ('Torno L300200',        'Usinagem', 'livre'),
  ('Torno convencional',   'Usinagem', 'livre'),
  ('Fresa M1500',          'Usinagem', 'em_operacao'),
  ('Fresa M2000 (01)',     'Usinagem', 'manutencao'),
  ('Fresa M2000 (02)',     'Usinagem', 'em_operacao'),
  ('Fresa convencional',   'Usinagem', 'livre'),
  ('Mandrilhadora Cutmaz', 'Usinagem', 'em_operacao')
) AS m(nome, setor_nome, status)
JOIN setores s ON s.nome = m.setor_nome
ON CONFLICT (nome) DO NOTHING;

UPDATE maquinas SET manutencao_motivo = 'Manutenção preventiva'
WHERE nome = 'Fresa M2000 (01)' AND status = 'manutencao';

-- Ordens de serviço
INSERT INTO ordens_servico (numero, desenho, descricao, status) VALUES
  ('018/26', 'C133-WL101', 'folha 1/4 · 24 itens', 'atencao'),
  ('012/26', 'U551-FL16',  'folha 2/4 · 31 itens', 'atencao'),
  ('011/26', 'PP 1104',    'conjunto PP 1104',     'em_andamento'),
  ('025/26', 'Conjunto 4640', null,                'nao_iniciado')
ON CONFLICT (numero) DO NOTHING;

-- Itens + operações da OS 018/26 (C133-WL101)
WITH os AS (SELECT id FROM ordens_servico WHERE numero = '018/26')
INSERT INTO itens (os_id, codigo, quantidade, material, ordem)
SELECT os.id, i.codigo, i.quantidade, i.material, i.ordem
FROM os, (VALUES
  ('1.1', 4, 'chapa #19',   0),
  ('1.2', 4, 'chapa #19',   1),
  ('1.3', 2, 'chapa #12,5', 2),
  ('2.6', 4, 'chapa #12,5', 3),
  ('2.7', 2, 'chapa #12,5', 4)
) AS i(codigo, quantidade, material, ordem)
ON CONFLICT (os_id, codigo) DO NOTHING;

-- Operações do item 1.2 (Corte ok, Chanfro ok, Solda em execução, Montagem aguardando)
WITH item AS (
  SELECT it.id FROM itens it JOIN ordens_servico os ON os.id = it.os_id
  WHERE os.numero = '018/26' AND it.codigo = '1.2'
)
INSERT INTO item_operacoes (item_id, setor_id, nome, ordem, status, unidade_extra)
SELECT item.id, s.id, o.nome, o.ordem, o.status::operacao_status, o.unidade
FROM item
JOIN (VALUES
  ('Corte',    0, 'concluido',   NULL, 'Preparação'),
  ('Chanfro',  1, 'concluido',   NULL, 'Preparação'),
  ('Solda',    2, 'em_execucao', 'mm', 'Soldagem'),
  ('Montagem', 3, 'aguardando',  NULL, 'Montagem')
) AS o(nome, ordem, status, unidade, setor_nome) ON true
JOIN setores s ON s.nome = o.setor_nome
ON CONFLICT (item_id, ordem) DO NOTHING;

-- Programação semanal — Soldagem, Semana 27
WITH setor AS (SELECT id FROM setores WHERE nome = 'Soldagem')
INSERT INTO programacao_semanal (setor_id, semana, responsavel_nome, dia_semana, os_id, descricao, tipo)
SELECT setor.id, 'Semana 27 · 2026', p.responsavel, p.dia, os.id, p.descricao, 'producao'
FROM setor, (VALUES
  ('João José Januário', 1, '018/26', 'roda · 2.400 mm'),
  ('João José Januário', 2, '012/26', 'item 1.2 · 1.850 mm'),
  ('Antonio Pires',      1, '018/26', 'roda · 2.100 mm'),
  ('Gabriel Santos',     1, '018/26', 'lateral tensionador')
) AS p(responsavel, dia, os_numero, descricao)
JOIN ordens_servico os ON os.numero = p.os_numero;
