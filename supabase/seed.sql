insert into public.categories (name, slug, sort_order)
values
  ('Conjuntos', 'conjuntos', 10),
  ('Macaquinhos', 'macaquinhos', 20),
  ('Macacões', 'macacoes', 30),
  ('Blusas', 'blusas', 40),
  ('Croppeds', 'croppeds', 50),
  ('Saias', 'saias', 60),
  ('Casacos', 'casacos', 70),
  ('Casaquinhos', 'casaquinhos', 80)
on conflict (slug) do update set
  name = excluded.name,
  sort_order = excluded.sort_order,
  active = true;
