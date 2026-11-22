-- ============================================================================
-- supabase/migration_pricing_ingredients.sql
-- Dona Ca Doceria — Permitir embalagens/insumos na precificação
-- Executar no SQL Editor do Supabase
-- ============================================================================

-- 1. Tornar recipe_id opcional em priced_product_components
alter table public.priced_product_components alter column recipe_id drop not null;

-- 2. Adicionar coluna ingredient_id referenciando ingredients
alter table public.priced_product_components
  add column if not exists ingredient_id uuid
    references public.ingredients(id) on delete cascade;

-- 3. Constraint: ao menos um dos dois (receita OU insumo) deve estar preenchido
alter table public.priced_product_components
  drop constraint if exists priced_product_components_recipe_or_ingredient_check;
alter table public.priced_product_components
  add constraint priced_product_components_recipe_or_ingredient_check
  check (recipe_id is not null or ingredient_id is not null);

-- Índice para buscas por ingrediente
create index if not exists idx_priced_product_components_ingredient
  on public.priced_product_components(ingredient_id);

-- ---------------------------------------------------------------------------
-- 4. Recriar policies RLS para priced_products e priced_product_components
--    (USING + WITH CHECK explícitos para autenticados)
-- ---------------------------------------------------------------------------

-- priced_products
do $$ begin
  drop policy if exists "Authenticated read priced_products" on public.priced_products;
  create policy "Authenticated read priced_products"
    on public.priced_products for select
    using (auth.uid() is not null);
exception when others then end $$;

do $$ begin
  drop policy if exists "Authenticated write priced_products" on public.priced_products;
  create policy "Authenticated write priced_products"
    on public.priced_products for all
    using (auth.uid() is not null)
    with check (auth.uid() is not null);
exception when others then end $$;

-- priced_product_components
do $$ begin
  drop policy if exists "Authenticated read priced_product_components" on public.priced_product_components;
  create policy "Authenticated read priced_product_components"
    on public.priced_product_components for select
    using (auth.uid() is not null);
exception when others then end $$;

do $$ begin
  drop policy if exists "Authenticated write priced_product_components" on public.priced_product_components;
  create policy "Authenticated write priced_product_components"
    on public.priced_product_components for all
    using (auth.uid() is not null)
    with check (auth.uid() is not null);
exception when others then end $$;

-- Privilégios
grant all on all tables in schema public to authenticated;
grant all on all tables in schema public to anon;
grant all on all sequences in schema public to authenticated;
grant all on all sequences in schema public to anon;

-- Comentário
comment on column public.priced_product_components.ingredient_id is 'Insumo/embalagem usado na composição do produto (alternativo a recipe_id).';
