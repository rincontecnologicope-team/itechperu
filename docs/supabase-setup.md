# Supabase Setup (Panel Admin iTech Peru)

## 1) Crear proyecto y variables

En Supabase crea un proyecto nuevo y copia:

- `Project URL` -> `NEXT_PUBLIC_SUPABASE_URL`
- `service_role key` -> `SUPABASE_SERVICE_ROLE_KEY`

En Vercel agrega tambien:

- `ADMIN_PASSWORD`
- `ADMIN_SESSION_SECRET`
- `SUPABASE_BUCKET` (ej: `product-images`)

## 2) Crear tabla `products`

Ejecuta este SQL en `SQL Editor`:

```sql
create table if not exists public.products (
  id text primary key,
  slug text unique not null,
  name text not null,
  category text not null,
  summary text not null,
  highlights text[] not null default '{}',
  tags text[] not null default '{}',
  image text not null,
  badge_text text not null,
  badge_type text not null check (badge_type in ('offer', 'score', 'new')),
  condition_label text not null,
  price integer not null check (price >= 0),
  previous_price integer null check (previous_price >= 0),
  base_stock integer not null default 1 check (base_stock >= 1),
  is_new_arrival boolean not null default false,
  is_best_seller boolean not null default false,
  featured boolean not null default true,
  updated_at timestamptz not null default now()
);

create index if not exists products_featured_price_idx
  on public.products (featured desc, price desc);

create or replace function public.set_products_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_products_updated_at on public.products;
create trigger trg_products_updated_at
before update on public.products
for each row execute function public.set_products_updated_at();
```

## 3) Crear bucket de imagenes

En `Storage` crea bucket publico con nombre:

- `product-images` (o el valor de `SUPABASE_BUCKET`)

Si usas bucket privado, la URL publica no funcionara para el frontend.

## 4) Cargar datos iniciales (opcional)

Puedes migrar manualmente los productos actuales al panel admin:

1. Abre `/admin/login`
2. Crea o edita productos
3. Sube imagen y guarda

## 5) Seguridad recomendada

- Usa `service_role` solo en servidor (ya implementado en API route).
- No expongas `SUPABASE_SERVICE_ROLE_KEY` en frontend.
- Cambia `ADMIN_PASSWORD` periodicamente.
- Mantén `ADMIN_SESSION_SECRET` largo y aleatorio.
