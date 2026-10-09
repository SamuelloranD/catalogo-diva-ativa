# Catálogo persistente e administração — especificação

## Objetivo

Migrar produtos, categorias e imagens do catálogo estático para Supabase, mantendo o carrinho em React state e o fechamento de pedidos via WhatsApp. Criar uma área `/admin` com autenticação e gerenciamento de produtos.

## Escopo funcional

- Visitantes consultam categorias e produtos ativos.
- Administrador entra por e-mail e senha.
- Administrador cria, edita, arquiva e reativa produtos.
- Produto possui nome, categoria, marca, descrição, rótulo de cor, tag e imagens ordenadas.
- Administrador pode selecionar categoria existente ou criar uma nova.
- Imagens são enviadas para Supabase Storage; o banco guarda apenas seus metadados.
- A categoria visual “Todas as peças” não é persistida.
- O carrinho permanece em React state.
- O helper de WhatsApp continua sendo a origem do link de pedido.

## Arquitetura

Supabase concentra Postgres, Auth e Storage. O frontend usa a chave pública do projeto e acessa os dados diretamente com políticas RLS. O catálogo público lê apenas registros ativos; mutations administrativas exigem uma sessão cujo perfil tenha `role = 'admin'`.

Quando as variáveis do Supabase não estão configuradas localmente, o catálogo mantém os dados estáticos atuais como fallback para desenvolvimento e testes. Em produção, com as variáveis configuradas, o banco é a fonte principal.

## Modelo de dados

### `categories`

- `id uuid primary key`
- `name text not null unique`
- `slug text not null unique`
- `active boolean not null default true`
- `sort_order integer not null default 0`
- `created_at timestamptz not null default now()`
- `updated_at timestamptz not null default now()`

### `products`

- `id uuid primary key`
- `name text not null`
- `category_id uuid not null references categories(id)`
- `brand text not null default 'Diva Ativa'`
- `description text not null default ''`
- `color_label text not null default 'Cores disponíveis'`
- `tag text not null default ''`
- `active boolean not null default true`
- `sort_order integer not null default 0`
- `created_at timestamptz not null default now()`
- `updated_at timestamptz not null default now()`

### `product_images`

- `id uuid primary key`
- `product_id uuid not null references products(id) on delete cascade`
- `storage_path text not null unique`
- `position integer not null default 0`
- `alt_text text not null default ''`
- `created_at timestamptz not null default now()`

### `profiles`

- `id uuid primary key references auth.users(id) on delete cascade`
- `role text not null default 'admin' check (role in ('admin'))`
- `created_at timestamptz not null default now()`

## Segurança

- `categories`, `products` e `product_images`: leitura pública apenas para registros ativos.
- Escrita, edição, arquivamento e exclusão de imagens: somente `profiles.role = 'admin'`.
- Storage usa o bucket `catalog-images`, com leitura pública e mutações restritas a admins.
- Nenhuma chave `service_role` é enviada ao frontend.
- Upload aceita apenas imagens até 6 MB no fluxo inicial.
- Produtos são arquivados com `active = false`; exclusão definitiva não faz parte do primeiro release.

## Critérios de aceite

1. O catálogo continua funcionando sem configuração local do Supabase.
2. Com Supabase configurado, categorias, produtos e imagens vêm do banco/Storage.
3. Usuário anônimo não consegue inserir ou editar dados via API.
4. Admin consegue entrar, criar produto, enviar imagens e visualizar o produto no catálogo.
5. Admin consegue editar nome/categoria/metadados e reordenar ou remover imagens.
6. Pedidos via WhatsApp continuam usando `addOrderLine` e `whatsappOrderUrl`.
7. Testes, lint e build passam.
