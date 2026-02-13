# PROJECT_CONTEXT

## Frontend publico

- Home y detalle de producto en App Router (`src/app/page.tsx`, `src/app/producto/[slug]/page.tsx`).
- Catalogo consume Firebase cuando hay variables de entorno; si no, usa fallback JSON local.

## Panel admin

- Login: `src/app/admin/login/page.tsx`
- Dashboard CRUD: `src/app/admin/page.tsx`
- Componente cliente: `src/components/admin/admin-dashboard.tsx`

## API admin

- `POST /api/admin/login`
- `POST /api/admin/logout`
- `GET|PUT|DELETE /api/admin/products`
- `POST /api/admin/upload`
- `GET|PUT /api/admin/landing`

## Seguridad

- Cookie de sesion firmada con HMAC (`src/lib/admin-auth.ts`)
- Variables: `ADMIN_PASSWORD` y `ADMIN_SESSION_SECRET`

## Datos

- Acceso a catalogo y storage via Firebase (`src/lib/catalog-firebase.ts`)
- Contenido editable de landing (`src/lib/landing-content.ts`, doc `site_content/landing`)
- Normalizacion de payload admin (`src/lib/product-input.ts`)
