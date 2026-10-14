-- Keep category_id as the existing primary category and mirror it in the join table.
create table if not exists public.product_categories (
  product_id uuid not null references public.products(id) on delete cascade,
  category_id uuid not null references public.categories(id) on delete cascade,
  primary key (product_id, category_id)
);

insert into public.product_categories (product_id, category_id)
select id, category_id from public.products
on conflict do nothing;

alter table public.products
  add column if not exists sizes jsonb,
  add column if not exists colors jsonb;

alter table public.products
  add constraint products_sizes_array check (sizes is null or jsonb_typeof(sizes) = 'array'),
  add constraint products_colors_array check (colors is null or jsonb_typeof(colors) = 'array');

alter table public.product_categories enable row level security;

create policy "Public can read active product categories"
on public.product_categories for select to anon, authenticated
using (exists (
  select 1 from public.products p join public.categories c on c.id = product_categories.category_id
  where p.id = product_categories.product_id and p.active and c.active
));

create policy "Admins manage product categories"
on public.product_categories for all to authenticated
using (public.is_admin()) with check (public.is_admin());

-- Make the new columns and table available to PostgREST immediately after this migration.
notify pgrst, 'reload schema';
