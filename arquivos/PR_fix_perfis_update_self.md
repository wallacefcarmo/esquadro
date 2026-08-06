# fix(rls): impede escalação de privilégio em perfis_update_self

## Problema

A política `perfis_update_self`, criada em `002_perfis.sql`, permitia que
qualquer usuário autenticado atualizasse a própria linha em `perfis` sem
nenhuma restrição sobre **quais colunas** podiam mudar:

```sql
CREATE POLICY "perfis_update_self"
  ON perfis FOR UPDATE
  USING (id = auth.uid());
```

Como a política não define `WITH CHECK`, o Postgres reaproveita a condição
do `USING` para validar a linha nova. Na prática, isso significa que um
usuário com `role = 'lider'` podia, via chamada direta ao Supabase (fora da
UI da aplicação), alterar o próprio `role` para `'admin'`, ou trocar
`setor_id` / `ativo` livremente. Uma escalação de privilégio.

## Correção

Nova migration `010_fix_perfis_update_self.sql` recria a política com
`WITH CHECK`, travando `role`, `setor_id` e `ativo` ao valor atual — o
próprio usuário só consegue alterar campos como `primeiro_acesso` (usado na
troca de senha obrigatória no 1º login). A política `perfis_update_admin`
não muda: admin continua podendo alterar role/setor/ativo de qualquer
usuário normalmente.

## Como aplicar

1. Rodar `supabase/migrations/010_fix_perfis_update_self.sql` no SQL Editor
   do Supabase (ou incluir no pipeline de migrations, se houver CI).
2. Confirmar manualmente: logar como um usuário `lider`, tentar via
   `supabase.from('perfis').update({ role: 'admin' }).eq('id', <próprio id>)`
   e confirmar que o update é rejeitado pela RLS.

## Risco

Nenhuma mudança de comportamento pra fluxos legítimos (admin/gestor
continuam com acesso total; o próprio usuário continua conseguindo marcar
`primeiro_acesso = false` após trocar a senha). Só fecha a brecha.
