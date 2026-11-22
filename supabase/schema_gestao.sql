-- ============================================================================
-- supabase/schema_gestao.sql
-- Dona Cá Doceria — Painel de Gestão, Estoque via NFC-e, Fichas Técnicas e Precificação
-- Schema idempotente para execução no SQL Editor do Supabase
-- ============================================================================

-- Habilita extensões necessárias
create extension if not exists "pgcrypto";
create extension if not exists "uuid-ossp";

-- ---------------------------------------------------------------------------
-- ingredients — Insumos (matéria-prima para fichas técnicas)
-- ---------------------------------------------------------------------------
create table if not exists public.ingredients (
  id                uuid primary key default gen_random_uuid(),
  name              text not null,
  brand             text default '',
  category          text not null default 'Outros'
                    check (category in ('Laticínios', 'Chocolates', 'Farinhas/Secos', 'Frutas', 'Embalagens', 'Outros')),
  purchase_unit     text not null default 'cx'
                    check (purchase_unit in ('un', 'kg', 'l', 'cx')),
  package_size      numeric not null default 1
                    check (package_size > 0),
  base_unit         text not null default 'g'
                    check (base_unit in ('g', 'ml', 'un')),
  last_unit_cost    numeric not null default 0,
  cost_per_base_unit numeric generated always as (
    case when package_size > 0 then last_unit_cost / package_size else 0 end
  ) stored,
  stock_quantity    numeric not null default 0,
  min_stock_alert   numeric not null default 0,
  updated_at        timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- invoices — Notas Fiscais Importadas (NFC-e)
-- ---------------------------------------------------------------------------
create table if not exists public.invoices (
  id            uuid primary key default gen_random_uuid(),
  access_key    text unique not null
                check (length(access_key) = 44),
  store_name    text default '',
  issue_date    timestamptz not null default now(),
  total_amount  numeric not null default 0,
  raw_url       text default '',
  created_at    timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- invoice_items — Itens da Nota Fiscal
-- ---------------------------------------------------------------------------
create table if not exists public.invoice_items (
  id            uuid primary key default gen_random_uuid(),
  invoice_id    uuid not null references public.invoices(id) on delete cascade,
  ingredient_id uuid references public.ingredients(id) on delete set null,
  raw_description text not null,
  quantity      numeric not null default 0,
  unit_price    numeric not null default 0,
  total_price   numeric not null default 0
);

-- ---------------------------------------------------------------------------
-- recipes — Receitas / Preparos Base
-- ---------------------------------------------------------------------------
create table if not exists public.recipes (
  id                uuid primary key default gen_random_uuid(),
  name              text not null,
  category          text not null default 'Massas'
                    check (category in ('Massas', 'Recheios', 'Coberturas', 'Doces', 'Sobremesas', 'Embalagens')),
  yield_quantity    numeric not null default 1
                    check (yield_quantity > 0),
  yield_unit        text not null default 'g'
                    check (yield_unit in ('g', 'un', 'fatias')),
  overhead_percent  numeric not null default 15,
  labor_cost        numeric not null default 0,
  total_cost        numeric not null default 0,
  unit_cost         numeric generated always as (
    case when yield_quantity > 0 then (total_cost / yield_quantity) else 0 end
  ) stored,
  notes             text default '',
  updated_at        timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- recipe_ingredients — Ingredientes utilizados em cada receita
-- ---------------------------------------------------------------------------
create table if not exists public.recipe_ingredients (
  id            uuid primary key default gen_random_uuid(),
  recipe_id     uuid not null references public.recipes(id) on delete cascade,
  ingredient_id uuid not null references public.ingredients(id) on delete cascade,
  quantity_used numeric not null default 0
);

-- ---------------------------------------------------------------------------
-- priced_products — Produtos Finais (Bolos por Fatias, Doces, Kits)
-- ---------------------------------------------------------------------------
create table if not exists public.priced_products (
  id                   uuid primary key default gen_random_uuid(),
  name                 text not null,
  product_type         text not null default 'bolo_fatias'
                       check (product_type in ('bolo_fatias', 'doce_unidade', 'kit_festa')),
  yield_slices         integer check (yield_slices > 0),
  total_production_cost numeric not null default 0,
  target_margin_percent numeric not null default 30,
  suggested_price      numeric generated always as (
    case when target_margin_percent < 100
         then total_production_cost / (1 - target_margin_percent / 100)
         else 0 end
  ) stored,
  final_price          numeric not null default 0,
  published_to_catalog boolean not null default false,
  updated_at           timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- priced_product_components — Receitas/Itens que compõem o produto final
-- ---------------------------------------------------------------------------
create table if not exists public.priced_product_components (
  id                  uuid primary key default gen_random_uuid(),
  priced_product_id   uuid not null references public.priced_products(id) on delete cascade,
  recipe_id           uuid references public.recipes(id) on delete cascade,
  multiplier_or_qty   numeric not null default 1
);

-- ---------------------------------------------------------------------------
-- Índices úteis
-- ---------------------------------------------------------------------------
create index if not exists idx_ingredients_category on public.ingredients(category);
create index if not exists idx_ingredients_stock_alert on public.ingredients(stock_quantity, min_stock_alert);
create index if not exists idx_invoices_access_key on public.invoices(access_key);
create index if not exists idx_invoice_items_invoice on public.invoice_items(invoice_id);
create index if not exists idx_recipe_ingredients_recipe on public.recipe_ingredients(recipe_id);
create index if not exists idx_priced_product_components_product on public.priced_product_components(priced_product_id);
create index if not exists idx_priced_products_published on public.priced_products(published_to_catalog);

-- ---------------------------------------------------------------------------
-- Updated_at triggers
-- ---------------------------------------------------------------------------
create or replace function public.update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists update_ingredients_updated_at on public.ingredients;
create trigger update_ingredients_updated_at
  before update on public.ingredients
  for each row
  execute function public.update_updated_at_column();

drop trigger if exists update_invoices_updated_at on public.invoices;
create trigger update_invoices_updated_at
  before update on public.invoices
  for each row
  execute function public.update_updated_at_column();

drop trigger if exists update_recipes_updated_at on public.recipes;
create trigger update_recipes_updated_at
  before update on public.recipes
  for each row
  execute function public.update_updated_at_column();

drop trigger if exists update_priced_products_updated_at on public.priced_products;
create trigger update_priced_products_updated_at
  before update on public.priced_products
  for each row
  execute function public.update_updated_at_column();

-- ---------------------------------------------------------------------------
-- Row Level Security (RLS)
-- ---------------------------------------------------------------------------
alter table public.ingredients       enable row level security;
alter table public.invoices          enable row level security;
alter table public.invoice_items     enable row level security;
alter table public.recipes           enable row level security;
alter table public.recipe_ingredients enable row level security;
alter table public.priced_products   enable row level security;
alter table public.priced_product_components enable row level security;

-- Leitura para autenticados
do $$ begin
  drop policy if exists "Authenticated read ingredients" on public.ingredients;
  create policy "Authenticated read ingredients" on public.ingredients for select using (auth.uid() is not null);
exception when others then end $$;

do $$ begin
  drop policy if exists "Authenticated write ingredients" on public.ingredients;
  create policy "Authenticated write ingredients" on public.ingredients for all using (auth.uid() is not null);
exception when others then end $$;

do $$ begin
  drop policy if exists "Authenticated read invoices" on public.invoices;
  create policy "Authenticated read invoices" on public.invoices for select using (auth.uid() is not null);
exception when others then end $$;

do $$ begin
  drop policy if exists "Authenticated write invoices" on public.invoices;
  create policy "Authenticated write invoices" on public.invoices for all using (auth.uid() is not null);
exception when others then end $$;

do $$ begin
  drop policy if exists "Authenticated read invoice_items" on public.invoice_items;
  create policy "Authenticated read invoice_items" on public.invoice_items for select using (auth.uid() is not null);
exception when others then end $$;

do $$ begin
  drop policy if exists "Authenticated write invoice_items" on public.invoice_items;
  create policy "Authenticated write invoice_items" on public.invoice_items for all using (auth.uid() is not null);
exception when others then end $$;

do $$ begin
  drop policy if exists "Authenticated read recipes" on public.recipes;
  create policy "Authenticated read recipes" on public.recipes for select using (auth.uid() is not null);
exception when others then end $$;

do $$ begin
  drop policy if exists "Authenticated write recipes" on public.recipes;
  create policy "Authenticated write recipes" on public.recipes for all using (auth.uid() is not null);
exception when others then end $$;

do $$ begin
  drop policy if exists "Authenticated read recipe_ingredients" on public.recipe_ingredients;
  create policy "Authenticated read recipe_ingredients" on public.recipe_ingredients for select using (auth.uid() is not null);
exception when others then end $$;

do $$ begin
  drop policy if exists "Authenticated write recipe_ingredients" on public.recipe_ingredients;
  create policy "Authenticated write recipe_ingredients" on public.recipe_ingredients for all using (auth.uid() is not null);
exception when others then end $$;

do $$ begin
  drop policy if exists "Authenticated read priced_products" on public.priced_products;
  create policy "Authenticated read priced_products" on public.priced_products for select using (auth.uid() is not null);
exception when others then end $$;

do $$ begin
  drop policy if exists "Authenticated write priced_products" on public.priced_products;
  create policy "Authenticated write priced_products" on public.priced_products for all using (auth.uid() is not null);
exception when others then end $$;

do $$ begin
  drop policy if exists "Authenticated read priced_product_components" on public.priced_product_components;
  create policy "Authenticated read priced_product_components" on public.priced_product_components for select using (auth.uid() is not null);
exception when others then end $$;

do $$ begin
  drop policy if exists "Authenticated write priced_product_components" on public.priced_product_components;
  create policy "Authenticated write priced_product_components" on public.priced_product_components for all using (auth.uid() is not null);
exception when others then end $$;

-- ---------------------------------------------------------------------------
-- Privilégios
-- ---------------------------------------------------------------------------
grant all on all tables in schema public to authenticated;
grant all on all tables in schema public to anon;
grant all on all sequences in schema public to authenticated;
grant all on all sequences in schema public to anon;

-- ---------------------------------------------------------------------------
-- Comentários de documentação
-- ---------------------------------------------------------------------------
comment on table public.ingredients is 'Insumos / matéria-prima para fichas técnicas.';
comment on table public.invoices is 'Notas fiscais NFC-e importadas.';
comment on table public.invoice_items is 'Itens de cada nota fiscal.';
comment on table public.recipes is 'Receitas / preparos base.';
comment on table public.recipe_ingredients is 'Ingredientes utilizados em cada receita.';
comment on table public.priced_products is 'Produtos finais com precificação.';
comment on table public.priced_product_components is 'Receitas/itens que compõem cada produto final.';

-- ---------------------------------------------------------------------------
-- orders — Pedidos / Encomendas
-- ---------------------------------------------------------------------------
create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  customer_name text not null,
  customer_phone text default '',
  delivery_date timestamptz not null,
  status text not null default 'pendente'
    check (status in ('pendente', 'em_producao', 'entregue', 'cancelado')),
  total_amount numeric(10,2) not null default 0,
  deposit_paid numeric(10,2) not null default 0,
  payment_status text not null default 'pendente'
    check (payment_status in ('pendente', 'sinal_pago', 'pago')),
  notes text default '',
  stock_deducted boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- order_items — Itens do Pedido
-- ---------------------------------------------------------------------------
create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  priced_product_id uuid references public.priced_products(id) on delete set null,
  product_name text not null,
  quantity numeric(10,2) not null default 1,
  unit_price numeric(10,2) not null default 0,
  subtotal numeric(10,2) not null default 0
);

-- ---------------------------------------------------------------------------
-- stock_movements — Movimentações de Estoque
-- ---------------------------------------------------------------------------
create table if not exists public.stock_movements (
  id uuid primary key default gen_random_uuid(),
  ingredient_id uuid not null references public.ingredients(id) on delete cascade,
  movement_type text not null check (movement_type in ('entrada', 'saida')),
  quantity numeric(10,2) not null,
  reason text not null,
  reference_id uuid,
  created_at timestamptz not null default now()
);

-- Índices
create index if not exists idx_orders_status on public.orders(status);
create index if not exists idx_orders_delivery_date on public.orders(delivery_date);
create index if not exists idx_order_items_order on public.order_items(order_id);
create index if not exists idx_stock_movements_ingredient on public.stock_movements(ingredient_id);
create index if not exists idx_stock_movements_created_on on public.stock_movements(created_at);

-- Updated at triggers for orders
drop trigger if exists update_orders_updated_at on public.orders;
create trigger update_orders_updated_at
  before update on public.orders
  for each row
  execute function public.update_updated_at_column();

-- RLS
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.stock_movements enable row level security;

do $$ begin
  drop policy if exists "Authenticated read orders" on public.orders;
  create policy "Authenticated read orders" on public.orders for select using (auth.uid() is not null);
exception when others then end $$;

do $$ begin
  drop policy if exists "Authenticated write orders" on public.orders;
  create policy "Authenticated write orders" on public.orders for all using (auth.uid() is not null);
exception when others then end $$;

do $$ begin
  drop policy if exists "Authenticated read order_items" on public.order_items;
  create policy "Authenticated read order_items" on public.order_items for select using (auth.uid() is not null);
exception when others then end $$;

do $$ begin
  drop policy if exists "Authenticated write order_items" on public.order_items;
  create policy "Authenticated write order_items" on public.order_items for all using (auth.uid() is not null);
exception when others then end $$;

do $$ begin
  drop policy if exists "Authenticated read stock_movements" on public.stock_movements;
  create policy "Authenticated read stock_movements" on public.stock_movements for select using (auth.uid() is not null);
exception when others then end $$;

do $$ begin
  drop policy if exists "Authenticated write stock_movements" on public.stock_movements;
  create policy "Authenticated write stock_movements" on public.stock_movements for all using (auth.uid() is not null);
exception when others then end $$;

comment on table public.orders is 'Pedidos / Encomendas de clientes.';
comment on table public.order_items is 'Itens de cada pedido.';
comment on table public.stock_movements is 'Movimentações de estoque de insumos (entrada via NFC-e, saída via pedidos).';

-- ---------------------------------------------------------------------------
-- financial_transactions — Lançamentos do Fluxo de Caixa
-- ---------------------------------------------------------------------------
create table if not exists public.financial_transactions (
  id uuid primary key default gen_random_uuid(),
  type text not null check (type in ('entrada', 'saida')),
  category text not null,
  description text not null,
  amount numeric(10,2) not null,
  transaction_date date not null default current_date,
  payment_method text not null default 'Pix'
    check (payment_method in ('Pix', 'Cartão de Crédito', 'Cartão de Débito', 'Dinheiro', 'Transferência')),
  reference_type text check (reference_type in ('order', 'invoice', 'manual')),
  reference_id uuid,
  created_at timestamptz not null default now()
);

-- Índice único parcial para evitar lançamentos duplicados da mesma nota/pedido
create unique index if not exists idx_financial_transactions_ref_unique
  on public.financial_transactions(reference_type, reference_id)
  where reference_id is not null;

create index if not exists idx_financial_transactions_date on public.financial_transactions(transaction_date);
create index if not exists idx_financial_transactions_type on public.financial_transactions(type);

-- Updated at trigger
drop trigger if exists update_financial_transactions_updated_at on public.financial_transactions;
create trigger update_financial_transactions_updated_at
  before update on public.financial_transactions
  for each row
  execute function public.update_updated_at_column();

-- RLS
alter table public.financial_transactions enable row level security;

do $$ begin
  drop policy if exists "Authenticated read financial_transactions" on public.financial_transactions;
  create policy "Authenticated read financial_transactions" on public.financial_transactions for select using (auth.uid() is not null);
exception when others then end $$;

do $$ begin
  drop policy if exists "Authenticated write financial_transactions" on public.financial_transactions;
  create policy "Authenticated write financial_transactions" on public.financial_transactions for all using (auth.uid() is not null);
exception when others then end $$;

comment on table public.financial_transactions is 'Lançamentos do fluxo de caixa (entradas e saídas financeiras).';
