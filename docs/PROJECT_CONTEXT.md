# PROJECT_CONTEXT

## Frontend publico

- Home y detalle de producto en App Router (`src/app/page.tsx`, `src/app/producto/[slug]/page.tsx`).
- Catalogo consume Firebase cuando hay variables de entorno; si no, usa fallback JSON local.
- Secciones adicionales de conversion en home:
  - Testimonios con slider y scroll snap
  - Metodos de pago
  - FAQ con acordeon
- Conversion WhatsApp reforzada:
  - Mensaje de WhatsApp por producto incluye modelo, almacenamiento, color y link directo del producto.
  - CTA sticky en detalle de producto para movil (`src/components/ui/product-sticky-whatsapp-bar.tsx`).
  - Tracking diferenciado por origen (`product_detail_whatsapp`, `product_detail_sticky_whatsapp`, etc.).

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
- Modelo de imagenes de producto escalable:
  - `images: [{ url, order, isPrimary }]`
  - compatibilidad legacy con `image` como url principal
  - utilidades en `src/lib/product-images.ts`
- Atributos comerciales editables por producto:
  - `storage` (ej. 256GB)
  - `colors: [{ name, hex, order }]` con picker RGB en admin
  - fallback desde descripcion para mostrar datos cuando el producto antiguo no tenga campos nuevos
- Capa de storage desacoplada para imagenes de producto:
  - `src/lib/product-image-storage.ts`
  - proveedor configurable via `IMAGE_STORAGE_PROVIDER` (`firebase` actual, preparado para `cloudinary`/`supabase`)
- Performance de imagenes:
  - Compresion cliente antes de upload en admin (`src/components/admin/product-images-manager.tsx`)
  - Convierte a WebP y limita lado maximo para acelerar carga en movil.
