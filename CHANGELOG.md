# Registro de Cambios - Solo a un Click

## Conexiones y Credenciales
> Las credenciales (SSH, MySQL, GitHub token) están en `CREDENCIALES.md` (no sube a git)

### Estado del Servidor
- **Hostname:** portalestudiantil
- **Instalado:** Node.js, PM2, MySQL, Nginx
- **Proyecto en:** /var/www/soloaunclick
- **Nginx:** proxy /api/ → Express:3001, frontend desde dist/, uploads desde backend/uploads/
- **PM2:** soloaunclick-api (ecosystem.config.js con env vars en servidor, NO en git)
- **API puerto:** 3001
- **Disco:** 5.1GB usados / 20GB
- **RAM:** 957MB total
- **Nota:** dotenv NO funciona con PM2, usar credenciales directas
- **Nota:** No hay Node.js en WSL, usar SSH para ejecutar comandos en el servidor

### Base de Datos MySQL
- **Nombre BD:** soloaunclick
- **Charset:** utf8mb4_unicode_ci
- **Tablas creadas (6):**
  1. `plans` — 3 planes: Gratis (5 listings), Básico (20), Premium (100, con página propia)
  2. `users` — tipo_cuenta: general/turismo, campos vende_productos/ofrece_servicios/ofrece_arriendos
  3. `listings` — tabla única para productos/servicios/arriendos/turismo, badge solo para productos
  4. `listing_images` — 1 imagen por publicación, ON DELETE CASCADE
  5. `listing_sizes` — tallas ropa/calzado/accesorios, ON DELETE CASCADE
  6. `listing_dimensions` — medidas alto/ancho/profundidad, ON DELETE CASCADE
- **Regla badge:** solo tipo='producto' usa badge (Liquidación, Oferta, etc.), servicios/arriendos van directo a su sección
- **Restricción admin:** campos vende_productos/ofrece_servicios/ofrece_arriendos determinan qué pestañas ve cada usuario
- **Sin tabla stores:** solo 2 tipos de usuario (general y turismo)
- **Precios planes:** aún en $0, se definen después

### Backend API (Express + MySQL)
- **Archivos:** `backend/server.js`, `backend/db.js`, `backend/routes/auth.js`, `backend/routes/listings.js`, `backend/routes/upload.js`
- **Auth:** registro (POST /api/auth/register), login (POST /api/auth/login), datos usuario (GET /api/auth/me)
- **Listings:** listar públicas (GET /api/listings), mis publicaciones (GET /api/listings/mine), crear (POST), editar (PUT /:id), eliminar (DELETE /:id)
- **Upload:** subir imagen (POST /api/upload), máximo 5MB, solo jpg/png/webp
- **Seguridad:** JWT (7 días), bcrypt para passwords, validación de propiedad al editar/eliminar
- **Validaciones:** límite de listings según plan, badge solo para tipo='producto'
- **Credenciales:** via variables de entorno (ecosystem.config.js en servidor)
- **CREDENCIALES.md:** archivo local con SSH, MySQL y GitHub token (en .gitignore, NO sube a git)

---

## 10 de Marzo 2026 - Estadísticas, Analytics, Restricciones Plan Gratis y Mejoras UI

### Nueva Sección: Estadísticas (`AdminEstadisticas.jsx`)
- KPIs por sección (Destacados, Ofertas, Novedades, etc.) filtrados por permisos del usuario
- Barras de uso del plan: Publicaciones, Carrusel, Banner, Total (con colores según nivel de uso)
- Gráfico de barras SVG: visitas mensuales a la página premium (últimos 6 meses)
- Gráfico de líneas SVG: clicks en productos (últimos 6 meses)
- Layout grid 2x2, todo responsive
- Ruta `/admin/estadisticas` agregada en `main.jsx`
- Nuevo item "Estadísticas" en AdminSidebar

### Sistema de Analytics (Backend + Frontend)
- **Nueva tabla MySQL:** `analytics` (id, user_id, event_type, listing_id, created_at) con índices
- **Nuevo endpoint:** `POST /api/analytics/track` — registra page_view y product_click (público)
- **Nuevo endpoint:** `GET /api/analytics/stats` — estadísticas mensuales del usuario autenticado (últimos 6 meses)
- **Nuevo archivo:** `backend/routes/analytics.js` registrado en `server.js`
- **Tracking en StorePage:** page_view al cargar la página premium, product_click al clickear en banner/carrusel
- **Tracking en ProductCard:** product_click al abrir modal de producto
- Props `storeUserId` propagado a StoreBanner e ImageMarquee para asociar clicks al dueño

### Restricción Plan Gratis en Sidebar
- Plan Gratis (plan_id=1): no puede acceder a Carruseles ni Banner (popup informativo)
- Plan Normal (plan_id=2): no puede acceder a Banner (popup "Contenido exclusivo Premium")
- Sidebar con `minPlan` en items: Carruseles (minPlan: 2), Banner (minPlan: 3)
- Items bloqueados muestran icono candado + texto gris

### Mejoras en Planes (PlansModal y RegisterModal)
- Planes muestran desglose de imágenes: Publicaciones + Carrusel + Banner = Total
- Plan Normal: 25 publicaciones + 8 carrusel = 33 imágenes
- Plan Premium: 100 publicaciones + 24 carrusel + 10 banner = 134 imágenes
- IVA mostrado como "+ IVA ($monto)" sin sumar al precio
- RegisterModal simplificado: solo muestra total de imágenes por plan
- BD actualizada: Plan Normal max_listings de 20 a 25

### Banner Admin - Vista Previa Real
- Preview del banner en AdminBanner replica el diseño real del StoreBanner
- Grid 4 columnas x 2 filas con item principal grande y secundarios
- Auto-rotación entre slides con indicadores de puntos

### Configuración Local
- Vite proxy configurado para desarrollo local: /api/ y /uploads/ redirigen al VPS

---

## 9 de Marzo 2026 (Sesión 2) - Carruseles API, Banner Admin y Restricciones por Plan

### Carruseles Conectados a API (StorePage)
- Carruseles de la página premium (ImageMarquee) ahora cargan items desde la API
- `MarqueeModal` mejorado con información completa: badge, tallas (chips seleccionables), medidas (alto/ancho/profundidad), género
- Items del carrusel se muestran como productos completos al hacer clic
- Máximo 8 items por carrusel

### StorePage Conectada a Datos Reales
- Página premium carga productos, carruseles, banners y datos del negocio desde la API
- 3 llamadas API en paralelo: listings del usuario, items de carrusel, info del negocio
- Categorías construidas dinámicamente desde productos de la API (agrupados por tipo → subcategoría)
- Secciones construidas dinámicamente (agrupadas por campo `seccion`)
- Fallback a datos estáticos demo cuando no hay `userId` o la API no responde

### Endpoints Públicos Nuevos
- `GET /api/listings?user_id=X` — filtrar publicaciones por usuario
- `GET /api/listings?carousel=1` — obtener items de carrusel ordenados por posición y orden
- `GET /api/business/:userId` — obtener datos del negocio de un usuario (sin autenticación)

### ProductCard - Tiendas Dinámicas desde API
- Función `getStoreFromProduct` crea objetos de tienda dinámicos desde datos de la API
- Usa `nombre_negocio`, `negocio_whatsapp`, `negocio_telefono`, `negocio_direccion` del listing
- Fallback a `getStoreForProduct` para datos estáticos

### Restricciones de Carruseles por Plan y Productos
- **Plan Normal (plan_id=2):** 1 carrusel, desbloqueado con 10+ productos
- **Plan Premium (plan_id=3):** 3 carruseles, C2 con 30+ productos, C3 con 40+ productos
- Tabs bloqueados muestran icono de candado y cantidad de productos requeridos
- Popup informativo al intentar acceder a carrusel bloqueado (muestra productos actuales vs requeridos)
- Contador de productos excluye items de carrusel y banner

### Carruseles Cada 2 Filas (StorePage)
- Carruseles se muestran cada 2 filas de tarjetas (antes cada 3)
- Cada carrusel (1/2/3) aparece en su posición correspondiente separadamente
- Carrusel 1 después de fila 2, Carrusel 2 después de fila 4, Carrusel 3 después de fila 6

### Nueva Sección: Banner Admin (`AdminBanner.jsx`)
- Gestión completa del StoreBanner de la página premium
- 2 slides (pestañas), 5 items por slide
- Item principal (grande) + 4 secundarios por slide
- Modal idéntico al de productos: ImageCropper, nombre, descripción, precio, badge, subcategoría, tallas, medidas, género
- Vista previa del slide con estructura de grilla (principal grande + 4 pequeños)
- Item principal resaltado con borde ámbar y etiqueta "PRINCIPAL"
- Botón "Principal" para intercambiar posición de cualquier item con el principal (swap de `banner_orden` via 2 PUT)
- Items almacenados como listings con `banner_orden` (1-5 = slide 1, 6-10 = slide 2; posiciones 1 y 6 son principales)

### Base de Datos - Columna banner_orden
- Nueva columna `banner_orden TINYINT NULL DEFAULT NULL` en tabla `listings`
- Valores 1-5 para slide 1, 6-10 para slide 2
- Posiciones 1 y 6 son los items principales de cada slide

### StoreBanner Conectado a API
- Banner de la página premium carga items desde la API (campo `banner_orden`)
- Items organizados automáticamente en 2 slides
- Click en item del banner abre `MarqueeModal` con información completa del producto

### Restricción Banner por Plan Premium
- Sección Banner visible en sidebar para todos los planes
- Plan Normal: click en "Banner" muestra popup "Contenido exclusivo Premium" (no navega)
- Plan Premium: acceso completo a la gestión del banner
- Sidebar usa propiedad `minPlan` en items del menú para determinar acceso
- Items bloqueados renderizan `<button>` en vez de `<NavLink>` (misma apariencia visual)

### Routing
- Nueva ruta `/admin/banner` → `AdminBanner`
- Import agregado en `main.jsx`

---

## 9 de Marzo 2026 - Mejoras Admin, Datos Productos y Conexión Servidor

### Imagen Cuadrada con Cropper (AdminProductos)
- Contenedor de imagen cuadrado (208x208px) para crear/editar productos
- Componente `ImageCropper` con arrastrar (mouse y touch) para reposicionar imagen
- Slider de zoom (1x a 3x)
- Al guardar, `generateCroppedImage` usa canvas para generar imagen cuadrada 400x400px con la posición exacta
- Imagen centrada automáticamente al cargarla
- Tarjetas de productos guardados también con `aspect-square`

### Precios bajo la Imagen
- Campos Precio y Precio anterior movidos debajo de la imagen en el modal
- Precios siempre enteros: `step="1"`, bloqueo de teclas `.`, `,`, `e`, `E`
- `Math.round()` al guardar
- Flechas (spinners) de inputs numéricos ocultadas globalmente en `index.css`
- Precio anterior tachado visible en tarjeta del producto

### Tipo, Tallas, Medidas, Género
- Campo **Tipo** (select): Productos, Servicios, Arriendos
- Campo **Tallas** (select): Calzado (20-46), Ropa (2-XXXL), Accesorios (XS-Único) — selección múltiple
- Campo **Medidas** (toggle con círculo): inputs Alto, Ancho, Profundidad en cm
- Campo **Género** (select): Niño, Niña, Hombre, Mujer, Unisex
- Los tres en fila con `grid-cols-3`, espaciado compacto (`space-y-1`, `py-1`)

### Editar y Eliminar Productos
- Botones **Editar** y **Eliminar** en cada tarjeta de producto
- Editar abre modal con todos los datos cargados (nombre, precios, imagen, tallas, medidas, género)
- Título cambia a "Editar producto", botón a "Actualizar Producto"
- Lápiz (edit) arriba a la izquierda de la imagen para cambiar imagen existente
- Imagen existente (URL) se muestra directamente; imagen nueva activa el cropper
- Popup de confirmación al eliminar con botones Cancelar/Aceptar (`z-[60]`)

### Persistencia y Pestañas
- Productos guardados en `localStorage` (key `admin_productos`, versión `admin_productos_v`)
- Pestaña "Turismo" eliminada de pestañas y del select Tipo
- Grid de tarjetas fijo a 5 columnas (`grid-cols-5`)
- Tarjeta "Agregar producto" siempre primera
- 25 productos de ejemplo (5 por sección) con imágenes de la página principal

### Datos de Productos - Página Principal (products.js)
- Todos los productos actualizados con campos: `tipo`, `tallas`, `medidas`, `genero`
- Ropa con tallas y género: Polera Running, Chaqueta Outdoor, Vestido Lino, Parka, Jeans, etc.
- Calzado con tallas y género: Zapatillas Trail, Urbanas Retro, Botines Chelsea, Sandalias, Zapatos Escolares
- Muebles con medidas: Silla Pro-Gamer, Escritorio, Estante Industrial, Mesa Centro
- Arriendos con medidas: Casas, Deptos, Locales, Cabañas, Oficinas, Bodegas
- Tecnología con medidas: Consola PS5, GPU, SSD, Monitores
- Servicios sin tallas/medidas/género

### Modal Popup Página Principal (ProductCard)
- Género mostrado como badge en esquina superior derecha de la imagen
- Tipo (productos/servicios/arriendos) NO se muestra (dato interno)
- Layout estructurado con posiciones fijas:
  1. Nombre: 2 líneas fijas (`min-h-[36px]`, `line-clamp-2`)
  2. Descripción: hasta 5 líneas (`min-h-[60px]`, `line-clamp-5`)
  3. Tallas y/o Medidas: zona variable
  4. Precio actual (izquierda) / Precio anterior tachado (derecha) con separador
  5. Iconos de contacto: última línea con separador

### Conexión al Servidor VPS
- Llave SSH encontrada en `/mnt/c/Users/Telqway/Desktop/colegio-react/.ssh_keys/id_rsa_vps_new`
- Conexión SSH verificada exitosamente
- MySQL operativo, sin BD de usuario creada aún

### Repositorio GitHub
- Proyecto subido a https://github.com/pato1982/Solo_un_click.git
- `.gitignore` creado (node_modules, dist, .env)
- Commit inicial con 36 archivos

---

## 8 de Marzo 2026 - Panel de Administración

### Estructura del Panel Admin
- Instalado `react-router-dom` para manejo de rutas
- Sitio público en `/` y panel admin en `/admin` dentro del mismo proyecto
- Creada estructura de carpetas `src/admin/` con subcarpetas `components/` y `pages/`

### Header Admin (`AdminHeader.jsx`)
- Botón hamburguesa a la izquierda para abrir/cerrar sidebar
- Texto "Panel Administrador" centrado
- Logo "Solo a un Click" con icono a la derecha, funciona como enlace al sitio público

### Sidebar Admin (`AdminSidebar.jsx`)
- Menú lateral fijo colapsable con animación de entrada/salida
- Enlace "Ver sitio público" en la parte superior
- Items de navegación: Dashboard, Productos (más items comentados para futuro)
- NavLink con estado activo resaltado (fondo primary, texto blanco)
- Perfil de administrador en la parte inferior del sidebar

### Dashboard (`AdminDashboard.jsx`)
- 4 tarjetas de resumen: Productos, Tiendas, Pedidos, Usuarios (valores en 0)
- Placeholder "Panel en construcción"

### Sección Productos (`AdminProductos.jsx`)
- 6 pestañas: Destacados, Ofertas, Novedades, Liquidación, Tendencia, Tecnología
- Excluidas las secciones Arriendos y Servicios
- Contador de productos por pestaña
- Tarjeta vacía con signo "+" y texto "Agregar producto" en cada pestaña
- Productos agregados se muestran como tarjetas con imagen, nombre, subcategoría, precio y botón eliminar

### Modal Nuevo Producto
- Layout de dos columnas: imagen rectangular a la izquierda, formulario a la derecha
- Recuadro de imagen con botón para buscar archivo (JPG, PNG, WEBP)
- Preview de imagen con botón para eliminar
- Campos: Nombre, Descripción, Precio, Precio anterior, Categoría, Subcategoría
- Modal compacto con textos reducidos (`text-[11px]`, `text-xs`)

### Cambios en Datos de Productos
- Sección "Turismo y Experiencias" renombrada a "Tendencia"
- Sección "Tecnología y Gaming" renombrada a "Tecnología"

### Routing (`main.jsx`)
- `BrowserRouter` con rutas: `/admin` (layout admin), `/admin/productos`, `/*` (sitio público)

---

## 6 de Marzo 2026 (Sesión 2) - Página Premium

### Sistema de Tiendas Premium
- Creado sistema de páginas dedicadas para tiendas premium con layout propio
- Icono de tienda (storefront) en tarjetas de productos que pertenecen a una tienda premium
- Al hacer clic en el icono se abre la página de la tienda
- En la página premium, el icono de tienda se oculta en las tarjetas (`inStorePage` prop)

### Header Página Premium
- Header propio sin barra superior, con título centrado (slogan + nombre grande `text-3xl`)
- Logo "Solo a un Click" con icono al costado izquierdo del header
- Buscador compacto (`w-64`) al lado derecho
- Eliminados iconos de WhatsApp, teléfono y ubicación del header
- Header más alto (`py-7`) con borde inferior amarillo (`border-b-2 border-accent`)

### Sidebar Página Premium
- Menú lateral fijo con `position: sticky top-[92px]`
- Todas las categorías y subcategorías visibles sin necesidad de expandir
- Scroll interno (`max-h-[380px]`) con barra de scroll más visible (4px, opacidad 0.3)
- Check mark blanco para subcategoría seleccionada
- Botón "Volver" al final del menú
- Margen entre sidebar y header

### Banner Mosaico de Productos
- Banner tipo mosaico con 5 productos: 1 grande (2x2) + 4 pequeños
- Cada imagen con nombre, descripción y precio al lado
- 2 secciones que rotan cada 7 segundos con transición crossfade
- Indicadores de slide clicables
- Overlay semi-transparente morado (`bg-primary/30`)
- Banner sin bordes redondeados, pegado al header con margen ínfimo (`pt-1`)

### Carrusel de Productos por Filas
- Productos organizados en filas de 10 tarjetas con sistema de carrusel
- Primera tarjeta fija, resto en scroll con flechas y auto-scroll (igual que página principal)

### Carrusel de Imágenes (Marquee)
- Carrusel infinito de imágenes de productos cada 3 filas de tarjetas
- 6 imágenes visibles simultáneamente, tamaño `h-40`
- Se detiene al pasar el mouse
- Al hacer clic en una imagen abre modal con detalle del producto
- Separación con filas de tarjetas (`py-6`)

### Modales de Producto
- Margen ínfimo en imagen (superior, derecho e izquierdo: `pt-1 pr-1 pl-1`)
- Precio movido a la parte inferior de la columna derecha (`mt-auto`)
- Altura mínima del modal (`md:min-h-[220px]`)
- Nombre del producto en 2 filas si tiene más de 2 palabras
- Mayor margen entre nombre y descripción (`mb-3`)
- Barra inferior con iconos de contacto en todos los modales

### WhatsApp en Modales
- Botón WhatsApp abre la app con mensaje pre-armado
- Mensaje incluye nombre del producto, precio y link de la imagen
- Usa el teléfono de la tienda premium o número genérico por defecto

### Footer Página Premium
- Footer propio diferente al de la página principal
- 5 columnas: 1ª y 5ª vacías como márgenes (`0.3fr`)
- Columna 2: nombre de la tienda + redes sociales (WhatsApp, Instagram, YouTube)
- Columna 3: descripción breve del negocio (texto justificado)
- Columna 4: datos de contacto (correo, teléfono, dirección) con margen izquierdo (`pl-16`)
- Footer compacto (`py-4`, `space-y-0.5` en items)

### Datos de Tiendas
- TecnoSur Villarrica: 25 productos, 7 categorías, descripción para footer
- Hogar & Deco: 5 productos, 5 categorías, descripción para footer
- Campo `description` agregado a tiendas premium

### CSS
- Animación `image-marquee` para carrusel infinito de imágenes (20s linear infinite)
- Scrollbar del sidebar más visible (4px, opacidad 0.3, hover 0.5)

---

## 6 de Marzo 2026

### Corrección de Tildes en Sidebar
- Corregidas subcategorías sin tildes que no coincidían con los datos de productos
- Tecnologia → Tecnología, Audifonos → Audífonos, Camaras → Cámaras, Iluminacion → Iluminación, Gasfiteria → Gasfitería, Jardineria → Jardinería, Cabanas → Cabañas

### Sidebar - Arriendos como Lista Plana
- Arriendos movido de estructura jerárquica (categoría → subcategoría) a lista plana con iconos individuales
- Nuevas subcategorías agregadas: Automóviles, Camionetas, Furgones, Bicicletas, Motos, Scooters, Botes, Kayaks, Lanchas, Tablas, Equipos Deportivos, Canchas, Piscinas, Herramientas, Generadores, Carpas, Camping, Equipos Nieve

### Sidebar - Servicios como Lista Plana
- Servicios movido de estructura jerárquica a lista plana con iconos individuales
- Cada subcategoría con su propio icono descriptivo (electric_bolt, plumbing, format_paint, etc.)

### Sidebar - Productos: 10 Nuevas Categorías
- Celulares (Smartphones, Fundas, Protectores)
- Gaming (Consolas, Controles, Juegos)
- Fotografía (Cámaras Foto, Lentes, Trípodes)
- Hogar (Electrodomésticos, Cocina, Aspiradoras)
- Ropa (Hombre, Mujer, Niños, Calzado)
- Herramientas (Eléctricas, Manuales, Jardín)
- Alimentos (Despensa, Bebidas, Congelados)
- Salud (Cuidado Personal, Suplementos, Belleza)
- Bebés (Coches, Cunas, Juguetes Bebé)
- Librería (Libros, Útiles Escolares, Arte)

### Sidebar - Productos: Categorías Siempre Visibles
- Eliminado filtro que ocultaba categorías sin datos en products.js
- Todas las categorías y subcategorías se muestran siempre en el sidebar

### Sidebar - Alineación de Items
- Agregado `w-full text-left` a `btnClass` para alinear todos los items a la izquierda

### Sidebar - Comportamiento de Categorías (Productos)
- Eliminadas flechas expand/collapse de las categorías
- Al hacer clic en una categoría, filtra el contenido por todas sus subcategorías y expande las subs debajo
- Al hacer clic en una subcategoría, refina el filtro solo a esa subcategoría específica
- Categoría activa se resalta con fondo y color accent

### Sidebar - Subcategorías sin Hover
- Eliminado efecto hover en subcategorías (sin highlight al pasar el mouse)
- Subcategoría seleccionada muestra un visto bueno (check) blanco en lugar del punto accent
- El check se mueve a la nueva subcategoría al seleccionar otra

### Filtro de Subcategoría - Sin Toggle
- Al hacer clic en una subcategoría activa, el filtro se mantiene (ya no se cierra/desactiva)

### Buscador Global Activo
- Buscador del header ahora funcional con búsqueda en tiempo real
- A partir de 3 letras muestra coincidencias en un desplegable
- Busca en todas las secciones: Productos, Servicios, Arriendos, Turismo, Negocios y Eventos
- Búsqueda insensible a tildes (escribir "cafe" encuentra "Café")
- Cada resultado muestra icono, nombre, sección de origen y badge categoría/subcategoría
- Al seleccionar un resultado, navega a la sección correspondiente y aplica el filtro
- Máximo 8 resultados visibles
- Se cierra al hacer clic fuera del buscador
- Mensaje "No se encontraron resultados" cuando no hay coincidencias
- Nuevo archivo `src/data/searchIndex.js` con índice centralizado de todas las categorías y subcategorías

---

## 5 de Marzo 2026

### Filtro por Subcategoría - Vista por Filas
- Al seleccionar una subcategoría del menú lateral, se muestran las secciones (filas) originales que contengan productos de esa subcategoría
- Cada fila conserva su título original (Productos Destacados, Ofertas, Novedades, etc.)
- Lógica condicional de banner y carrusel según cantidad de filas filtradas:
  - 1-2 filas: solo las filas de productos
  - 3-4 filas: Banner después de la 2da fila
  - Más de 4 filas: Banner después de la 2da + StoresCarousel después de la 4ta
- Botón "Volver" y encabezado con nombre de subcategoría y total de resultados

### Tarjeta Primera de cada Fila - Marco Dorado
- Primera tarjeta de cada fila con doble marco dorado (`border-2 border-amber-400` + `outline outline-2 outline-amber-400 outline-offset-2`)
- Badge "Popular" exclusivo en tarjetas con marco dorado (fondo ámbar)
- Resto de tarjetas sin badge
- Padding `py-1` en contenedor del carrusel para que el outline no se recorte

### Carrusel Auto-rotativo
- Primera tarjeta (marco dorado) queda fija a la izquierda
- Resto de tarjetas rotan automáticamente cada 5 segundos de derecha a izquierda
- Al llegar al final, vuelve al inicio
- Flechas de navegación siguen activas y reinician el temporizador al usarse

### Tarjetas - Limpieza Visual
- Eliminado botón de corazón (favorito) de todas las tarjetas
- Eliminadas estrellas y nota de rating de tarjetas y modales
- Altura de imagen reducida de `h-48` a `h-40`
- Eliminado badge de los modales (popup)
- Precios en formato pesos chilenos sin centavos (`toLocaleString('es-CL')`)

### Espaciado entre Título y Tarjetas
- Aumentado margen entre título de fila y tarjetas de `mb-3` a `mb-6`

### Header
- Barra de navegación con borde amarillo superior e inferior (`border-y-2 border-accent`)

### Menú Lateral (Sidebar)
- Marco amarillo interior (`border border-accent rounded-lg`) con padding dejando ver el azul de fondo
- Letra de subcategorías: `text-xs font-normal text-white/50 hover:text-white`
- Botón "Todas las categorías" al final del menú, texto centrado en dos líneas
- Subcategorías de Turismo ahora son dinámicas, generadas desde las actividades de las empresas
- Al hacer clic en subcategoría de turismo, filtra empresas que ofrecen esa actividad

### Turismo - Página de Detalle de Empresa
- Botón "Ver más" abre vista de detalle con:
  - Título de la empresa
  - Fila 1: imagen izquierda + texto "Sobre Nosotros" derecha
  - Fila 2: 3 collages rectangulares (grilla 2x2 de 4 fotos cada uno)
  - Fila 3: texto "Nuestra Experiencia" izquierda + imagen derecha
  - Fila 4: tarjeta "Datos de la Empresa" (dirección, teléfono, email, horarios, sección "¡Ubícanos!" con iconos Facebook, Instagram, YouTube) + tarjeta "Panoramas y Salidas" (tours con días, horarios, precios)
- Cada empresa tiene collages con combinaciones de imágenes únicas
- Subcategorías asignadas a cada empresa (Volcanes, Trekking, Rafting, Spa, etc.)
- Imágenes grandes de detalle unificadas con IMG_VOLCANO e IMG_MOUNTAIN como ejemplo
- Padding izquierdo extra (`pl-8`) en tarjeta de datos

### Turismo - Filtro y Navegación
- Al seleccionar subcategoría estando en detalle de empresa, vuelve al listado filtrado
- Botón flotante "Quitar filtro" centrado en parte inferior, se detiene antes del footer
- Botón flotante "Volver a Turismo" con mismo comportamiento respecto al footer
- Ambos botones usan `requestAnimationFrame` para posicionamiento preciso

### Footer
- Padding reducido: `pt-8 pb-3` (antes `pt-12 pb-4`)
- Columna "Accesos" con margen lateral `px-20`
- Columnas "Legal" y "Mi cuenta" con margen lateral `px-10`
- Espacio entre opciones reducido de `space-y-4` a `space-y-2`
- Texto de opciones: `text-xs font-normal text-white/50` (igual que columna 1)
- Sección "Redes Sociales" en columna Contacto: título + iconos Facebook (azul) e Instagram (degradado) alineados a la izquierda

### Datos de Productos
- Agregado 1 producto con subcategoría "Accesorios" en secciones Novedades, Liquidación y Turismo (IDs 50-52) para testing del filtro
- Agregada 1 tarjeta adicional a cada una de las 8 secciones (IDs 60-67)

## 4 de Marzo 2026

### Header
- Botón "Buscar" cambiado a color amarillo (`bg-accent`) con texto morado (`text-primary`)

### Banner - Carrusel de 2 slides
- Creado carrusel de 2 slides con rotación automática cada 7 segundos
- **Slide 1**: Vitrina digital - lado izquierdo amarillo con fan de tarjetas de productos, lado derecho con 2 columnas de 8 beneficios ("¿Por qué publicar aquí?")
- **Slide 2**: Seguridad - lado izquierdo color fondo (#F5F4F7) con tema de seguridad ("CONOCE ANTES DE COMPRAR"), lado derecho amarillo con fan de tarjetas de turismo (Volcán, Canopy, Kayak)
- Transición crossfade (desvanecimiento) de 1000ms entre slides
- Indicadores de puntos clickeables en la parte inferior
- Títulos de secciones aumentados a `text-sm font-black uppercase`
- Textos de características: títulos `text-[11px]`, descripciones `text-[10px]`
- 7 tarjetas semi-transparentes decorativas en el lado amarillo de cada slide
- Removido botón "Publica gratis"
- Textos actualizados: "Cientos de compradores", "Fácil de gestionar", "Cerca de ti"

### Sección de Eventos (EventsSection.jsx)
- Nueva sección "Próximos Eventos" ubicada entre Arriendos y Novedades
- 8 tarjetas de eventos en grilla de 2 filas x 4 columnas
- Marco con borde amarillo grueso (`border-2 border-accent`)
- Fondo blanco, tarjetas con bordes delgados
- Cada tarjeta: imagen, badge de categoría, título, fecha con icono calendario, ubicación, precio centrado
- Eventos: Feria Costumbrista, Festival Música Lago, Feria Gastronómica, Carrera Trail Volcán, Expo Emprendedores, Noche de Fogatas, Feria Artesanía Mapuche, Torneo Pesca Deportiva

### Carrusel de Locales Inscritos (StoresCarousel.jsx)
- Nueva sección ubicada entre Servicios y Productos en Liquidación
- 8 locales: botillerías y almacenes de barrio de Villarrica
- Imágenes circulares grandes (`w-36 h-36`) con borde amarillo
- 6 tarjetas visibles a la vez
- Auto-scroll continuo e infinito sin saltos (loop seamless con items duplicados)
- Se pausa al pasar el mouse encima
- Click abre modal popup con foto, nombre y dirección del local
- Locales: Botillería El Volcán, Almacén Doña Rosa, Botillería La Esquina, Almacén Don Lucho, Botillería Sur, Almacén La Vecina, Botillería Central, Almacén El Barrio

### Productos
- Agregada 1 tarjeta de producto adicional a cada una de las 8 secciones (IDs 41-48)
- Secciones: Destacados, Ofertas, Arriendos, Novedades, Servicios, Liquidación, Turismo, Tecnología

### Paleta de Colores (sin cambios finales)
- Se probó tema oscuro "Electric & Night" → revertido
- Se probó invertir morado/amarillo → revertido
- Se probó acentuar más amarillo en todo el proyecto → revertido
- Paleta final mantenida: primary `#3B1969`, primary-light `#5B3A8A`, accent `#E5B800`, background-light `#F5F4F7`

### Turismo
- Imagen de rafting removida del banner (solo quedan: Volcán, Canopy, Kayak)
