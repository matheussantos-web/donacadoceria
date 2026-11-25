# RELATORIO_PROJETO.md

Relatório geral de leitura (somente leitura) do projeto `catalogo_donacadoceria`.
Gerado automaticamente para análise por outra IA. Nenhum arquivo foi alterado.

---

## 1. Visão geral

**O que é:** Aplicação web (SPA) de catálogo e encomendas para a "Dona Ca Doceria — Confeitaria Artesanal", um negócio de confeitaria artesanal voltado para venda de bolos festivos, doces finos, sobremesas e pronta entrega.

**Para quem:** Clientes finais (vitrine pública) e a própria confeitaria (painel de gestão autenticado).

**Estado atual:** Funcional em partes. A vitrine pública e o montador de bolos 3D estão implementados e compilam. O painel de gestão (`/gestao`) existe mas depende de banco Supabase populado e autenticação real. Não há confirmação de que esteja em produção acessível ao público.

---

## 2. Stack e dependências

- **Linguagem:** JavaScript (Vue 3 `<script setup>`)
- **Framework frontend:** Vue 3 (`^3.5.44`) + Vue Router (`^4.6.5`)
- **Build tool:** Vite (`^8.3.6`)
- **CSS:** Tailwind CSS (`^4.3.5`) via PostCSS + Autoprefixer
- **Banco/Backend:** Supabase (PostgreSQL + RLS + Storage) via `@supabase/supabase-js` (`^2.49.1`). Não há servidor Node/Express próprio; é front-only.
- **PWA:** `vite-plugin-pwa` (`^2.0.0`)
- **Animações:** GSAP (`^3.15.1`), `@vueuse/motion` (`^3.0.3`)
- **3D:** Three.js (`^0.187.0`) — usado no montador de bolos para preview 3D
- **Ícones:** `lucide-vue-next` (`^1.0.0`)
- **WhatsApp:** `canvas-confetti` (`^1.9.4`) para efeitos de celebração; lógica própria de geração de link `wa.me/`
- **Leitura de QRCode:** `html5-qrcode` (`^2.3.8`) — usado no `NfceScannerModal.vue`
- **Outras:** `cheerio` (`^1.2.0`), `canvas` (`^3.2.3`), `sharp` (`^0.35.5`)

**Banco de dados:** PostgreSQL via Supabase (tabelas: `store_settings`, `categories`, `products`, `product_option_groups`, `product_options`). RLS habilitado em todas. Bucket público `product-images` para imagens.

**Variáveis de ambiente (nomes apenas, sem valores):**
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `VITE_WHATSAPP_NUMBER`
- `VITE_WHATSAPP_DEFAULT_MESSAGE`
- `VITE_INSTAGRAM_URL`
- `VITE_CONTACT_EMAIL`

---

## 3. Estrutura de pastas (resumida, até 3 níveis)

```
catalogo_donacadoceria/
├── package.json, vite.config.js, tailwind.config.js, postcss.config.js, index.html
├── supabase/
│   ├── schema.sql              -- DDL principal (tabelas, RLS, storage bucket)
│   ├── schema_gestao.sql       -- DDL da etapa de gestão (financeiro, receitas, etc.)
│   └── migration_pricing_ingredients.sql -- DDL de ingredientes/embalagens na precificação
├── src/
│   ├── main.js                 -- Ponto de entrada (createApp + router)
│   ├── App.vue                 -- Layout raiz (alterno DefaultLayout / AuthLayout)
│   ├── style.css               -- CSS global + camadas Tailwind
│   ├── router/index.js         -- Rotas públicas e autenticadas + guarda de auth
│   ├── lib/supabase.js         -- Cliente Supabase + helper isSupabaseConfigured
│   ├── utils/                  -- Utilitários (ex: parseNfceText.js)
│   ├── assets/                 -- Imagens estáticas (logo, etc.)
│   ├── layouts/
│   │   ├── DefaultLayout.vue   -- Layout público (header, hero, contato, footer, slot)
│   │   └── AuthLayout.vue      -- Layout autenticado (painel de gestão)
│   ├── views/
│   │   ├── Home.vue            -- (não existe; '/' aponta para CatalogView)
│   │   ├── CatalogView.vue     -- Vitrine pública: hero, filtros, grid de produtos, carrinho
│   │   ├── CakeBuilder.vue     -- Montador de bolos (linha, tamanho, massa, recheios, cobertura, topo)
│   │   ├── Cake3DPreview.vue   -- (não é view; está em components/)
│   │   ├── GestaoView.vue      -- Painel de gestão (KPIs, fluxo, módulos: estoque, pedidos, financeiro, receitas, precificação, NFC-e)
│   │   ├── LoginView.vue       -- Login
│   │   ├── AdminProductsView.vue -- Admin de produtos
│   │   └── PhotoRedirectView.vue -- Redirecionamento de foto por código
│   ├── components/
│   │   ├── AppHeader.vue       -- (não encontrado; cabeçalho está em DefaultLayout)
│   │   ├── ProductCard.vue     -- Card de produto na vitrine
│   │   ├── catalog/
│   │   │   ├── CartCheckoutDrawer.vue  -- Gaveta de sacola + checkout WhatsApp
│   │   │   └── ProductCustomizerModal.vue -- Modal de personalização de produto
│   │   ├── gestao/
│   │   │   ├── IngredientsManager.vue
│   │   │   ├── RecipesManager.vue
│   │   │   ├── PricingManager.vue
│   │   │   ├── OrdersManager.vue
│   │   │   ├── FinanceManager.vue
│   │   │   ├── NfceReconciliationModal.vue
│   │   │   ├── NfceScannerModal.vue
│   │   │   └── ToastContainer.vue
│   │   ├── admin/
│   │   │   ├── AdminProductCard.vue
│   │   │   ├── AdminProductFormModal.vue
│   │   │   └── AdminStoreSettingsForm.vue
│   │   ├── Cake3DPreview.vue   -- Preview 3D do bolo (Three.js + GSAP)
│   │   ├── EmptyState.vue
│   │   ├── FilterBar.vue
│   │   └── WhatsAppIcon.vue
│   ├── composables/
│   │   ├── useCart.js          -- Sacola (localStorage)
│   │   ├── useAuth.js          -- Autenticação
│   │   ├── useToast.js         -- Notificações toast
│   │   └── useWhatsAppLink.js  -- Links e mensagens WhatsApp
│   ├── config/
│   │   ├── store.js            -- Config da loja (whatsapp, instagram, email, regras)
│   │   └── cakeBuilderConfig.js-- Config centralizada de sabores/cores/escalas do bolo 3D
│   ├── data/
│   │   └── products.js         -- Catálogo estático de produtos (fallback se Sem Supabase)
│   └── services/
│       ├── products.js         -- Serviço de produtos (Supabase + fallback estático)
│       ├── orders.js, invoices.js, ingredients.js, recipes.js, finance.js, stockMovements.js, storeSettings.js, recalculateCosts.js
│       └── categories.js
├── dist/                       -- Build de produção (não versionado)
└── node_modules/               -- Dependências (não versionado)
```

---

## 4. Arquitetura e fluxo

**Ponto de entrada:** `src/main.js` cria a app Vue, usa o `router` e monta em `#app`.

**Layouts:** `App.vue` escolhe entre `DefaultLayout` (rotas públicas) e `AuthLayout` (rotas autenticadas) com base em `route.meta.layout`. Dentro do layout, há um `<Transition name="page-fade">` envolto no `<router-view>`.

**Fluxo principal (cliente público):**
1. Usuário acessa `/` → `CatalogView` (vitrine pública).
2. `CatalogView` carrega produtos via `productService.list()` (Supabase ou fallback estático `src/data/products.js`).
3. Usuário filtra por categoria (`FilterBar`), clica em um produto → `ProductCustomizerModal` abre para escolher opções (rendimento, massa, recheios, adicionais).
4. Ao adicionar, emite evento `donaca:add-to-cart` capturado em `App.vue`, que chama `useCart().addItem()`.
5. `CartCheckoutDrawer` abre com resumo, campos de contato, modalidade (entrega/retirada), data/horário, pagamento.
6. Botão "Enviar Pedido pelo WhatsApp" gera link `wa.me/` com mensagem estruturada (`useWhatsAppLink.js`).

**Fluxo do montador de bolos (`/montar-bolo`):**
1. `CakeBuilder.vue` exibe 6 seções: linha, tamanho, massa, recheios (até 2), cobertura, adicionais/frase.
2. `Cake3DPreview.vue` (Three.js) renderiza o bolo em 3D com base nas escolhas, atualizando cores, texturas, drip, rosetas, topper personalizado.
3. Resumo lateral mostra preço calculado (computed) e botão "Adicionar à Sacola".
4. Ao adicionar, dispensa evento `donaca:add-to-cart` e abre o checkout.

**Fluxo do painel (`/gestao`):**
Requer autenticação (`requiresAuth`). Contém módulos de gestão: Estoque, Receitas, Precificação, Pedidos, Financeiro, NFC-e. Cada módulo é um componente grande (15k-34k linhas).

---

## 5. Dados (modelo do banco)

Tabelas definidas em `supabase/schema.sql` (idempotente, para rodar no SQL Editor do Supabase):

- **store_settings** (singleton, id=1): `store_name`, `whatsapp_number`, `instagram_url`, `contact_email`, `is_open`, `announcement_text`, `announcement_active`, `pickup_address`, `pickup_hours`, `pix_key`, `updated_at`.
- **categories**: `id` (uuid), `name`, `slug` (único), `display_order`, `active`, `created_at`.
- **products**: `id` (uuid), `category_id` (fk), `name`, `description`, `base_price`, `availability_type` (ready/order/paused), `min_advance_hours`, `is_featured`, `is_new`, `available`, `image_url`, `images` (text[]), `video_url`, `display_order`, `created_at`, `updated_at`.
- **product_option_groups**: `id`, `product_id` (fk), `title`, `type` (single/multiple), `required`, `min_choices`, `max_choices`, `display_order`.
- **product_options**: `id`, `group_id` (fk), `name`, `price_delta`, `available`, `display_order`.

**RLS:** Todas as tabelas têm RLS habilitado. Políticas: leitura pública para produtos/categorias/settings; escrita autenticada para todas. Storage bucket público `product-images` com leitura pública e escrita autenticada.

**Observação:** O catálogo estático em `src/data/products.js` é usado como fallback quando o Supabase não está configurado (`isSupabaseConfigured()` retorna falso). Não há confirmação de que o banco esteja populado em produção.

---

## 6. Funcionalidades e status

| Funcionalidade | Arquivo(s) | Status | Observações |
|---|---|---|---|
| Vitrine pública com catálogo | `src/views/CatalogView.vue`, `src/services/products.js` | ✅ Completa | Carrega do Supabase ou fallback estático |
| Filtro por categoria | `src/components/FilterBar.vue`, `CatalogView.vue` | ✅ Completa | |
| Hero com GSAP + parallax | `CatalogView.vue` | ✅ Completa | Animações de entrada e scroll |
| Cards de produto | `src/components/ProductCard.vue` | ✅ Completa | |
| Modal de personalização (customizer) | `src/components/catalog/ProductCustomizerModal.vue` | ✅ Completa | Opções de rendimento, massa, recheios, adicionais |
| Sacola (localStorage) | `src/composables/useCart.js` | ✅ Completa | Persiste em `donaca_cart` |
| Gaveta de sacola + checkout WhatsApp | `src/components/catalog/CartCheckoutDrawer.vue` | ✅ Completa | Data, entrega/retirada, pagamento, link wa.me/ |
| Montador de bolos (6 etapas) | `src/views/CakeBuilder.vue` | ✅ Completa | Linha, tamanho P/M/G/GG, massa, recheios, cobertura, frase/topo |
| Preview 3D do bolo | `src/components/Cake3DPreview.vue` | ✅ Completa | Three.js, GSAP, PBR, texturas procedurais, drip, rosetas, topper |
| Config centralizada de sabores | `src/config/cakeBuilderConfig.js` | ✅ Completa | Criada nesta sessão; ainda não consumida 100% por todos os componentes |
| Regras de encomenda (5 dias, 50% entrada) | `src/data/products.js` (`REGRAS`) | ✅ Completa | Exibida no montador e no checkout |
| Painel de gestão (KPIs, fluxo) | `src/views/GestaoView.vue` | 🟡 Parcial | Existe, depende de auth + Supabase populado |
| Gestão de ingredientes | `src/components/gestao/IngredientsManager.vue` | 🟡 Parcial | |
| Gestão de receitas | `src/components/gestao/RecipesManager.vue` | 🟡 Parcial | |
| Precificação | `src/components/gestao/PricingManager.vue` | 🟡 Parcial | |
| Pedidos | `src/components/gestao/OrdersManager.vue` | 🟡 Parcial | |
| Financeiro | `src/components/gestao/FinanceManager.vue` | 🟡 Parcial | |
| Conciliação NFC-e | `src/components/gestao/NfceReconciliationModal.vue` | 🟡 Parcial | Escaneia NFC-e, importa itens, atualiza estoque |
| Scanner NFC-e | `src/components/gestao/NfceScannerModal.vue` | 🟡 Parcial | Usa html5-qrcode |
| Admin de produtos | `src/views/AdminProductsView.vue` | 🟡 Parcial | Requer auth |
| Login | `src/views/LoginView.vue` | 🟡 Parcial | `useAuth.js` existe, mas não há confirmação de funcionamento real |
| PWA | `vite.config.js` (VitePWA) | ✅ Completa | Manifest, workbox, ícones |
| Testes | — | ❌ Não encontrados | Nenhum arquivo de teste no projeto |

---

## 7. Endpoints / comandos / eventos

**Rotas (Vue Router, `src/router/index.js`):**
- `/` → `CatalogView` (público)
- `/f/:code` → `PhotoRedirectView` (autenticado)
- `/login` → `LoginView` (autenticado layout, mas rota pública)
- `/admin` → `AdminProductsView` (requer auth)
- `/vitrine` → redirect para `/`
- `/montar-bolo` → `CakeBuilder` (público)
- `/gestao` → `GestaoView` (requer auth)

**Eventos customizados:**
- `donaca:add-to-cart` (disparado em `CakeBuilder.vue` e capturado em `App.vue` para adicionar bolo à sacola)

**Comandos npm:**
- `npm run dev` — inicia Vite na porta 5173, host verdadeiro
- `npm run build` — build de produção em `dist/`
- `npm run preview` — preview do build

**Não há backend próprio.** Não existem endpoints REST/GraphQL próprios; toda comunicação com banco vai direto para o Supabase via `@supabase/supabase-js`.

---

## 8. Configuração e deploy

**Variáveis de ambiente (nomes, sem valores):**
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `VITE_WHATSAPP_NUMBER`
- `VITE_WHATSAPP_DEFAULT_MESSAGE`
- `VITE_INSTAGRAM_URL`
- `VITE_CONTACT_EMAIL`

**Como rodar local:**
1. `npm install`
2. Criar `.env` a partir de `.env.example` (preencher variáveis)
3. `npm run dev` (Vite porta 5173)

**DDL do banco:** As SQLs estão em `supabase/schema.sql`, `supabase/schema_gestao.sql`, `supabase/migration_pricing_ingredients.sql`. Devem ser aplicadas via SQL Editor do Supabase (não via anônimo key).

**Deploy:** Não há evidência de plataforma de hospedagem configurada no repositório (não há `vercel.json`, `netlify.toml`, `Dockerfile`, etc. além de `.vercel` ignorado no gitignore). O build gera pasta `dist/`.

---

## 9. Problemas encontrados

| # | Arquivo | Linha | Problema | Gravidade |
|---|---------|-------|----------|-----------|
| 1 | `src/components/Cake3DPreview.vue` | ~40-94 | O `defineProps` aceita aliases legados (`tamanho`, `linha`, `massa`, `recheios`, `cobertura`, `fraseTopo`) mas o template usa `currentSize`/`currentLine` (computeds normalizados). Funciona, mas o código está misturado entre props em português e inglês. | Média |
| 2 | `src/views/CakeBuilder.vue` | ~295-324 | Arrays `BATTERS_MAP`, `FROSTINGS_MAP`, `RECHEIOS_MAP` foram removidos e substituídos por import de `cakeBuilderConfig.js`, mas `MASSAS`, `RECHEIOS`, `COBERTURAS` ainda vêm de `src/data/products.js` (hardcoded), não do novo config. Inconsistência de dados entre o montador (UI) e o preview 3D (que usa `cakeBuilderConfig.js`). | Média |
| 3 | `src/views/CakeBuilder.vue` | ~295-316 | `REGRAS`, `LINHAS`, `TAMANHOS`, `MASSAS`, `RECHEIOS`, `COBERTURAS` continuam importados de `src/data/products.js`, enquanto `cakeBuilderConfig.js` tem dados similares mas com cores diferentes (ex: Baunilha `#F2D29B` no config vs `#FDF9F9` em products.js). Risco de cores divergentes entre 3D e resumo. | Média |
| 4 | `src/views/CakeBuilder.vue` | ~258-264 | `linhaSelecionada`, `tamanhoSelecionado`, `massaSelecionada`, `coberturaSelecionada` são `ref` iniciais fixos (`'baunilha'`, `'chantininho'`, etc.) sem validação contra as listas do config. Se o config mudar, o estado inicial pode ficar inconsistente. | Baixa |
| 5 | `src/components/catalog/CartCheckoutDrawer.vue` | — | Não lido neste relatório (arquivo não lido por completo). Não há confirmação de validação de data mínima (5 dias) no checkout. | Não verificada |
| 6 | `src/data/products.js` | — | Muitos produtos têm `imageUrl: ''` (vazio). Depende de URLs reais do Supabase Storage para mostrar imagens nos cards. | Média |
| 7 | `src/router/index.js` | 9-10 | `useAuth()` é chamado no escopo do módulo (fora de setup), o que pode ser problemático no Vue 3 se o plugin não estiver instalado ainda. Funciona porque o router é criado após o app, mas é frágil. | Baixa |
| 8 | `src/services/products.js` | 130-137 | Quando Supabase não está configurado, retorna `fallbackProducts` com `optionGroups: []` (vazio), perdendo as opções de personalização definidas no array estático. | Baixa |

---

## 10. Dívida técnica

1. **Dados duplicados entre `src/data/products.js` e `src/config/cakeBuilderConfig.js`**: Cores, massas, recheios e coberturas existem em dois lugares com valores diferentes (ex: Baunilha é `#FDF9F9` em products.js e `#F2D29B` em cakeBuilderConfig.js). **Refatorar primeiro:** consolidar tudo em `cakeBuilderConfig.js` e fazer `products.js` importar dele.
2. **Componentes de gestão gigantes:** `IngredientsManager.vue` (34KB), `OrdersManager.vue` (30KB), `PricingManager.vue` (29KB), `RecipesManager.vue` (22KB), `GestaoView.vue` (23KB) são arquivos monolíticos com template + script misturados. Difícil de manter e testar.
3. **Arquivo parcial órfão:** `src/views/AdminProductsView.vue.part1` (39 bytes) — arquivo fragmentado, possivelmente resíduo de edição interrompida.
4. **Sem testes:** Não há pasta de testes nem config de Vitest/Jest. Qualquer mudança regressiva não é detectada automaticamente.
5. **Sem lint configurado:** Não há ESLint, Prettier nem script de lint no `package.json`. O código depende do build do Vite para validar sintaxe apenas.
6. **Dependência de Supabase não verificada:** Não há confirmação de que o banco esteja populado ou acessível. O front roda com fallback estático, mas as funções de gestão dependem do banco real.

---

## 11. Testes e qualidade

- **Testes automatizados:** Nenhum encontrado. Não há pasta `__tests__`, `tests/`, `spec/`, nem config de Vitest/Jest.
- **Lint:** Não há ESLint/Prettier configurado. Nenhum script de lint no `package.json`.
- **Tratamento de erros:** Muito do código usa `try/catch` com `console.warn`/`console.error` e `alert()` para o usuário. Não há sistema centralizado de logs.
- **TypeScript:** Não é usado (apenas JavaScript).
- **Build:** `npm run build` passa com sucesso (exit 0), com warning de chunks > 500 KB.

---

## 12. Histórico recente (últimos ~20 commits)

1. `78dcb26` remover script temporário de geração
2. `25f6a08` feat(ux): config centralizada de sabores, correção de recheios no 3D e topper nítido
3. `221b660` feat(3d): reescrever Cake3DPreview com enquadramento 10cm, iluminação quente e abertura por padrão
4. `fe28189` fix(3d): sobrescrita completa do Cake3DPreview com containerRef declarado
5. `d9f7e24` remover arquivo temporário de geração
6. `c137848` fix(3d): corrigir ReferenceError size is not defined com blindagem defensiva e computed normalizados
7. `34b93f5` feat(3d): Cake3DPreview PBR estúdio com texturas procedurais e modo raio-x
8. `676f96b` feat(3d): rebuild Cake3DPreview com renderização PBR estúdio e texturas procedurais
9. `f45dd1d` feat(ux): animações GSAP, @vueuse/motion, confetti e transições no cardápio
10. `3366688` feat(cardapio): adicionar visualizacao 3D interativa do bolo no montador (Three.js)
11. `205131e` remover scripts temporários de geração
12. `0fb70cb` feat(cardapio): integrar montador de bolos, paleta oficial e regras de encomenda no painel principal
13. `15c795a` remover diretório duplicado cardapio/
14. `f47c54d` feat(core): adicionar cardápio digital Dona Ca Doceria (Vue 3 + Tailwind mobile-first)
15. `6aea1b8` feat(ux): elevar UX/UI do painel com KPIs, labels didaticos e layout mobile-first

Trabalho recente concentrado no montador de bolos 3D e na vitrine pública. O painel de gestão tem commits mais antigos.

---

## 13. Pontos em aberto (precisam de confirmação do usuário)

1. O banco Supabase está populado e acessível? O front roda com fallback estático, mas não há confirmação de que `isSupabaseConfigured()` retorne true em produção.
2. Qual o número de WhatsApp e Instagram configurados? (Não estão no repositório; estão apenas nos nomes das variáveis de ambiente.)
3. O projeto está hospedado em algum lugar? Não há arquivo de deploy (`vercel.json`, `Dockerfile`, etc.) visível no repositório.
4. O usuário deseja priorizar o montador de bolos 3D (impacto visual) ou o painel de gestão (operações internas)?
5. O arquivo `AdminProductsView.vue.part1` deve ser removido?

---

## Resumo executivo (5 linhas)

**3 maiores riscos:** (1) Banco Supabase não confirmado como populado/acessível, o que pode deixar o painel de gestão e a vitrine dinâmica sem dados reais; (2) Dados de sabores/cores duplicados e divergentes entre `src/data/products.js` e `src/config/cakeBuilderConfig.js`, causando inconsistência visual entre o montador e o preview 3D; (3) Ausência de testes e lint, aumentando risco de regressões em alterações futuras.

**3 próximos passos recomendados:** (1) Consolidar sabores, cores e escalas em `src/config/cakeBuilderConfig.js` e fazer `src/data/products.js` e `CakeBuilder.vue` consumirem dela, eliminando duplicação; (2) Implementar testes básicos (Vitest) para `useCart`, `productService` e `resolveColorByName`; (3) Validar o ambiente Supabase (banco populado, RLS, Storage) e configurar variáveis de ambiente reais para produção.

---

Fim do relatório. Arquivo gerado em: `RELATORIO_PROJETO.md` (raiz do projeto).
