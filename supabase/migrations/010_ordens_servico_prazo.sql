-- Prazo da OS — usado no Painel (andamento das obras) e no cabeçalho da OS
ALTER TABLE ordens_servico ADD COLUMN IF NOT EXISTS prazo date;
