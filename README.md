# Fundación INNOVALIA — Sitio web

Sitio institucional de la **Fundación INNOVALIA (INNOVALIA)** con panel de administración para
publicar estados financieros, registro de accesos y notificaciones por correo.

Construido con **Next.js 14 + Firebase (Auth, Firestore, Storage) + Tailwind**, desplegable en **Vercel**.

---

## Puesta en marcha (solo conectar servicios)

### 1. Firebase
1. Crea un proyecto en [console.firebase.google.com](https://console.firebase.google.com).
2. Activa **Authentication → Sign-in method → Correo electrónico/contraseña**.
3. Activa **Firestore Database** (modo producción) y **Storage**.
4. En **Configuración del proyecto → Tus apps → Web**, copia las credenciales del cliente.
5. En **Configuración → Cuentas de servicio → Generar nueva clave privada** (Admin SDK).
6. Despliega las reglas (desde la consola, pega el contenido de [`firestore.rules`](firestore.rules) y [`storage.rules`](storage.rules)).

### 2. Variables de entorno
Copia `.env.local.example` a `.env.local` y rellena los valores:

```bash
cp .env.local.example .env.local
```

| Variable | De dónde sale |
|----------|----------------|
| `NEXT_PUBLIC_FIREBASE_*` | Configuración web de Firebase |
| `FIREBASE_ADMIN_*` | Clave privada del Admin SDK (service account) |
| `RESEND_API_KEY` | [resend.com](https://resend.com) — opcional, para correos |
| `RESEND_FROM` | Remitente verificado en Resend |
| `NEXT_PUBLIC_SITE_URL` | URL pública del sitio (ej. el dominio real) |

### 3. Instalar y correr
```bash
npm install
npm run dev      # http://localhost:3000
```

### 4. Crear el primer administrador
Con `.env.local` configurado:

```bash
node scripts/seed-admin.mjs correo@dominio.com TuContraseña "Nombre Completo"
```

Crea el usuario en Firebase Auth (si no existe) y lo registra como admin. Luego inicia sesión en
`/admin/login`.

### 5. Desplegar en Vercel
1. Sube este repo a GitHub.
2. En [vercel.com](https://vercel.com) → **New Project** → importa el repo.
3. Agrega **todas** las variables de entorno (mismas que `.env.local`).
4. Deploy. Para conectar tu dominio: **Settings → Domains**.

---

## Funcionalidades
- Página institucional (objeto social, visión, líneas de acción, contacto).
- **Estados financieros**: el admin sube PDFs por año; el público los ve/descarga.
- **Registro de accesos** (silencioso): IP, ubicación, dispositivo, etc. — pestaña *Accesos*.
- **Notificación por correo** a los administradores en cada descarga (requiere Resend).
- Gestión de administradores.

## Notas
- Las notificaciones por correo son opcionales: si `RESEND_API_KEY` está vacío, el sitio funciona igual.
- La geolocalización de accesos solo está disponible en producción (Vercel).
- Al recolectar datos de acceso (IP, ubicación), publica un **aviso de privacidad** conforme a la Ley 1581 de 2012 (Habeas Data).
