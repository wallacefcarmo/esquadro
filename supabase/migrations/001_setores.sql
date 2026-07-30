-- Setores fixos do chão de fábrica (Preparação, Soldagem, Montagem, Usinagem)
CREATE TABLE IF NOT EXISTS setores (
  id         uuid    DEFAULT gen_random_uuid() PRIMARY KEY,
  nome       text    NOT NULL UNIQUE,
  ordem      int     NOT NULL DEFAULT 0,
  ativo      boolean NOT NULL DEFAULT true,
  created_at timestamptz DEFAULT now()
);

INSERT INTO setores (nome, ordem) VALUES
  ('Preparação', 1),
  ('Soldagem',   2),
  ('Montagem',   3),
  ('Usinagem',   4)
ON CONFLICT (nome) DO NOTHING;
