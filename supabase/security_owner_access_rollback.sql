-- ============================================================================
-- supabase/security_owner_access_rollback.sql
-- Dona Ca Doceria — Reverter as políticas de proprietário
-- Executar no SQL Editor do Supabase
-- ============================================================================
-- Este arquivo restaura as políticas anteriores (qualquer usuário autenticado
-- lê/escreve) e remove a tabela owner_access e a função is_owner().
-- Use somente se precisar desfazer as mudanças de security_owner_access.sql.

-- ---------------------------------------------------------------------------
-- PASSO 0 — Transação única: tudo ou nada
-- ---------------------------------------------------------------------------
begin;

-- ---------------------------------------------------------------------------
-- PASSO 1 — Restaurar policies das tabelas de gestão (qualquer autenticado)
--   Nomes e condições são idênticos aos arquivos originais:
--   schema_gestao.sql e migration_pricing_ingredients.sql.
-- ---------------------------------------------------------------------------
do $$ begin
  drop policy if exists "Authenticated read ingredients" on public.ingredients;
  drop policy if exists "Authenticated write ingredients" on public.ingredients;
  create policy "Authenticated read ingredients" on public.ingredients
    for select using (auth.uid() is not null);
  create policy "Authenticated write ingredients" on public.ingredients
    for all using (auth.uid() is not null) with check (auth.uid() is not null);
end $$;

do $$ begin
  drop policy if exists "Authenticated read invoices" on public.invoices;
  drop policy if exists "Authenticated write invoices" on public.invoices;
  create policy "Authenticated read invoices" on public.invoices
    for select using (auth.uid() is not null);
  create policy "Authenticated write invoices" on public.invoices
    for all using (auth.uid() is not null) with check (auth.uid() is not null);
end $$;

do $$ begin
  drop policy if exists "Authenticated read invoice_items" on public.invoice_items;
  drop policy if exists "Authenticated write invoice_items" on public.invoice_items;
  create policy "Authenticated read invoice_items" on public.invoice_items
    for select using (auth.uid() is not null);
  create policy "Authenticated write invoice_items" on public.invoice_items
    for all using (auth.uid() is not null) with check (auth.uid() is not null);
end $$;

do $$ begin
  drop policy if exists "Authenticated read recipes" on public.recipes;
  drop policy if exists "Authenticated write recipes" on public.recipes;
  create policy "Authenticated read recipes" on public.recipes
    for select using (auth.uid() is not null);
  create policy "Authenticated write recipes" on public.recipes
    for all using (auth.uid() is not null) with check (auth.uid() is not null);
end $$;

do $$ begin
  drop policy if exists "Authenticated read recipe_ingredients" on public.recipe_ingredients;
  drop policy if exists "Authenticated write recipe_ingredients" on public.recipe_ingredients;
  create policy "Authenticated read recipe_ingredients" on public.recipe_ingredients
    for select using (auth.uid() is not null);
  create policy "Authenticated write recipe_ingredients" on public.recipe_ingredients
    for all using (auth.uid() is not null) with check (auth.uid() is not null);
end $$;

do $$ begin
  drop policy if exists "Authenticated read priced_products" on public.priced_products;
  drop policy if exists "Authenticated write priced_products" on public.priced_products;
  create policy "Authenticated read priced_products" on public.priced_products
    for select using (auth.uid() is not null);
  create policy "Authenticated write priced_products" on public.priced_products
    for all using (auth.uid() is not null) with check (auth.uid() is not null);
end $$;

do $$ begin
  drop policy if exists "Authenticated read priced_product_components" on public.priced_product_components;
  drop policy if exists "Authenticated write priced_product_components" on public.priced_product_components;
  create policy "Authenticated read priced_product_components" on public.priced_product_components
    for select using (auth.uid() is not null);
  create policy "Authenticated write priced_product_components" on public.priced_product_components
    for all using (auth.uid() is not null) with check (auth.uid() is not null);
end $$;

do $$ begin
  drop policy if exists "Authenticated read orders" on public.orders;
  drop policy if exists "Authenticated write orders" on public.orders;
  create policy "Authenticated read orders" on public.orders
    for select using (auth.uid() is not null);
  create policy "Authenticated write orders" on public.orders
    for all using (auth.uid() is not null) with check (auth.uid() is not null);
end $$;

do $$ begin
  drop policy if exists "Authenticated read order_items" on public.order_items;
  drop policy if exists "Authenticated write order_items" on public.order_items;
  create policy "Authenticated read order_items" on public.order_items
    for select using (auth.uid() is not null);
  create policy "Authenticated write order_items" on public.order_items
    for all using (auth.uid() is not null) with check (auth.uid() is not null);
end $$;

do $$ begin
  drop policy if exists "Authenticated read stock_movements" on public.stock_movements;
  drop policy if exists "Authenticated write stock_movements" on public.stock_movements;
  create policy "Authenticated read stock_movements" on public.stock_movements
    for select using (auth.uid() is not null);
  create policy "Authenticated write stock_movements" on public.stock_movements
    for all using (auth.uid() is not null) with check (auth.uid() is not null);
end $$;

do $$ begin
  drop policy if exists "Authenticated read financial_transactions" on public.financial_transactions;
  drop policy if exists "Authenticated write financial_transactions" on public.financial_transactions;
  create policy "Authenticated read financial_transactions" on public.financial_transactions
    for select using (auth.uid() is not null);
  create policy "Authenticated write financial_transactions" on public.financial_transactions
    for all using (auth.uid() is not null) with check (auth.uid() is not null);
end $$;

-- ---------------------------------------------------------------------------
-- PASSO 2 — Restaurar policies das tabelas da vitrine (escrita para qualquer
--           autenticado). Leitura pública (Public read ...) não foi tocada no
--           script de aplicar, então não precisa ser recriada aqui.
-- ---------------------------------------------------------------------------
do $$ begin
  drop policy if exists "Owner insert store_settings" on public.store_settings;
  drop policy if exists "Owner update store_settings" on public.store_settings;
  drop policy if exists "Owner delete store_settings" on public.store_settings;
  create policy "Authenticated write store_settings" on public.store_settings
    for all using (auth.uid() is not null) with check (auth.uid() is not null);
end $$;

do $$ begin
  drop policy if exists "Owner insert categories" on public.categories;
  drop policy if exists "Owner update categories" on public.categories;
  drop policy if exists "Owner delete categories" on public.categories;
  create policy "Authenticated write categories" on public.categories
    for all using (auth.uid() is not null) with check (auth.uid() is not null);
end $$;

do $$ begin
  drop policy if exists "Owner insert products" on public.products;
  drop policy if exists "Owner update products" on public.products;
  drop policy if exists "Owner delete products" on public.products;
  create policy "Authenticated write products" on public.products
    for all using (auth.uid() is not null) with check (auth.uid() is not null);
end $$;

do $$ begin
  drop policy if exists "Owner insert product_option_groups" on public.product_option_groups;
  drop policy if exists "Owner update product_option_groups" on public.product_option_groups;
  drop policy if exists "Owner delete product_option_groups" on public.product_option_groups;
  create policy "Authenticated write product_option_groups" on public.product_option_groups
    for all using (auth.uid() is not null) with check (auth.uid() is not null);
end $$;

do $$ begin
  drop policy if exists "Owner insert product_options" on public.product_options;
  drop policy if exists "Owner update product_options" on public.product_options;
  drop policy if exists "Owner delete product_options" on public.product_options;
  create policy "Authenticated write product_options" on public.product_options
    for all using (auth.uid() is not null) with check (auth.uid() is not null);
end $$;

-- ---------------------------------------------------------------------------
-- PASSO 3 — Restaurar Storage product-images (escrita para qualquer autenticado)
-- ---------------------------------------------------------------------------
do $$ begin
  drop policy if exists "Owner insert product-images" on storage.objects;
  create policy "Authenticated insert product-images" on storage.objects
    for insert with check (bucket_id = 'product-images' and auth.uid() is not null);
end $$;

do $$ begin
  drop policy if exists "Owner update product-images" on storage.objects;
  create policy "Authenticated update product-images" on storage.objects
    for update using (bucket_id = 'product-images' and auth.uid() is not null)
    with check (bucket_id = 'product-images' and auth.uid() is not null);
end $$;

do $$ begin
  drop policy if exists "Owner delete product-images" on storage.objects;
  create policy "Authenticated delete product-images" on storage.objects
    for delete using (bucket_id = 'product-images' and auth.uid() is not null);
end $$;

-- ---------------------------------------------------------------------------
-- PASSO 4 — Remover função e tabela de allowlist
-- ---------------------------------------------------------------------------
do $$ begin
  drop function if exists public.is_owner();
end $$;

drop table if exists public.owner_access;

commit;

-- ---------------------------------------------------------------------------
-- Fim do script de rollback.
-- ---------------------------------------------------------------------------
