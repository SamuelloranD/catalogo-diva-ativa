create table if not exists public.site_content (
  id text primary key check (id = 'home'),
  title text not null check (char_length(btrim(title)) between 1 and 14),
  highlight text not null check (char_length(btrim(highlight)) between 1 and 18),
  description text not null check (char_length(btrim(description)) between 1 and 80),
  button_label text not null check (char_length(btrim(button_label)) between 1 and 18)
);

insert into public.site_content (id, title, highlight, description, button_label)
values (
  'home',
  'Vista sua',
  'melhor versão.',
  'Do treino ao seu dia a dia, encontre o look que acompanha você.',
  'Explorar peças'
)
on conflict (id) do nothing;

alter table public.site_content enable row level security;

create policy "Public can read site content"
on public.site_content for select
to anon, authenticated
using (true);

create policy "Admins manage site content"
on public.site_content for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

notify pgrst, 'reload schema';
