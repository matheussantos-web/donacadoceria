-- ============================================================================
-- supabase/security_owner_access.sql
-- Dona Ca Doceria — Restringir gestão apenas ao(s) dono(s) da loja
-- Executar no SQL Editor do Supabase
-- ============================================================================

-- ATENÇÃO: substitua '<SEU-UUID-AQUI>' pelo ID do usuário autenticado no Supabase Auth
-- e '<SEU-EMAIL-AQUI>' pelo e-mail correspondente antes de executar.
-- Se o UUID ficar inalterado, o INSERT abaixo falhará propositalmente (UUID inválido)
-- e o script não prosseguirá (não haverá tabelas nem policies alteradas).

-- ---------------------------------------------------------------------------
-- PASSO 0 — Transação única: tudo ou nada
-- ---------------------------------------------------------------------------
begin;

-- ---------------------------------------------------------------------------
-- PASSO 1 — Tabela de allowlist de donos (sem acesso público)
-- ---------------------------------------------------------------------------
create table public.owner_access (
  id        uuid primary key default gen_random_uuid(),
  user_id   uuid not null unique references auth.users(id) on delete cascade,
  email     text not null,
  role      text not null default 'owner' check (role in ('owner')),
  created_at timestamptz not null default now()
);

alter table public.owner_access enable row level security;

-- Donos veem apenas a própria linha (útil para auditoria)
create policy "Owner read own row" on public.owner_access
  for select using (auth.uid() = user_id);

-- Inserção do dono: substitua '<SEU-UUID-AQUI>' e '<SEU-EMAIL-AQUI>' abaixo.
-- Se o UUID for inválido, o insert falha e o script para (não prossegue sem dono).
insert into public.owner_access (user_id, email)
values ('<SEU-UUID-AQUI>', '<SEU-EMAIL-AQUI>');

-- ---------------------------------------------------------------------------
-- PASSO 2 — Função auxiliar "é dono?" (security definer, stable)
-- ---------------------------------------------------------------------------
create or replace function public.is_owner()
returns boolean
language plpgsql
security definer
set search_path = public
stable
as $$
declare
  v_count integer;
begin
  select count(*)
    into v_count
    from public.owner_access
   where user_id = auth.uid();
  return v_count > 0;
end;
$$;

revoke all on function public.is_owner() from public;
grant execute on function public.is_owner() to authenticated;

-- ---------------------------------------------------------------------------
-- PASSO 3 — Tabelas de gestão: policy única FOR ALL, só para donos (authenticated)
-- ---------------------------------------------------------------------------
do $$ begin
  drop policy if exists "Authenticated read ingredients" on public.ingredients;
  drop policy if exists "Authenticated write ingredients" on public.ingredients;
  create policy "Owner only ingredients" on public.ingredients
    for all to authenticated
    using (public.is_owner()) with check (public.is_owner());
end $$;

do $$ begin
  drop policy if exists "Authenticated read invoices" on public.invoices;
  drop policy if exists "Authenticated write invoices" on public.invoices;
  create policy "Owner only invoices" on public.invoices
    for all to authenticated
    using (public.is_owner()) with check (public.is_owner());
end $$;

do $$ begin
  drop policy if exists "Authenticated read invoice_items" on public.invoice_items;
  drop policy if exists "Authenticated write invoice_items" on public.invoice_items;
  create policy "Owner only invoice_items" on public.invoice_items
    for all to authenticated
    using (public.is_owner()) with check (public.is_owner());
end $$;

do $$ begin
  drop policy if exists "Authenticated read recipes" on public.recipes;
  drop policy if exists "Authenticated write recipes" on public.recipes;
  create policy "Owner only recipes" on public.recipes
    for all to authenticated
    using (public.is_owner()) with check (public.is_owner());
end $$;

do $$ begin
  drop policy if exists "Authenticated read recipe_ingredients" on public.recipe_ingredients;
  drop policy if exists "Authenticated write recipe_ingredients" on public.recipe_ingredients;
  create policy "Owner only recipe_ingredients" on public.recipe_ingredients
    for all to authenticated
    using (public.is_owner()) with check (public.is_owner());
end $$;

do $$ begin
  drop policy if exists "Authenticated read priced_products" on public.priced_products;
  drop policy if exists "Authenticated write priced_products" on public.priced_products;
  create policy "Owner only priced_products" on public.priced_products
    for all to authenticated
    using (public.is_owner()) with check (public.is_owner());
end $$;

do $$ begin
  drop policy if exists "Authenticated read priced_product_components" on public.priced_product_components;
  drop policy if exists "Authenticated write priced_product_components" on public.priced_product_components;
  create policy "Owner only priced_product_components" on public.priced_product_components
    for all to authenticated
    using (public.is_owner()) with check (public.is_owner());
end $$;

do $$ begin
  drop policy if exists "Authenticated read orders" on public.orders;
  drop policy if exists "Authenticated write orders" on public.orders;
  create policy "Owner only orders" on public.orders
    for all to authenticated
    using (public.is_owner()) with check (public.is_owner());
end $$;

do $$ begin
  drop policy if exists "Authenticated read order_items" on public.order_items;
  drop policy if exists "Authenticated write order_items" on public.order_items;
  create policy "Owner only order_items" on public.order_items
    for all to authenticated
    using (public.is_owner()) with check (public.is_owner());
end $$;

do $$ begin
  drop policy if exists "Authenticated read stock_movements" on public.stock_movements;
  drop policy if exists "Authenticated write stock_movements" on public.stock_movements;
  create policy "Owner only stock_movements" on public.stock_movements
    for all to authenticated
    using (public.is_owner()) with check (public.is_owner());
end $$;

do $$ begin
  drop policy if exists "Authenticated read financial_transactions" on public.financial_transactions;
  drop policy if exists "Authenticated write financial_transactions" on public.financial_transactions;
  create policy "Owner only financial_transactions" on public.financial_transactions
    for all to authenticated
    using (public.is_owner()) with check (public.is_owner());
end $$;

-- ---------------------------------------------------------------------------
-- PASSO 4 — Tabelas da vitrine: leitura pública mantida, escrita só para donos
-- (Policies separadas para INSERT, UPDATE e DELETE — nunca FOR ALL)
-- ---------------------------------------------------------------------------

-- store_settings: escrita só para donos
do $$ begin
  drop policy if exists "Authenticated write store_settings" on public.store_settings;
  create policy "Owner insert store_settings" on public.store_settings
    for insert to authenticated
    with check (public.is_owner());
  create policy "Owner update store_settings" on public.store_settings
    for update to authenticated
    using (public.is_owner()) with check (public.is_owner());
  create policy "Owner delete store_settings" on public.store_settings
    for delete to authenticated
    using (public.is_owner());
end $$;

-- categories: escrita só para donos
do $$ begin
  drop policy if exists "Authenticated write categories" on public.categories;
  create policy "Owner insert categories" on public.categories
    for insert to authenticated
    with check (public.is_owner());
  create policy "Owner update categories" on public.categories
    for update to authenticated
    using (public.is_owner()) with check (public.is_owner());
  create policy "Owner delete categories" on public.categories
    for delete to authenticated
    using (public.is_owner());
end $$;

-- products: escrita só para donos
do $$ begin
  drop policy if exists "Authenticated write products" on public.products;
  create policy "Owner insert products" on public.products
    for insert to authenticated
    with check (public.is_owner());
  create policy "Owner update products" on public.products
    for update to authenticated
    using (public.is_owner()) with check (public.is_owner());
  create policy "Owner delete products" on public.products
    for delete to authenticated
    using (public.is_owner());
end $$;

-- product_option_groups: escrita só para donos
do $$ begin
  drop policy if exists "Authenticated write product_option_groups" on public.product_option_groups;
  create policy "Owner insert product_option_groups" on public.product_option_groups
    for insert to authenticated
    with check (public.is_owner());
  create policy "Owner update product_option_groups" on public.product_option_groups
    for update to authenticated
    using (public.is_owner()) with check (public.is_owner());
  create policy "Owner delete product_option_groups" on public.product_option_groups
    for delete to authenticated
    using (public.is_owner());
end $$;

-- product_options: escrita só para donos
do $$ begin
  drop policy if exists "Authenticated write product_options" on public.product_options;
  create policy "Owner insert product_options" on public.product_options
    for insert to authenticated
    with check (public.is_owner());
  create policy "Owner update product_options" on public.product_options
    for update to authenticated
    using (public.is_owner()) with check (public.is_owner());
  create policy "Owner delete product_options" on public.product_options
    for delete to authenticated
    using (public.is_owner());
end $$;

-- ---------------------------------------------------------------------------
-- PASSO 5 — Storage product-images: leitura pública, escrita só para donos
-- ---------------------------------------------------------------------------
do $$ begin
  drop policy if exists "Authenticated insert product-images" on storage.objects;
  create policy "Owner insert product-images" on storage.objects
    for insert to authenticated
    with check (bucket_id = 'product-images' and public.is_owner());
end $$;

do $$ begin
  drop policy if exists "Authenticated update product-images" on storage.objects;
  create policy "Owner update product-images" on storage.objects
    for update to authenticated
    using (bucket_id = 'product-images' and public.is_owner())
    with check (bucket_id = 'product-images' and public.is_owner());
end $$;

do $$ begin
  drop policy if exists "Authenticated delete product-images" on storage.objects;
  create policy "Owner delete product-images" on storage.objects
    for delete to authenticated
    using (bucket_id = 'product-images' and public.is_owner());
end $$;

commit;

-- ---------------------------------------------------------------------------
-- COMO INSERIR O UUID DO DONO (já feito no PASSO 1 acima)
-- ---------------------------------------------------------------------------
-- Substitua '<SEU-UUID-AQUI>' e '<SEU-EMAIL-AQUI>' no início deste arquivo
-- antes de executar. Se deixar inalterado, o INSERT falha por UUID inválido
-- e o script não prossegue (não há tabelas nem policies alteradas).
