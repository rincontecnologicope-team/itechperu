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
  firebase-setup.md
```

## Datos y escalabilidad

- Lectura publica del catalogo:
  - si hay Firebase configurado, usa Firestore remoto.
  - si no hay Firebase, usa fallback local `src/data/products.json`.
- Panel admin (`/admin`) usa Firebase para guardar cambios en caliente.

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
- Requiere Firebase Firestore.
- Para imagenes: soporta Firebase Storage o Cloudinary.
- Permite:
  - CRUD de productos (nombre, precio, stock, descripcion e imagen)
  - Edicion directa de textos de la landing principal (hero, catalogo, confianza, urgencia)
  - Subida de imagen del hero para la home

Variables requeridas:

```bash
ADMIN_PASSWORD=define-una-contrasena-fuerte
ADMIN_SESSION_SECRET=define-un-secreto-largo-y-unico
FIREBASE_PROJECT_ID=itechperu-1d1d4
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxx@itechperu-1d1d4.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
IMAGE_STORAGE_PROVIDER=cloudinary
CLOUDINARY_CLOUD_NAME=tu-cloud-name
CLOUDINARY_UPLOAD_PRESET=tu-upload-preset
CLOUDINARY_UPLOAD_FOLDER=itechperu/products
```

Guia completa en `docs/firebase-setup.md`.
