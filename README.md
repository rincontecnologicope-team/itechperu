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
```

## Estructura principal

```text
src/
  app/
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
```

## Datos y escalabilidad

- Catalogo actual en `src/data/products.json`.
- Capa de acceso en `src/lib/catalog-repository.ts`.
- Preparado para reemplazar JSON por DB sin tocar componentes UI.

## WhatsApp dinamico por producto

El enlace se genera desde `src/lib/whatsapp.ts` con formato:

`https://wa.me/519XXXXXXXX?text=Hola%20quiero%20informacion%20del%20[NOMBRE_PRODUCTO]%20precio%20S/%20[PRECIO]`

Configura el numero real con:

```bash
NEXT_PUBLIC_WHATSAPP_PHONE=519XXXXXXXX
```
