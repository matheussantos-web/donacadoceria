# IDEIA.md — Dona Cá Doceria (Flagship Digital & Gestão de Encomendas)

## 1. Visão do Produto & Posicionamento
A **Dona Cá Doceria** não é um catálogo genérico de lista de preços — é uma **vitrine digital sensorial e interativa** de confeitaria artesanal, projetada com padrão de aplicativo nativo (PWA) e estética editorial de luxo acessível.

O sistema tem dois objetivos estratégicos:
1. **Conversão e Encantamento (Cliente Final):** Despertar desejo imediato através de apelo visual forte, micro-interações fluidas, vídeos curtos dos doces e um fluxo de encomenda guiado e sem atrito que envia o pedido perfeitamente estruturado para o WhatsApp.
2. **Operação Ágil na Cozinha (Painel Administrativo):** Permitir que a confeiteira gerencie vitrine, disponibilidade em tempo real (Pronta Entrega vs. Encomenda), regras de antecedência, adicionais e agenda de entregas diretamente pelo celular, com mínima digitação.

---

## 2. Direção de Arte, UI/UX & Impacto Visual

### 2.1. Identidade Visual & Atmosfera
- **Estética:** *Editorial Gourmet / Patisserie Contemporânea* — calorosa, acolhedora, limpa e sofisticada (fugindo de layouts engessados ou visual poluído de delivery comum).
- **Paleta Sugerida (Tokens CSS / Tailwind):**
  - `bg-primary`: `#FDF8F5` (Creme Baunilha / Chantilly suave — fundo principal)
  - `bg-surface`: `#FFFFFF` e `#F7EFEA` (Cards e seções elevadas com bordas sutis `#EADCD3`)
  - `brand-primary`: `#6B2D38` (Ganache / Vinho Cacau profundo — títulos principais, botões primários e destaques)
  - `brand-secondary`: `#C88A55` (Caramelo Dourado / Doce de Leite — badges, selos de destaque, detalhes interativos)
  - `accent-success`: `#2E6F40` (Pistache / Verde Sálvia — status "Pronta Entrega Hoje")
  - `text-primary`: `#2B1B17` (Chocolate Amargo — alta legibilidade sem preto puro)
  - `text-muted`: `#7A635C` (Cacau em pó — descrições e subtítulos)
- **Tipografia:**
  - *Display / Títulos:* Fonte serifada elegante com personalidade (ex: `Playfair Display` ou `Cormorant Garamond`).
  - *UI / Corpo / Preços:* Sans-serif geométrica e nítida (ex: `Plus Jakarta Sans` ou `DM Sans`) com números tabulares (`tabular-nums`) para preços e cálculos.

### 2.2. Motion, Micro-interações & Experiência Imersiva
- **Hero Section Editorial:** Banner principal com entrada coreografada (staggered fade-up), selo dinâmico de status da loja (*"Fornada do dia aberta"* / *"Agenda de encomendas ativa"*) e destaque sazonal (ex: Páscoa, Natal, Kits Festa).
- **Cards de Produto com Apelo Sensorial:**
  - Fotografia em proporção `4:5` (vertical editorial) com zoom suave (`scale-105`) no hover.
  - Suporte a **preview em vídeo curto (loop silencioso / autoplay on hover ou modal)** para mostrar textura, corte de fatia e cobertura caindo.
  - Badges inteligentes no canto da foto: `Pronta Entrega`, `Mais Pedido`, `Sob Encomenda (48h)`, `Esgotado Hoje`.
- **Feedback Tátil e Visual na Sacola:**
  - Barra flutuante inferior (Glassmorphism) no mobile mostrando quantidade de itens, subtotal em tempo real e botão pulsante suave para revisar o pedido.
  - Micro-animação ao adicionar item ou alterar quantidades.
- **Skeleton Loaders:** Carregamento elegante com shimmer quente (`#F3E8E1`) enquanto os dados vêm do Supabase.

---

## 3. Arquitetura Funcional — Catálogo Público (Cliente)

### 3.1. Navegação & Descoberta
- **Barra de Categorias Sticky (Horizontal Scroll no Mobile):**
  - Ex: *Todos*, *Pronta Entrega Hoje*, *Bolos Festivos*, *Doces Finos & Brigadeiros*, *Sobremesas no Pote / Travessa*, *Kits Festa*, *Sazonais*.
- **Filtro Rápido de Disponibilidade:** Toggle no topo para o cliente filtrar apenas *"O que tem para hoje"* vs *"Encomendas agendadas"*.

### 3.2. Modal / Página de Detalhes & Customização (O Coração do Sistema)
Ao abrir um produto, o cliente não vê apenas foto e preço — ele configura sua experiência:
- **Galeria Multi-mídia:** Carrossel com fotos em alta definição + suporte a vídeo curto do doce.
- **Variações de Tamanho / Peso (Obrigatório quando aplicável):**
  - Ex: *Fatia (150g)*, *Bolo P (15cm - 12 fatias)*, *Bolo M (20cm - 22 fatias)*, *Cento / Caixa com 25 un.* — cada opção atualiza o preço dinamicamente.
- **Grupos de Personalização (Configuráveis por Produto no Admin):**
  - *Escolha da Massa* (escolha única: Chocolate 50%, Baunilha, Red Velvet, Cenoura).
  - *Recheios* (múltipla escolha com limite, ex: "Escolha até 2 recheios": Ninho, Brigadeiro Belga, Doce de Leite, Morango Fresco, Pistache).
  - *Adicionais / Extras* (checkboxes com acréscimo de valor: Topo de bolo personalizado +R$ 15,00, Caixinha para presente +R$ 8,00, Morangos extras +R$ 12,00).
- **Campo de Observações do Item:** Ex: *"Escrever 'Parabéns Ana' no prato"*, *"Sem canela"*.
- **Cálculo Dinâmico em Tempo Real:** Botão inferior mostra sempre o valor exato atualizado (`Adicionar • R$ 145,00`).

### 3.3. Checkout Guiado & Inteligência de Agenda
Antes de disparar para o WhatsApp, um drawer/modal de finalização coleta apenas o essencial com validação inteligente:
1. **Resumo da Sacola:** Edição rápida de quantidades e visualização clara das personalizações escolhidas.
2. **Tipo de Recebimento:**
   - `Retirada no Ateliê` (exibe endereço/bairro e horário de funcionamento) ou `Entrega (Delivery)` (campo de endereço + observação de taxa de entrega a confirmar).
3. **Agendamento Inteligente (Data e Turno):**
   - O sistema lê a **maior antecedência mínima** entre os itens da sacola (ex: se há um bolo sob encomenda de 48h, o calendário bloqueia datas anteriores a 48h; se todos os itens forem *Pronta Entrega*, libera para *Hoje*).
   - Seleção de janela de horário: *Manhã (09h–12h)*, *Tarde (14h–18h)*, *Noite (18h–20h)*.
4. **Forma de Pagamento:** Pix, Cartão de Crédito/Débito, Dinheiro (com campo de troco). Se houver item sob encomenda, exibe aviso amigável sobre sinal de 50% para confirmação da data na agenda.
5. **Geração de Mensagem Estruturada (WhatsApp):**
   - Formata o pedido de forma limpa, sem poluição visual, com código de pedido único (ex: `#DC-1042`), lista detalhada dos itens, personalizações, data/turno agendado, dados do cliente e total estimado.

---

## 4. Arquitetura Funcional — Painel Administrativo (`/admin`)

Projetado com abordagem **Mobile-First** (para uso rápido no celular entre uma fornada e outra):

### 4.1. Controle Rápido de Vitrine (Modo Cozinha)
- Lista visual dos produtos com switches instantâneos (sem precisar abrir formulário de edição):
  - **Status de Venda:** `Pronta Entrega` | `Sob Encomenda` | `Esgotado / Pausado`.
  - **Destaque na Home:** Estrela para fixar o produto no topo/carrossel principal.
- **Banner / Aviso Global da Loja:** Campo rápido no painel para ativar um aviso no topo do site (ex: *"Agenda de Páscoa aberta! Encomendas até quinta-feira"* ou *"Ateliê em recesso dia 25"*).

### 4.2. CRUD Completo de Produtos & Personalizações
- Upload múltiplo de imagens (com compressão client-side para `.webp` antes de enviar ao Supabase Storage, garantindo carregamento instantâneo no 4G) + campo para URL/upload de vídeo curto.
- Configuração flexível de:
  - Preço base e/ou tabela de preços por tamanho/peso.
  - Prazo mínimo de antecedência (em horas: `0h` para pronta entrega, `24h`, `48h`, `72h`).
  - Grupos de opções/recheios e adicionais vinculados ao produto (com opção de duplicar estrutura de outro produto para acelerar o cadastro).

### 4.3. Histórico & Gestão de Pedidos Recebidos (Opcional / Fase 2)
- Salvar o registro do pedido no Supabase no momento em que o cliente clica em *"Enviar Pedido no WhatsApp"* (status inicial: `Aguardando Confirmação`), permitindo que o painel tenha uma aba de **Pedidos** (`Pendente` -> `Confirmado / Sinal Pago` -> `Em Produção` -> `Entregue`) e indicadores básicos de faturamento previsto.

---

## 5. Modelo de Dados Sugerido (Supabase / PostgreSQL)

- `store_settings`: Configurações globais da loja (nome, whatsapp, status_aberto, mensagem_banner, banner_ativo, horario_retirada, chave_pix).
- `categories`: `id`, `name`, `slug`, `display_order`, `active`.
- `products`: `id`, `category_id`, `name`, `slug`, `description`, `base_price`, `availability_type` (`ready` | `order` | `paused`), `min_advance_hours` (int), `is_featured` (bool), `video_url` (nullable), `display_order`, `created_at`.
- `product_images`: `id`, `product_id`, `image_url`, `display_order`.
- `product_option_groups`: `id`, `product_id`, `title` (ex: "Tamanho", "Recheio"), `type` (`single` | `multiple`), `required` (bool), `min_choices`, `max_choices`, `display_order`.
- `product_options`: `id`, `group_id`, `name`, `price_delta` (numeric), `available` (bool), `display_order`.
- `orders` *(Fase 2 - Registro de intenções/pedidos)*: `id`, `order_code`, `customer_name`, `customer_phone`, `delivery_type`, `address`, `scheduled_date`, `scheduled_window`, `payment_method`, `items_json`, `total_amount`, `status`, `created_at`.

---

## 6. Roadmap de Execução em Fases

1. **Fase 1 — Rebranding, Identidade & Base Limpa:**
   - Remover referências da marca anterior, configurar PWA/ícones da Dona Cá Doceria, aplicar nova paleta de cores, tipografia editorial e estrutura de rotas.
2. **Fase 2 — Banco de Dados & Painel Administrativo Mobile-First:**
   - Criar tabelas e buckets no novo projeto Supabase, implementar upload otimizado de mídia, switches rápidos de disponibilidade (`Pronta Entrega` / `Encomenda` / `Esgotado`) e cadastro de grupos de opções/recheios.
3. **Fase 3 — Vitrine Sensorial, Motion & Customizador de Produtos:**
   - Construir a Home de alto impacto, cards com badges inteligentes, modal de customização dinâmica (tamanhos, massas, recheios, adicionais) e suporte a preview em vídeo.
4. **Fase 4 — Sacola Inteligente, Regra de Antecedência & Checkout WhatsApp:**
   - Implementar cálculo automático de prazo mínimo de entrega com base nos itens da sacola, formatação limpa do pedido para WhatsApp e persistência opcional do histórico de pedidos no painel.
