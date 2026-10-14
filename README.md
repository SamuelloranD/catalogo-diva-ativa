# Diva Ativa

Catálogo de moda fitness com gerenciamento administrativo, imagens no Supabase e pedidos via WhatsApp.

## Desenvolvimento

Você precisa de Node.js e npm.

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```

## Built with

- TanStack Start
- TypeScript
- React
- Tailwind CSS

## Catálogo e administração

O catálogo usa os dados locais como fallback quando o Supabase não está configurado. Com as variáveis abaixo, ele passa a ler produtos, categorias e imagens do Supabase:

```sh
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=sua-chave-publica
```

Copie `.env.example` para `.env` e preencha os valores. A chave `service_role` nunca deve ser colocada em `.env` do frontend.

### Configuração do Supabase

1. Crie um projeto no Supabase.
2. Aplique, em ordem, `supabase/migrations/20261008_catalog.sql`, `supabase/migrations/20261010_product_price.sql` e `supabase/migrations/20261014_product_variations.sql` no projeto Supabase correspondente ao `.env`. Para um projeto gerenciado com Supabase CLI, use as migrações da CLI; em uma configuração manual, execute cada arquivo uma vez no SQL Editor.
3. Execute `supabase/seed.sql` para criar as categorias iniciais.
4. Crie o primeiro usuário em Authentication > Users.
5. Insira o UUID desse usuário em `public.profiles`:

```sql
insert into public.profiles (id, role)
values ('UUID_DO_USUARIO_AUTH', 'admin');
```

Depois disso, acesse `/admin` para entrar e gerenciar produtos, categorias e imagens.

No painel, **Produtos** reúne busca, filtros, ordenação, paginação e arquivamento individual ou em lote. **Categorias** mostra os vínculos com produtos e permite buscar, criar, renomear e excluir categorias. A criação e edição de produtos acontece em uma tela própria, organizada por informações gerais, categorias, variações e fotos; no celular, o formulário usa abas para essas seções.

Quando o produto tem cores, marque os tamanhos disponíveis em cada cor. O campo `products.sizes` guarda a união desses tamanhos e cada item de `products.colors` guarda sua própria lista `sizes`. Produtos antigos sem `sizes` dentro das cores continuam oferecendo todos os tamanhos gerais em cada cor até serem editados. Esta estrutura usa a coluna JSONB `colors` da migração existente; não exige outra migração.

Se salvar um produto retornar `PGRST204` para `sizes` ou `colors`, ou `PGRST205` para `product_categories`, confirme que a migração `20261014_product_variations.sql` foi aplicada ao mesmo projeto Supabase configurado no `.env`. A migração já solicita a atualização do cache de esquema do PostgREST ao final. Se as colunas e a tabela já existirem, mas o erro persistir, execute `notify pgrst, 'reload schema';` no SQL Editor e tente novamente. A segunda categoria só pode ser gravada depois que a tabela `product_categories` existir.

### Importar o catálogo atual

O script abaixo importa as 22 peças e as imagens existentes no repositório. Ele exige a chave `service_role` somente no terminal, pois precisa gravar no Storage durante a migração:

```sh
VITE_SUPABASE_URL=https://seu-projeto.supabase.co \
SUPABASE_SERVICE_ROLE_KEY=sua-service-role-key \
npm run seed:catalog
```

No PowerShell:

```powershell
$env:VITE_SUPABASE_URL = "https://seu-projeto.supabase.co"
$env:SUPABASE_SERVICE_ROLE_KEY = "sua-service-role-key"
npm run seed:catalog
```

O carrinho continua em estado React e os pedidos continuam sendo montados pelo helper de WhatsApp existente.

### Deploy

O frontend pode ser publicado na Vercel, Cloudflare ou no hosting do Lovable. Em qualquer opção, configure `VITE_SUPABASE_URL` e `VITE_SUPABASE_PUBLISHABLE_KEY` nas variáveis de ambiente do projeto. O Supabase permanece como serviço separado para banco, autenticação e Storage; não é necessário criar outro backend para esta arquitetura.
