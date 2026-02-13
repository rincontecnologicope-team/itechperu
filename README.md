# iTech Peru Frontend

Frontend ecommerce mobile-first para `iTech Peru`, optimizado para trafico de Facebook Marketplace y conversion inmediata por WhatsApp.

## Stack

- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- Framer Motion

## Scripts

```bash
npm run dev
npm run lint
npm run build
npm run start
npm run wait-deploy
```

`wait-deploy` revisa la URL productiva y emite un beep cuando responde `200`.

## Estructura principal

```text
src/
  app/
    admin/
    api/admin/
    page.tsx
    producto/[slug]/page.tsx
    layout.tsx
    sitemap.ts
    robots.ts
  components/
    layout/
    sections/
    ui/
  config/site.ts
  data/products.json
  lib/
  types/product.ts
public/
  products/
  og/
docs/
  supabase-setup.md
```

## Datos y escalabilidad

- Lectura publica del catalogo:
  - si hay Supabase configurado, usa DB remota.
  - si no hay Supabase, usa fallback local `src/data/products.json`.
- Panel admin (`/admin`) usa Supabase para guardar cambios en caliente.

## WhatsApp dinamico por producto

El enlace se genera desde `src/lib/whatsapp.ts` con formato:

`https://wa.me/519XXXXXXXX?text=Hola%20quiero%20informacion%20del%20[NOMBRE_PRODUCTO]%20precio%20S/%20[PRECIO]`

Configura el numero real con:

```bash
NEXT_PUBLIC_WHATSAPP_PHONE=519XXXXXXXX
```

## Panel Admin

- Login: `/admin/login`
- Dashboard: `/admin`
- Requiere `ADMIN_PASSWORD` y `ADMIN_SESSION_SECRET`.
- Requiere Supabase (tabla `products` + storage bucket).

Variables requeridas:

```bash
ADMIN_PASSWORD=define-una-contrasena-fuerte
ADMIN_SESSION_SECRET=define-un-secreto-largo-y-unico
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=tu-service-role-key
SUPABASE_BUCKET=product-images
```

Guia SQL completa en `docs/supabase-setup.md`.
