# Catálogo persistente e administração Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Migrar o catálogo para Supabase e entregar uma área `/admin` para autenticação, produtos, categorias e imagens.

**Architecture:** O frontend continua em TanStack Start/React. Um adaptador de catálogo usa Supabase quando configurado e os dados estáticos atuais como fallback local. Supabase Auth, Postgres, Storage e RLS protegem os dados; a área admin usa chamadas diretas autenticadas.

**Tech Stack:** TypeScript, React 19, TanStack Start/Router, TanStack Query, Supabase JS, Postgres, Supabase Storage, Vitest, Testing Library.

**Spec:** `docs/superpowers/specs/2026-10-08-catalog-admin-design.md`

## Global Constraints

- Manter o carrinho em React state e o pedido via WhatsApp no helper compartilhado.
- Não persistir checkout, estoque ou pagamentos.
- Não expor `service_role` no frontend.
- Usar RLS para autorização real, não apenas guards de rota.
- Não usar `<select>` nativo nos novos fluxos; reutilizar `CatalogDropdown`.
- Preservar o fallback estático quando as variáveis do Supabase não existirem.

---

### Task 1: Fundação de tipos, cliente Supabase e migrações

**Files:**
- Create: `src/lib/catalog-types.ts`
- Create: `src/lib/supabase.ts`
- Create: `src/lib/catalog-api.ts`
- Create: `.env.example`
- Create: `supabase/config.toml`
- Create: `supabase/migrations/20261008_catalog.sql`
- Create: `supabase/seed.sql`
- Modify: `package.json`
- Test: `src/lib/catalog-api.test.ts`

**Interfaces:**
- `CatalogProduct`, `CatalogCategory`, `CatalogImage`, `ProductInput` em `catalog-types.ts`.
- `supabase` exporta `SupabaseClient<Database> | null`.
- `isSupabaseConfigured(): boolean`.
- `listCategories()`, `listProducts()`, `createProduct()`, `updateProduct()`, `archiveProduct()`, `createCategory()`, `uploadProductImage()`, `deleteProductImage()` em `catalog-api.ts`.

- [ ] **Step 1: Escrever testes de tipos e fallback**
- [ ] **Step 2: Rodar `npm test -- src/lib/catalog-api.test.ts` e confirmar falha por módulos ausentes**
- [ ] **Step 3: Instalar `@supabase/supabase-js` e implementar cliente opcional e adaptador**
- [ ] **Step 4: Criar `.env.example` e migração SQL com tabelas, triggers, bucket e policies RLS**
- [ ] **Step 5: Criar seed inicial de categorias**
- [ ] **Step 6: Rodar o teste da task e confirmar fallback/configuração**

### Task 2: Migrar o catálogo público para a fonte dinâmica

**Files:**
- Modify: `src/routes/index.tsx`
- Modify: `src/lib/catalog-types.ts`
- Create: `src/hooks/use-catalog.ts`
- Test: `src/test/catalog-database-fallback.test.tsx`

**Interfaces:**
- `useCatalog(fallbackProducts, fallbackCategories)` retorna `{ products, categories, loading, error, source }`.
- A tela usa `categories` para filtros e `products` para cards, detalhes e imagens da sacola.

- [ ] **Step 1: Testar que a tela mantém fallback sem variáveis Supabase**
- [ ] **Step 2: Rodar o teste e confirmar falha pela ausência do hook**
- [ ] **Step 3: Implementar o hook com carregamento assíncrono e fallback**
- [ ] **Step 4: Substituir arrays estáticos usados pelo filtro por dados do hook**
- [ ] **Step 5: Adicionar estados de carregamento/erro sem remover o fallback local**
- [ ] **Step 6: Rodar todos os testes do catálogo**

### Task 3: Autenticação e layout `/admin`

**Files:**
- Create: `src/routes/admin.tsx`
- Create: `src/components/admin/admin-login.tsx`
- Create: `src/components/admin/admin-shell.tsx`
- Create: `src/lib/admin-auth.ts`
- Test: `src/test/admin-auth.test.tsx`
- Test: `src/test/app-routing.test.tsx`

**Interfaces:**
- `signInAdmin(email, password)` autentica com Supabase Auth e exige perfil admin.
- `signOutAdmin()` encerra a sessão.
- `AdminRoute` exibe login sem sessão e dashboard quando autenticado.

- [ ] **Step 1: Escrever teste para `/admin` sem sessão e login**
- [ ] **Step 2: Rodar o teste e confirmar falha**
- [ ] **Step 3: Implementar autenticação, sessão e proteção visual da rota**
- [ ] **Step 4: Gerar novamente a árvore do TanStack Router**
- [ ] **Step 5: Rodar testes de roteamento e admin**

### Task 4: CRUD de categorias e produtos

**Files:**
- Create: `src/components/admin/product-table.tsx`
- Create: `src/components/admin/product-form.tsx`
- Create: `src/components/admin/category-manager.tsx`
- Modify: `src/routes/admin.tsx`
- Test: `src/test/admin-products.test.tsx`

**Interfaces:**
- `ProductForm` recebe `product?: CatalogProduct`, `categories`, `onSaved`, `onCancel`.
- `CategoryManager` recebe `categories` e `onCreated`.
- O formulário usa `CatalogDropdown` para categoria.

- [ ] **Step 1: Escrever testes para criar/editar/arquivar e adicionar categoria**
- [ ] **Step 2: Rodar testes e confirmar falha**
- [ ] **Step 3: Implementar tabela, formulário e manager de categorias**
- [ ] **Step 4: Integrar mutations e invalidação do catálogo**
- [ ] **Step 5: Rodar testes de admin**

### Task 5: Upload e gerenciamento de imagens

**Files:**
- Create: `src/components/admin/product-image-uploader.tsx`
- Modify: `src/components/admin/product-form.tsx`
- Modify: `src/lib/catalog-api.ts`
- Test: `src/test/admin-images.test.tsx`
- Create: `scripts/seed-catalog.mjs`

**Interfaces:**
- `ProductImageUploader` aceita imagens existentes e arquivos novos.
- Valida MIME `image/*` e tamanho máximo de 6 MB.
- Permite preview, remoção e reordenação antes de salvar.
- O script de seed lê o manifesto atual, envia imagens e cria registros.

- [ ] **Step 1: Escrever testes de validação, preview e remoção**
- [ ] **Step 2: Rodar testes e confirmar falha**
- [ ] **Step 3: Implementar uploader e integração com Storage**
- [ ] **Step 4: Implementar limpeza de arquivos removidos e posições**
- [ ] **Step 5: Criar script de migração dos produtos/imagens atuais**
- [ ] **Step 6: Rodar testes de imagens**

### Task 6: Verificação final e documentação operacional

**Files:**
- Modify: `README.md`
- Modify: `roadmap.md`
- Test: all existing tests

- [ ] **Step 1: Documentar variáveis, Supabase CLI, migrações, seed e criação do primeiro admin**
- [ ] **Step 2: Rodar `npm test`**
- [ ] **Step 3: Rodar `npm run lint`**
- [ ] **Step 4: Rodar `npm run build`**
- [ ] **Step 5: Verificar que não há `<select>` nativo nos novos fluxos**
