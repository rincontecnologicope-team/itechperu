# Firebase Setup (Panel Admin iTech Peru)

## 1) Habilitar Firestore y Storage

En Firebase Console:

1. Abre el proyecto `itechperu-1d1d4`.
2. Crea Firestore Database (modo produccion).
3. Habilita Firebase Storage.

## 2) Variables de entorno en Vercel

Define estas variables en el proyecto:

```bash
ADMIN_PASSWORD=define-una-contrasena-fuerte
ADMIN_SESSION_SECRET=define-un-secreto-largo-y-unico
FIREBASE_PROJECT_ID=itechperu-1d1d4
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxx@itechperu-1d1d4.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
FIREBASE_STORAGE_BUCKET=itechperu-1d1d4.firebasestorage.app
NEXT_PUBLIC_FIREBASE_API_KEY=AIza...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=itechperu-1d1d4.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=itechperu-1d1d4
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=itechperu-1d1d4.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=340682935398
NEXT_PUBLIC_FIREBASE_APP_ID=1:340682935398:web:8f7b6e425dbd7c961631a7
```

## 3) Obtener credenciales Admin SDK

En Firebase Console:

1. `Project settings` -> `Service accounts`
2. `Generate new private key`
3. Usa el JSON para llenar:
   - `project_id` -> `FIREBASE_PROJECT_ID`
   - `client_email` -> `FIREBASE_CLIENT_EMAIL`
   - `private_key` -> `FIREBASE_PRIVATE_KEY`

Para `FIREBASE_PRIVATE_KEY`, conserva los saltos con `\n`.

## 4) Estructura de datos (Firestore)

Coleccion: `products`  
Documento por producto (ID igual a `id` del producto), campos:

- `id` string
- `slug` string
- `name` string
- `category` string
- `summary` string
- `highlights` string[]
- `tags` string[]
- `image` string
- `badgeText` string
- `badgeType` ("offer" | "score" | "new")
- `conditionLabel` string
- `price` number
- `previousPrice` number|null
- `baseStock` number
- `isNewArrival` boolean
- `isBestSeller` boolean
- `featured` boolean

## 5) Uso del panel

1. Abre `/admin/login`
2. Ingresa `ADMIN_PASSWORD`
3. En `/admin` crea/edita/elimina productos
4. Sube fotos desde el panel (Storage)
