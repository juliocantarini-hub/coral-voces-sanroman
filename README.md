# Coral Voces — Guía de instalación y deploy

Web app para coros: repertorio con Google Drive, calendario, asistencias, avisos y blog.

---

## Stack

| Capa | Tecnología |
|---|---|
| Frontend | React 18 + Vite + React Router |
| Backend / Auth | Supabase (PostgreSQL + Auth) |
| Archivos | Google Drive (PDFs y audios) |
| Hosting | Vercel |

Todo en capa gratuita hasta ~500 usuarios activos.

---

## 1. Configurar Supabase

1. Crear cuenta en [supabase.com](https://supabase.com) y crear un nuevo proyecto.
2. Ir a **SQL Editor** y ejecutar el archivo `supabase-completo.sql` completo.
3. Anotar en **Settings → API**:
   - `Project URL` → `VITE_SUPABASE_URL`
   - `anon public key` → `VITE_SUPABASE_ANON_KEY`

### Primer usuario administrador

Después de crear tu primera cuenta desde la app, ejecutar en el SQL Editor:

```sql
UPDATE perfiles
SET rol = 'admin'
WHERE id = (
  SELECT id FROM auth.users WHERE email = 'tu-email@ejemplo.com'
);
```

### Activar login con Google (opcional)

1. En Supabase: **Authentication → Providers → Google → Enable**.
2. En [console.cloud.google.com](https://console.cloud.google.com):
   - Crear proyecto → habilitar **Google Drive API** y **Google+ API**.
   - Crear credencial OAuth 2.0 → tipo "Aplicación web".
   - Agregar en "Orígenes autorizados": `https://tu-proyecto.supabase.co`
   - Agregar en "URIs de redireccionamiento": `https://tu-proyecto.supabase.co/auth/v1/callback`
3. Pegar Client ID y Client Secret en Supabase → Google provider.

---

## 2. Configurar Google Drive

1. En Google Drive, crear la carpeta raíz del coro.
2. Subir partituras (PDF) y audios (MP3) organizados por obra.
3. Para cada archivo: clic derecho → **Compartir** → "Cualquiera con el enlace puede ver".
4. Al crear una obra en el panel admin, pegar la URL completa del archivo.  
   La app extrae el ID automáticamente.

### Estructura recomendada de carpetas

```
📁 Coral Voces (raíz)
  📁 Repertorio
    📁 Ave Verum Corpus — Mozart
      📄 partitura.pdf
      🎵 audio-general.mp3
      🎵 audio-soprano.mp3
      🎵 audio-contralto.mp3
      🎵 audio-tenor.mp3
      🎵 audio-bajo.mp3
  📁 Blog
  📁 Recursos generales
```

---

## 3. Instalar y correr en local

```bash
# Clonar o descomprimir el proyecto
cd coral-voces

# Instalar dependencias
npm install

# Crear archivo de variables de entorno
cp .env.example .env.local
# Editar .env.local con tus claves de Supabase

# Correr en desarrollo
npm run dev
```

Abrir [http://localhost:5173](http://localhost:5173)

---

## 4. Deploy en Vercel

```bash
# Instalar Vercel CLI (si no está instalado)
npm install -g vercel

# Deploy desde la carpeta del proyecto
vercel

# En el wizard:
# - Framework: Vite
# - Build command: npm run build
# - Output directory: dist
```

### Variables de entorno en Vercel

En el dashboard de Vercel → tu proyecto → **Settings → Environment Variables**:

```
VITE_SUPABASE_URL        = https://xxxx.supabase.co
VITE_SUPABASE_ANON_KEY   = eyJ...
```

> ⚠️ Las variables con prefijo `VITE_` son públicas (van al bundle del navegador).  
> Nunca poner `SUPABASE_SERVICE_ROLE_KEY` como variable `VITE_`.

---

## 5. Estructura del proyecto

```
coral-voces/
├── src/
│   ├── lib/
│   │   └── supabase.js              # Cliente Supabase
│   ├── hooks/
│   │   ├── useAuth.jsx              # Auth completa
│   │   ├── useObras.js              # Repertorio
│   │   ├── useEventos.js            # Calendario
│   │   ├── useAvisos.js             # Notificaciones
│   │   └── useBlog.js               # Blog
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Sidebar.jsx          # Navegación lateral
│   │   │   └── AppLayout.jsx        # Layout con sidebar
│   │   ├── ui/
│   │   │   └── AuthUI.jsx           # Componentes de formulario
│   │   ├── drive/
│   │   │   └── DriveComponents.jsx  # Visor PDF + reproductor audio
│   │   └── RutaProtegida.jsx        # Guard de rutas
│   ├── pages/
│   │   ├── auth/                    # Login, Registro, Recuperar, Reset
│   │   ├── repertorio/              # Lista obras + Detalle de obra
│   │   ├── calendario/              # Calendario + Detalle de evento
│   │   ├── avisos/                  # Centro de notificaciones
│   │   ├── blog/                    # Blog + Artículo
│   │   ├── perfil/                  # Perfil del cantante
│   │   ├── admin/                   # Dashboard, Usuarios, Obras,
│   │   │                            # Eventos, Avisos, Blog
│   │   └── Inicio.jsx               # Panel de inicio
│   ├── App.jsx                      # Rutas completas
│   └── main.jsx                     # Entry point
├── supabase-completo.sql            # SQL listo para ejecutar
├── .env.example                     # Variables de entorno de ejemplo
├── package.json
└── vite.config.js
```

---

## 6. Roles de usuario

| Rol | Puede |
|---|---|
| **cantante** | Ver repertorio, calendario, avisos, blog. Confirmar asistencia. Marcar obras como estudiadas. |
| **director** | Todo lo de cantante + crear/editar obras, eventos, avisos y artículos. Ver asistencias completas. |
| **admin** | Todo lo anterior + gestionar usuarios y cambiar roles. Eliminar contenido. |

---

## 7. Checklist antes de lanzar

- [ ] SQL ejecutado completamente en Supabase
- [ ] Primer usuario admin asignado manualmente
- [ ] Variables de entorno configuradas en Vercel
- [ ] Login con Google probado en dominio de producción
- [ ] Al menos 2 obras con partitura y audios cargados para probar el flujo
- [ ] Un evento publicado para probar asistencias
- [ ] Probado en móvil (Chrome Android y Safari iOS)
- [ ] Correos de recuperación de contraseña llegando (revisar spam)

---

## 8. Próximas mejoras sugeridas (Fase 6+)

- Push notifications en móvil (Web Push API)
- Modo offline para partituras descargadas
- Estadísticas de estudio por cantante
- App nativa (React Native / Capacitor)
- Integración con Google Calendar para sincronizar eventos
- Pagos de cuotas (Stripe)

---

*Coral Voces · MVP v1.0 · Generado con Claude*
