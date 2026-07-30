# Esquadro — PCP

Sistema de gestão de produção da BNG Metalmecânica — PCP, apontamento de chão
de fábrica e acompanhamento de OS por item/operação, cobrindo os quatro
setores (Preparação, Soldagem, Montagem, Usinagem).

Stack: **Next.js 14** (Vercel) + **Supabase** (Postgres + Auth + Realtime).
Sem IA, sem outros serviços — mesma stack e mesma estrutura do projeto Farol.

O protótipo estático original (HTML/CSS/JS sem backend, usado pra validar
telas com dados de demonstração da Semana 27) fica preservado em
[`/prototype`](./prototype) como referência visual.

---

## Visão rápida das telas

| Rota | Quem usa | O que faz |
|------|----------|-----------|
| `/` | Autenticado | Capa com atalho para Painel e Apontamento |
| `/login` | — | Login (Supabase Auth) |
| `/trocar-senha` | Primeiro acesso | Troca de senha obrigatória no 1º login |
| `/apontamento` | Líder (celular) | Seleciona setor, inicia/encerra/pausa operações de cada item |
| `/painel` | Todos os perfis | KPIs, progresso por setor e feed de apontamentos, ao vivo (Realtime) |
| `/os` | Todos os perfis | Ordens de serviço → itens → sequência de operações (Corte, Chanfro, Solda, Montagem…) |
| `/maquinas` | Todos os perfis | Status das máquinas (livre / em operação / manutenção) |
| `/programacao` | Todos os perfis | Grade semanal por setor (segunda a sexta), publicação |
| `/cadastros` | Admin/Gestor | Máquinas, OS + itens, usuários |
| `/historico` | Admin/Gestor | Log de alterações (criação/edição/exclusão) |

Todas as rotas exigem login (`middleware.ts`), exceto `/login` e `/trocar-senha`.

---

## Passo a passo (faça nesta ordem)

### 1. Supabase — banco e chaves

1. Crie um projeto em https://supabase.com (free tier basta — atenção:
   projetos free pausam por inatividade, é só reativar em **Project → Restore**).
2. Abra **SQL Editor → New query** e rode os arquivos de `supabase/migrations/`
   **em ordem numérica** (001 → 009). Cada um é incremental; não pule nenhum:
   - `001_setores.sql` — tabela `setores` + seed dos 4 setores fixos
   - `002_perfis.sql` — tabela `perfis` vinculada ao `auth.users` + RLS
   - `003_maquinas.sql` — tabela `maquinas`
   - `004_ordens_servico.sql` — tabela `ordens_servico`
   - `005_itens_operacoes.sql` — tabelas `itens` e `item_operacoes`
   - `006_apontamentos.sql` — log de apontamentos + Realtime
   - `007_programacao_semanal.sql` — grade semanal por setor
   - `008_historico_alteracoes.sql` — tabela `historico_alteracoes` + trigger
     genérico que loga INSERT/UPDATE/DELETE das tabelas de cadastro
   - `009_criar_usuario_funcao.sql` — função para criar/ativar usuário sem
     `service_role` no client
   - Depois rode `supabase/seed.sql` se quiser os dados de demonstração da
     Semana 27 (mesmo cenário do protótipo em `/prototype`).
3. Crie o primeiro usuário **admin** manualmente (Auth → Add user, depois
   insira a linha correspondente em `perfis` com `role = 'admin'`) — os
   demais usuários podem ser criados por ele em `/cadastros`.
4. Pegue as chaves em **Project Settings → API**:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **Chave pública** (`sb_publishable_…` ou "anon public") → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **secret / service_role** (⚠️ nunca no client) → `SUPABASE_SERVICE_ROLE_KEY`

> **Realtime:** a migration 006 já adiciona `apontamentos` e `item_operacoes`
> à publicação `supabase_realtime`. Se o painel não atualizar sozinho,
> confira em **Database → Publications**.

> **RLS:** todas as tabelas já sobem com RLS ativo e políticas por role
> (admin/gestor/lider) — não é algo a fazer depois, já vem pronto nas migrations.

### 2. Variáveis de ambiente

```bash
cp .env.local.example .env.local
```

| Variável | Onde usa |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | client + server |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | client + server |
| `SUPABASE_SERVICE_ROLE_KEY` | `lib/supabase/admin.ts` |

### 3. Rodar localmente

```bash
npm install
npm run dev                           # abre em http://localhost:3000
```

Teste: faça login como admin, cadastre uma OS com itens em `/cadastros`, abra
`/apontamento` numa aba e `/painel` em outra — ao iniciar/encerrar uma
operação, o painel muda na hora.

### 4. GitHub — versionar

```bash
git add .
git commit -m "Esquadro — sistema real"
git push origin main
```

### 5. Vercel — publicar

1. Em https://vercel.com → **Add New → Project** → importe o repositório `esquadro`.
2. Em **Environment Variables**, adicione as mesmas variáveis do passo 2.
3. **Deploy**. A Vercel detecta Next.js sozinha — sem configuração extra.

---

## Estrutura

```
esquadro/
├── app/
│   ├── page.tsx                 capa
│   ├── login/                   login
│   ├── trocar-senha/            troca de senha (1º acesso)
│   ├── apontamento/             formulário mobile do líder (por setor)
│   ├── painel/                  dashboard + realtime
│   ├── os/                      OS → itens → sequência de operações
│   ├── maquinas/                status das máquinas
│   ├── programacao/             grade semanal por setor
│   ├── cadastros/                CRUD de máquinas, OS/itens e usuários
│   ├── historico/                log de alterações
│   ├── actions/                  server actions (apontamentos.ts, cadastros.ts, usuarios.ts)
├── components/
│   ├── app-header.tsx            header padrão (logo → home, hamburger, ações)
│   ├── nav-menu.tsx              drawer de navegação por role
│   ├── operacao-card.tsx         card de apontamento (iniciar/encerrar/parada/retomar)
│   ├── status-badge.tsx          badges de status (operação, máquina, OS)
│   └── realtime-refresher.tsx    assina mudanças e atualiza a página
├── lib/
│   ├── types.ts
│   └── supabase/                 client.ts, server.ts, admin.ts
├── hooks/use-auth.ts             perfil + role do usuário logado
├── middleware.ts                 exige login em todas as rotas, exceto públicas
├── supabase/
│   ├── migrations/001…009        schema incremental, ver seção acima
│   └── seed.sql                  dados de demonstração (Semana 27)
└── prototype/                    protótipo estático original (referência visual)
```

---

## Fluxo de produção

Cada **item** de uma OS percorre uma sequência de **operações** (ex.: Corte →
Chanfro → Solda → Montagem, ou Corte CNC → Chanfro → Solda → Montagem — a
sequência é livre por item, cadastrada em `/cadastros → OS e itens`). O líder
aponta pelo celular em `/apontamento`: inicia, encerra (com quantidade e
medida extra, ex. mm de solda) ou pausa (com motivo). O `/painel` e o `/os`
refletem isso ao vivo via Realtime.

---

## Histórico de alterações

`/historico` (admin/gestor) lista tudo que muda em `setores`, `perfis`,
`maquinas`, `ordens_servico`, `itens`, `item_operacoes` e `programacao_semanal`
— criação, edição e exclusão —, com quem fez e quando. A captura é automática:
um trigger genérico (`registrar_historico`, `SECURITY DEFINER`) grava em
`historico_alteracoes` independente de a mudança ter vindo de uma server
action ou de uma chamada direta do client.

---

## Status

Sistema real em construção a partir do protótipo estático. Schema e RLS já
cobrem o fluxo principal (PCP, apontamento, OS por item/operação, programação
semanal, cadastros e histórico); telas podem evoluir conforme uso real no
chão de fábrica.
