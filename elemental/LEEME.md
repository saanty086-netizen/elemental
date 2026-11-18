# Catálogo Elemental conectado a Firebase

## Qué hay en la carpeta
- `index.html`, `app.js`, `style.css`, `datos-base.js` → el catálogo público
- `admin/index.html` → el panel para editar (entrás en `tu-sitio/admin/`)
- `imagenes/` → carpeta de fotos (ya están las 21 fotos del catálogo original)
- `firebase-config.js` → **el único archivo que tenés que completar**
- `firestore.rules` y `storage.rules` → reglas de seguridad para pegar en la consola

## Pasos (todo desde la consola de Firebase, sin comandos)

1. **Crear el proyecto**: console.firebase.google.com → Agregar proyecto (ej. "elemental-catalogo").
2. **Registrar la app web**: Configuración del proyecto (engranaje) → Tus apps → ícono `</>` → copiá el `firebaseConfig` y pegalo en `firebase-config.js` reemplazando todos los `TU_...`.
3. **Authentication** → Comenzar → Método de acceso → activar **Correo electrónico/contraseña** → pestaña Usuarios → **Agregar usuario** (tu correo y una contraseña). Ese es tu acceso al panel.
4. **Firestore Database** → Crear base de datos → modo producción → Reglas → pegá el contenido de `firestore.rules` **cambiando `TU_CORREO@gmail.com` por tu correo** → Publicar.
5. **Subir el sitio** a GitHub (igual que NEXO): subí todos los archivos y carpetas de este ZIP a un repositorio y activá Pages. (Firebase Hosting necesita comandos, por eso recomiendo GitHub Pages.)
6. Entrá a `tu-sitio/admin/`, ingresá, editá lo que quieras y tocá **Guardar cambios**. El catálogo público se actualiza solo.

Hasta que toques "Guardar cambios" por primera vez, el catálogo muestra los datos originales.

## Imágenes
**Opción gratis (la que viene activada):** subí las fotos nuevas a la carpeta `imagenes/` del repositorio (GitHub → Add file → Upload files). Para que el panel te las muestre solas, completá `GITHUB_REPO` en `firebase-config.js` (ej. `"tuusuario/elemental"`, repositorio público). Si no, igual podés escribir la ruta a mano (`imagenes/mi-foto.jpg`) en el selector.

**Opción con subida desde el panel:** Firebase Storage. Google ahora lo exige con plan Blaze (hay que cargar una tarjeta; el uso chico entra en la cuota gratis). Si lo activás: Storage → Comenzar → Reglas → pegá `storage.rules` (con tu correo) y en `firebase-config.js` poné `USAR_STORAGE: true`.

## Qué podés editar en el panel
- **Secciones**: ordenar, ocultar, renombrar y **crear nuevas** (tarjetas, texto + imagen, galería, lista).
- **Casas / Quinchos**: datos, qué incluye, fotos (la primera es la principal), duplicar, borrar, agregar.
- **Contenido**: tarjetas de construcción en seco, comparativa, ampliaciones, proceso, formas de pago.
- **Textos**: todos los títulos y frases fijas.
- **Datos del sitio**: WhatsApp, teléfono, Instagram, correo, zona, plazo.
- Cada guardado deja la versión anterior como respaldo (se recupera en "Datos del sitio").

## Para revisar
- El WhatsApp del catálogo original quedó como `https://wa.me/` (incompleto): completalo en "Datos del sitio" (ej. `https://wa.me/5492634485040`).
- El texto de Formas de pago dice "Condiciones de ejemplo: completar con las reales." (Textos → Formas de pago).
