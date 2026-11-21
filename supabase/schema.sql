-- ============================================================================
-- supabase/schema.sql
-- Dona Cá Doceria — Confeitaria Artesanal
-- Schema idempotente para execução no SQL Editor do Supabase
-- ============================================================================

-- Habilita extensões necessárias
create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- store_settings — Configurações globais da loja (singleton, id = 1)
-- ---------------------------------------------------------------------------
create table if not exists public.store_settings (
  id              integer primary key default 1 check (id = 1),
  store_name      text not null default 'Dona Cá Doceria — Confeitaria Artesanal',
  whatsapp_number text default '',
  instagram_url   text default '',
  contact_email   text default '',
  is_open         boolean not null default true,
  announcement_text text default '',
  announcement_active boolean not null default false,
  pickup_address  text default '',
  pickup_hours    text default '',
  pix_key         text default '',
  updated_at      timestamptz not null default now()
);

-- Registro inicial (idempotente)
insert into public.store_settings (id, store_name, whatsapp_number, instagram_url, contact_email, is_open, announcement_text, announcement_active, pickup_address, pickup_hours, pix_key)
values (1, 'Dona Cá Doceria — Confeitaria Artesanal', '', '', '', true, '', false, '', '', '')
on conflict (id) do nothing;

-- ---------------------------------------------------------------------------
-- categories — Categorias da vitrine
-- ---------------------------------------------------------------------------
create table if not exists public.categories (
  id            uuid primary key default gen_random_uuid(),
  name          text not null,
  slug          text not null unique,
  display_order integer not null default 0,
  active        boolean not null default true,
  created_at    timestamptz not null default now()
);

-- Seed inicial de categorias (idempotente por slug)
insert into public.categories (id, name, slug, display_order, active) values
  (gen_random_uuid(), 'Pronta Entrega',          'pronta-entrega', 1, true),
  (gen_random_uuid(), 'Bolos Festivos',          'bolos-festivos', 2, true),
  (gen_random_uuid(), 'Doces Finos & Brigadeiros','doces-finos',   3, true),
  (gen_random_uuid(), 'Sobremesas no Pote',      'sobremesas-pote',4, true),
  (gen_random_uuid(), 'Kits Festa',              'kits-festa',     5, true)
on conflict (slug) do nothing;

-- ---------------------------------------------------------------------------
-- products — Catálogo de produtos
-- ---------------------------------------------------------------------------
create table if not exists public.products (
  id                uuid primary key default gen_random_uuid(),
  category_id       uuid references public.categories(id) on delete set null,
  name              text not null,
  description       text default '',
  base_price        numeric not null default 0,
  availability_type text not null default 'ready'
                    check (availability_type in ('ready', 'order', 'paused')),
  min_advance_hours integer not null default 0,
  is_featured       boolean not null default false,
  is_new            boolean not null default true,
  available         boolean not null default true,
  image_url         text default '',
  images            text[] not null default '{}',
  video_url         text default null,
  display_order     integer not null default 0,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- product_option_groups — Grupos de personalização por produto
-- ---------------------------------------------------------------------------
create table if not exists public.product_option_groups (
  id             uuid primary key default gen_random_uuid(),
  product_id     uuid not null references public.products(id) on delete cascade,
  title          text not null,
  type           text not null default 'single'
                 check (type in ('single', 'multiple')),
  required       boolean not null default false,
  min_choices    integer not null default 0,
  max_choices    integer not null default 1,
  display_order  integer not null default 0
);

-- ---------------------------------------------------------------------------
-- product_options — Opções dentro de cada grupo
-- ---------------------------------------------------------------------------
create table if not exists public.product_options (
  id            uuid primary key default gen_random_uuid(),
  group_id      uuid not null references public.product_option_groups(id) on delete cascade,
  name          text not null,
  price_delta   numeric not null default 0,
  available     boolean not null default true,
  display_order integer not null default 0
);

-- ---------------------------------------------------------------------------
-- Índices úteis
-- ---------------------------------------------------------------------------
create index if not exists idx_products_category_id on public.products(category_id);
create index if not exists idx_products_active on public.products(display_order);
create index if not exists idx_products_featured on public.products(is_featured) where is_featured;
create index if not exists idx_option_groups_product on public.product_option_groups(product_id);
create index if not exists idx_options_group on public.product_options(group_id);

-- ---------------------------------------------------------------------------
-- Updated_at trigger para products
-- ---------------------------------------------------------------------------
create or replace function public.update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists update_products_updated_at on public.products;
create trigger update_products_updated_at
  before update on public.products
  for each row
  execute function public.update_updated_at_column();

-- ---------------------------------------------------------------------------
-- Row Level Security (RLS)
-- Habilita RLS e cria políticas de forma idempotente (captura exceções)
-- ---------------------------------------------------------------------------

-- store_settings
do $$
begin
  alter table public.store_settings enable row level security;
exception when others then end $$;
do $$
begin
  drop policy if exists "Public read store_settings" on public.store_settings;
  create policy "Public read store_settings" on public.store_settings for select using (true);
exception when others then end $$;
do $$
begin
  drop policy if exists "Authenticated write store_settings" on public.store_settings;
  create policy "Authenticated write store_settings" on public.store_settings for all using (auth.uid() is not null);
exception when others then end $$;

-- categories
do $$
begin
  alter table public.categories enable row level security;
exception when others then end $$;
do $$
begin
  drop policy if exists "Public read categories" on public.categories;
  create policy "Public read categories" on public.categories for select using (active = true);
exception when others then end $$;
do $$
begin
  drop policy if exists "Authenticated write categories" on public.categories;
  create policy "Authenticated write categories" on public.categories for all using (auth.uid() is not null);
exception when others then end $$;

-- products
do $$
begin
  alter table public.products enable row level security;
exception when others then end $$;
do $$
begin
  drop policy if exists "Public read products" on public.products;
  create policy "Public read products" on public.products for select using (true);
exception when others then end $$;
do $$
begin
  drop policy if exists "Authenticated write products" on public.products;
  create policy "Authenticated write products" on public.products for all using (auth.uid() is not null);
exception when others then end $$;

-- product_option_groups
do $$
begin
  alter table public.product_option_groups enable row level security;
exception when others then end $$;
do $$
begin
  drop policy if exists "Public read product_option_groups" on public.product_option_groups;
  create policy "Public read product_option_groups" on public.product_option_groups for select using (true);
exception when others then end $$;
do $$
begin
  drop policy if exists "Authenticated write product_option_groups" on public.product_option_groups;
  create policy "Authenticated write product_option_groups" on public.product_option_groups for all using (auth.uid() is not null);
exception when others then end $$;

-- product_options
do $$
begin
  alter table public.product_options enable row level security;
exception when others then end $$;
do $$
begin
  drop policy if exists "Public read product_options" on public.product_options;
  create policy "Public read product_options" on public.product_options for select using (true);
exception when others then end $$;
do $$
begin
  drop policy if exists "Authenticated write product_options" on public.product_options;
  create policy "Authenticated write product_options" on public.product_options for all using (auth.uid() is not null);
exception when others then end $$;

-- ---------------------------------------------------------------------------
-- Storage bucket: product-images (público)
-- ---------------------------------------------------------------------------
do $$
begin
  insert into storage.buckets (id, name, public)
  values ('product-images', 'product-images', true)
  on conflict (id) do nothing;
exception when others then end $$;

do $$
begin
  drop policy if exists "Public read product-images" on storage.objects;
  create policy "Public read product-images" on storage.objects for select
  using (bucket_id = 'product-images');
exception when others then end $$;

do $$
begin
  drop policy if exists "Authenticated insert product-images" on storage.objects;
  create policy "Authenticated insert product-images" on storage.objects for insert
  with check (bucket_id = 'product-images' and auth.uid() is not null);
exception when others then end $$;

do $$
begin
  drop policy if exists "Authenticated update product-images" on storage.objects;
  create policy "Authenticated update product-images" on storage.objects for update
  using (bucket_id = 'product-images' and auth.uid() is not null);
exception when others then end $$;

do $$
begin
  drop policy if exists "Authenticated delete product-images" on storage.objects;
  create policy "Authenticated delete product-images" on storage.objects for delete
  using (bucket_id = 'product-images' and auth.uid() is not null);
exception when others then end $$;

-- ---------------------------------------------------------------------------
-- Comentários de documentação
-- ---------------------------------------------------------------------------
comment on table public.store_settings is 'Configurações globais da loja (singleton).';
comment on table public.categories is 'Categorias da vitrine doceria.';
comment on table public.products is 'Produtos de confeitaria.';
comment on table public.product_option_groups is 'Grupos de personalização (ex: Rendimento, Massa, Recheios).';
comment on table public.product_options is 'Opções dentro de cada grupo.';

-- ---------------------------------------------------------------------------
-- Colunas ausentes em tabelas já existentes (idempotente)
-- ---------------------------------------------------------------------------
alter table public.products add column if not exists is_new boolean default true;
alter table public.products add column if not exists available boolean default true;


-- ---------------------------------------------------------------------------
-- Concessão de privilégios (se o usuário for owner das tabelas)
-- ---------------------------------------------------------------------------
grant all on all tables in schema public to authenticated;
grant all on all tables in schema public to anon;
grant all on all sequences in schema public to authenticated;
grant all on all sequences in schema public to anon;

