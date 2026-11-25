-- ============================================================================
-- supabase/security_owner_access_check.sql
-- Dona Ca Doceria — Verificação de policies de RLS após aplicação
-- Executar no SQL Editor do Supabase
-- ============================================================================
-- Este arquivo APENAS lê informações; não altera nada no banco.
-- AVISO: o SQL Editor do Supabase exibe apenas o resultado da ÚLTIMA consulta.
-- Rode cada bloco (separado por '--') uma de cada vez.

-- ---------------------------------------------------------------------------
-- 1. Listar TODAS as policies de todas as tabelas públicas (schema public)
-- Resultado esperado: ver todas as policies e conferir se não sobrou nenhuma
-- com auth.uid() is not null nas tabelas de gestão.
-- ---------------------------------------------------------------------------
select
  schemaname,
  tablename,
  policyname,
  permissive as permissivo,
  roles,
  cmd as comando,
  qual as condicao_uso,
  with_check as condicao_insercao
from pg_policies
where schemaname = 'public'
order by tablename, policyname;

-- ---------------------------------------------------------------------------
-- 2. Listar policies do storage.objects (bucket product-images)
-- Resultado esperado: só deve haver 'Owner insert product-images',
-- 'Owner update product-images' e 'Owner delete product-images',
-- todas com to authenticated e com public.is_owner() na condição.
-- ---------------------------------------------------------------------------
select
  policyname,
  roles,
  cmd as comando,
  qual as condicao_uso,
  with_check as condicao_insercao
from pg_policies
where schemaname = 'storage'
  and tablename = 'objects'
order by policyname;

-- ---------------------------------------------------------------------------
-- 3. Verificar se NENHUMA tabela de gestão tem policy cuja condição (qual ou
--    with_check) NÃO contenha is_owner.
-- Resultado esperado: ZERO linhas. Se retornar algo, alguma tabela de gestão
-- ainda permite acesso sem ser pelo dono.
-- Comparação sem diferenciar maiúsculas/minúsculas.
-- ---------------------------------------------------------------------------
select
  schemaname,
  tablename,
  policyname,
  cmd,
  qual,
  with_check
from pg_policies
where schemaname = 'public'
  and tablename in (
    'ingredients', 'invoices', 'invoice_items', 'recipes',
    'recipe_ingredients', 'priced_products', 'priced_product_components',
    'orders', 'order_items', 'stock_movements', 'financial_transactions'
  )
  and (
    (qual is not null and lower(qual) not like '%is_owner%')
    or (with_check is not null and lower(with_check) not like '%is_owner%')
  )
order by tablename, policyname;

-- ---------------------------------------------------------------------------
-- 4. Verificar se NENHUMA tabela da vitrine tem policy de escrita aberta
--    (escrita deve ser apenas para donos, via is_owner())
-- Resultado esperado: ZERO linhas. Se retornar algo, alguma tabela da vitrine
-- ainda permite escrita sem ser pelo dono.
-- Para políticas de INSERT, qual é nulo, então olhamos com_check.
-- ---------------------------------------------------------------------------
select
  schemaname,
  tablename,
  policyname,
  cmd,
  qual,
  with_check
from pg_policies
where schemaname = 'public'
  and tablename in (
    'store_settings', 'categories', 'products',
    'product_option_groups', 'product_options'
  )
  and cmd in ('INSERT', 'UPDATE', 'DELETE', 'ALL')
  and (
    (qual is not null and lower(qual) not like '%is_owner%')
    or (with_check is not null and lower(with_check) not like '%is_owner%')
  )
order by tablename, policyname;

-- ---------------------------------------------------------------------------
-- 5. Verificar se a tabela owner_access existe e tem o dono inserido
-- Resultado esperado: pelo menos uma linha com o UUID do dono.
-- ---------------------------------------------------------------------------
select
  id,
  user_id,
  email,
  role,
  created_at
from public.owner_access
order by created_at;

-- ---------------------------------------------------------------------------
-- 6. Verificar se a função is_owner() existe e tem execute para authenticated
-- Resultado esperado: uma linha com nome_funcao = 'is_owner',
-- prosecdef = true (security definer), volatilidade = s (stable).
-- ---------------------------------------------------------------------------
select
  p.proname as nome_funcao,
  p.prosecdef as security_definer,
  p.provolatile as volatilidade,
  n.nspname as esquema
from pg_proc p
join pg_namespace n on n.oid = p.pronamespace
where n.nspname = 'public'
  and p.proname = 'is_owner';

-- ---------------------------------------------------------------------------
-- 7. Resumo geral: contar policies por tabela
-- Resultado esperado: cada tabela de gestão deve ter apenas 1 policy
-- ('Owner only ...'), e cada tabela da vitrine deve ter policies públicas de
-- leitura + 3 policies de escrita (insert/update/delete) com Owner.
-- ---------------------------------------------------------------------------
select
  tablename,
  count(*) as total_policies,
  string_agg(policyname, '; ' order by policyname) as nomes_policies
from pg_policies
where schemaname = 'public'
group by tablename
order by tablename;
