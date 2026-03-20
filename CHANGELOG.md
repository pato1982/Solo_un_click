# Registro de Cambios - Solo a un Click

## 20 de Marzo 2026 (sesión 14) - Banner premium, navegación admin SPA

### Navegación admin sin recarga
- Cambiados todos los `<a href="/admin">` a `<Link to="/admin">` en Header.jsx y App.jsx
- Navegación al panel admin ahora es SPA (sin recarga de página completa)
- Eliminado el efecto de "pantalla en blanco" al entrar al panel

### Fix banner no visible en página premium
- **Bug backend:** el filtro `rows.filter(r => !r.banner_orden)` eliminaba los banner items al pedirlos con `?banner=1` — corregido agregando `banner !== '1'` a la condición
- **ProductCard:** ahora pasa `plan_id` desde `owner_plan_id` al abrir tienda, asegurando que `store.plan_id >= 3` se evalúe correctamente

### Rediseño visual del banner premium
- Layout: imagen principal grande a la izquierda + 4 imágenes en grid 2x2 a la derecha
- Imágenes completas (`object-contain`) dentro de marcos blancos con borde y sombra
- Fondo `slate-50` detrás de los marcos
- Si hay 1 solo producto, la imagen ocupa todo el banner
- Sin texto en las tarjetas del banner — info aparece al hacer click (MarqueeModal)
- Altura del banner aumentada: `h-64 / h-80 / h-96`

### Vista previa del banner en admin actualizada
- BannerPreview en AdminBanner coincide con el diseño de la página premium
- Marcos blancos, imágenes completas, mismo layout

### Base de datos
- Nuevas columnas en `listings`: `banner_pos_x` (INT DEFAULT 50), `banner_pos_y` (INT DEFAULT 50), `banner_scale` (DECIMAL DEFAULT 1.00)
- Nuevo endpoint `PATCH /api/listings/:id/banner-pos` para posición/escala del banner

### Fix modal banner en mobile
- Imagen y cropper centrados en el modal en vista mobile
- Botón subir imagen centrado con ancho fijo

### Fix useCallback
- Restaurado `useCallback` en import de AdminBanner (necesario para ImageCropper del modal)

### Pendientes
- **SMTP Gmail para emails de recuperación de contraseña**
- **Analizar página principal, StorePage premium y páginas de filtrado "Ver todos"**

---

## 19 de Marzo 2026 (sesión 13) - Eliminar datos ejemplo, mejoras UI premium

### Eliminación de datos de ejemplo
- Eliminados `src/data/products.js` (67 productos falsos), `src/data/stores.js` (2 tiendas ficticias), `src/data/searchIndex.js` (índice estático)
- Eliminado directorio `src/data/` completo
- Eliminado import comentado en `App.jsx`
- **Todo viene ahora exclusivamente de la base de datos**

### Buscador Header dinámico desde BD
- `Header.jsx`: reemplazado import estático de `searchIndex` por fetch a `/api/categorias`, `/api/locales/categorias` y `/api/eventos/categorias`
- Índice de búsqueda se construye dinámicamente al cargar la página
- `backend/routes/categorias.js`: agregado campo `icono` a la query y respuesta

### Eliminación de DEFAULT_PHONE falso
- `StorePage.jsx` y `ProductCard.jsx`: eliminado `DEFAULT_PHONE = '56912345678'`
- WhatsApp solo se muestra si el negocio tiene teléfono real configurado
- Eliminada función `getWhatsAppUrl` no usada en ProductCard

### Banner solo desde admin
- `StorePage.jsx`: eliminado fallback que usaba productos normales como banner
- Banner solo aparece si el comerciante configuró items con `banner_orden` desde su admin

### Sidebar mobile en páginas premium
- Reemplazado dropdown por sidebar lateral (mismo estilo que página principal)
- Ícono hamburguesa centrado en la barra existente (junto a Volver/Inicio)
- Panel se abre desde la izquierda con overlay, botón cerrar (X) y scroll
- Tocar categoría expande subcategorías; volver a tocarla no cierra el menú
- Menú solo se cierra con X o tocando fuera (overlay)

### Mejoras UI popup de contacto (ProductCard)
- Popup de contacto ahora se posiciona sobre los botones (sin overlay bloqueante)
- Click en otro ícono cambia directo al nuevo popup sin cerrarse primero
- Click en misma ícono hace toggle (cierra)
- Click en cualquier zona del modal cierra el popup
- Ocultar ícono storefront en popups dentro de páginas premium

### Mejoras UI tarjetas y botones
- Imágenes de tarjetas más grandes: `h-32` → `h-44` en mobile, `h-40` → `h-44` en desktop
- Imagen del popup modal: `h-44` → `h-64` en mobile
- Botones Volver/Inicio en página premium: sin fondo amarillo, borde delgado amarillo, más compactos
- Todos los menús (sidebar mobile y desktop): borde amarillo (`border-2 border-accent`), ancho ajustado al contenido (`w-fit`)

### Pendientes
- **SMTP Gmail para emails de recuperación de contraseña**

---

## 19 de Marzo 2026 (sesión 12) - Análisis páginas públicas + fixes

### Análisis completo de páginas públicas
- Revisión exhaustiva de: página principal (App.jsx), StorePage premium, SectionPage, StoresPage, EventsPage, TourismPage, ArriendosPage, ServiciosPage
- Identificación de datos demo, bugs, inconsistencias y mejoras mobile

### Fix: Imagen tablet EventsSection
- `EventsSection.jsx`: altura imagen tablet corregida de `h-24` a `h-28` (antes era más chica que mobile `h-32`)

### Fix: Detección de eventos gratuitos
- `EventsSection.jsx` y `EventsPage.jsx`: función `isGratis()` ahora cubre `precio === 0` numérico y usa `String()` para evitar crash con valores no-string

### Fix: Filtrado case-insensitive unificado
- Todos los filtros de categoría/subcategoría ahora usan `.toLowerCase()` para comparación
- Archivos corregidos: `EventsPage.jsx`, `StoresPage.jsx`, `ServiciosPage.jsx`, `ArriendosPage.jsx`, `StorePage.jsx`, `App.jsx`
- `TourismPage.jsx` ya lo tenía implementado

### Fix: Filtro de categorías mobile en StorePage
- Nuevo dropdown "Filtrar por categoría" visible solo en mobile (`md:hidden`)
- Botón muestra filtro activo o "Filtrar por categoría"
- Despliega lista de categorías con subcategorías expandibles
- Botón "Quitar filtro" para limpiar selección
- Se cierra automáticamente al seleccionar subcategoría o categoría sin subs

### Fix: KPI clicks hardcoded en AdminEstadisticas
- `AdminEstadisticas.jsx`: valor `{resumen.clicks_mes || 100}` cambiado a `{resumen.clicks_mes}` — ya no muestra 100 falso cuando no hay clicks

### Fix: Banner no se mostraba en StorePage premium
- **Bug:** El endpoint `GET /api/listings?user_id=X` excluía los banner items (`AND banner_orden IS NULL`), por lo que StorePage nunca los recibía
- **Solución backend:** Nuevo parámetro `banner=1` en `/api/listings` que devuelve solo items con `banner_orden` (solo plan Premium)
- **Solución frontend:** StorePage ahora hace fetch separado `?user_id=X&banner=1` para obtener los banner items
- El banner se muestra correctamente bajo el header para negocios plan Premium (plan_id = 3)

### Eliminación completa de datos demo
- Todos los datos de ejemplo/demo eliminados del frontend — la app ahora solo muestra datos reales de la BD
- Si no hay datos, se muestra mensaje vacío ("No hay eventos próximos aún", "No hay locales inscritos aún", etc.)
- **Archivos limpiados:**
  - `App.jsx` — eliminados DEMO_NAMES, DEMO_PRICES, DEMO_IMG, makeDemoProducts(), DEMO_TURISMO_CATS
  - `EventsSection.jsx` — eliminados DEMO_EVENTS, DEMO_EVENT_IMG
  - `EventsPage.jsx` — eliminados DEMO_EVENTS, DEMO_EVENT_IMG
  - `StoresCarousel.jsx` — eliminados DEMO_STORES, DEMO_STORE_IMG
  - `StoresPage.jsx` — eliminados DEMO_STORES, DEMO_STORE_IMG
  - `ArriendosPage.jsx` — eliminados DEMO_ARRIENDOS, DEMO_IMG
  - `ServiciosPage.jsx` — eliminados DEMO_SERVICIOS (4 empresas con URLs Unsplash)
  - `TourismPage.jsx` — eliminados DEMO_EMPRESAS, DEMO_TOURS, DEMO_PAGINA, DEMO_TOUR_IMGS
  - `Sidebar.jsx` — eliminados DEMO_CATS (productos/servicios/arriendos), DEMO_LOCALE_CATS, DEMO_EVENT_CATS
  - `ProductCard.jsx` — eliminado fallback a getStoreForProduct() de stores.js
  - `StorePage.jsx` — eliminado import de products.js y fallback a sections estáticas

### Limpieza BD producción
- Vaciadas 18 tablas (users, businesses, listings, etc.) con TRUNCATE + AUTO_INCREMENT reset
- Conservadas: categorias (52), subcategorias (578), categorias_barrio (39), categorias_evento (31), plans
- Eliminadas 6 imágenes del servidor (`/var/www/soloaunclick/uploads/`)

### Etiqueta (badge) visible en páginas públicas
- `ProductCard.jsx`: badge visible en tarjeta (esquina imagen) y popup/modal
- `ArriendosPage.jsx`: badge en tarjeta y modal (prioridad sobre categoría)
- Si tiene badge muestra badge, si no muestra categoría

### ServiciosPage reescrita
- Ya no agrupa por empresa con CardFan — ahora muestra tarjetas individuales usando `ProductCard`
- Misma estructura que ArriendosPage: fetch `/api/listings` filtrado por `tipo='servicio'`
- Grid con filtrado por categoría/subcategoría, paginación, badge visible

### Validación tipo/sección en AdminProductos y AdminCarruseles
- Popup de advertencia si el tipo no coincide con la pestaña activa (servicio fuera de Servicios, arriendo fuera de Arriendos, producto en Servicios/Arriendos)
- Botón "Sí, mover" guarda en la sección correcta y cambia la pestaña
- Tallas, medidas y género ocultos cuando tipo es servicio o arriendo (en AdminProductos y AdminCarruseles)

### Header público — Plan oculto
- Quitado texto "Plan Gratis/Normal/Premium" del saludo en el header público (solo muestra "Hola, Nombre")

### AdminNegocio — WhatsApp y Teléfono en misma fila mobile
- Campos siempre en `grid-cols-2`, textos e iconos más compactos en mobile

### AdminProductos — Responsive mobile completo
- Tabs reemplazadas por `<select>` dropdown en mobile
- Grid 2 columnas con tarjetas iguales a la página principal (imagen, nombre, precio, botones editar/eliminar)
- Tablet/desktop mantiene grid original sin cambios

### AdminHeader mobile — Barra "Ver sitio | Ver mi página"
- Nueva barra fina bajo el header con acceso directo a "Ver sitio" y "Ver mi página"
- "Ver sitio público" oculto del sidebar en mobile (solo visible en tablet/desktop)

### StorePage — Tarjetas iguales a página principal
- `StoreCarousel` reescrito con misma estructura que `ProductCarousel`
- Mobile: carrusel horizontal, tarjetas `w-[calc(50%-4px)]` (2 visibles)
- Tablet/Desktop: tarjeta destacada fija + carrusel con mismos anchos

### Páginas de filtro — Tarjetas consistentes
- `SectionPage`, `ArriendosPage`, `ServiciosPage`: grid con más columnas para que las tarjetas tengan el mismo tamaño que en la página principal
- Mobile: 2 cols, Tablet: 4 cols, Desktop: 6-7 cols

### Archivos modificados
- `backend/routes/listings.js` — nuevo parámetro `banner=1`
- `src/App.jsx` — eliminados demos, filtro case-insensitive, props ServiciosPage
- `src/admin/components/AdminHeader.jsx` — barra mobile Ver sitio + Ver mi página
- `src/admin/components/AdminSidebar.jsx` — Ver sitio público oculto en mobile
- `src/admin/pages/AdminCarruseles.jsx` — tallas/medidas ocultos para servicio/arriendo
- `src/admin/pages/AdminEstadisticas.jsx` — quitar fallback 100 del KPI clicks
- `src/admin/pages/AdminNegocio.jsx` — WhatsApp/Teléfono misma fila responsive
- `src/admin/pages/AdminProductos.jsx` — validación sección, responsive mobile completo
- `src/components/ArriendosPage.jsx` — reescrita con ProductCard, badge
- `src/components/EventsPage.jsx` — fix isGratis, filtro case-insensitive
- `src/components/EventsSection.jsx` — fix imagen tablet, isGratis
- `src/components/Header.jsx` — quitado texto plan del saludo
- `src/components/ProductCard.jsx` — badge en tarjeta y modal
- `src/components/SectionPage.jsx` — grid más columnas
- `src/components/ServiciosPage.jsx` — reescrita completa con ProductCard
- `src/components/Sidebar.jsx` — eliminados demos categorías
- `src/components/StorePage.jsx` — StoreCarousel reescrito, dropdown mobile, banner fix
- `src/components/StoresCarousel.jsx` — eliminados demos
- `src/components/StoresPage.jsx` — eliminados demos, filtro case-insensitive
- `src/components/TourismPage.jsx` — eliminados demos

### Página Productos — Vista con secciones
- Al apretar "Productos" en el nav, se abre vista dedicada con filas por sección (Destacados, Ofertas, Novedades, Liquidación, Tecnología, Tendencia)
- Excluye secciones de servicios y arriendos
- Banner "TU VITRINA DIGITAL" aparece después de la primera sección
- Filtrado por categoría/subcategoría desde sidebar
- Botón "Volver" para regresar a página principal
- Mismo comportamiento que Servicios y Arriendos

### Footer StorePage — Rediseño completo
- **Mobile:** Nombre + redes centrados arriba, Contacto | Horarios en 2 columnas (centrado con contenido alineado izquierda)
- **Tablet/Desktop:** 3 columnas iguales: Contacto | Sobre nosotros | Horarios
- Barra del nombre más compacta en desktop (`py-2.5`)
- Descripción del negocio ahora se carga desde BD (antes era string vacío)

### Tarjetas uniformes en todas las páginas
- ProductCarousel: tarjetas del carrusel ajustadas para ser del mismo tamaño que la destacada (`sm:33.33%`, `md:20%` del contenedor)
- StoreCarousel: mismos anchos que ProductCarousel
- Páginas de filtro (SectionPage, ArriendosPage, ServiciosPage): grid 2→3→5 columnas
- ProductCard: botón tienda ahora visible en sección servicios junto a botón "Solicitar"

### Sidebar — Categorías incluyen carruseles y banners
- `backend/routes/categorias.js`: endpoint `/api/categorias/sidebar` ya no excluye listings con `carousel_posicion` o `banner_orden`
- `StorePage.jsx`: categorías del sidebar de tienda premium extraídas de productos + carruseles + banners
- Ahora todas las categorías de todos los listings aparecen en el sidebar público y en la tienda premium

### Pendientes
- **SMTP Gmail para emails de recuperación de contraseña**

---

## 18 de Marzo 2026 (sesión 11) - Responsive mobile panel admin + mejoras UX

### Panel Admin - Responsive mobile (breakpoints: mobile <700px, tablet 700-1100px, desktop 1101px+)

#### AdminNegocio
- Grid principal: 2 columnas (datos + horarios) apiladas en mobile, lado a lado en tablet+
- Campos WhatsApp/Teléfono, Correo/Dirección, Facebook/Instagram: 1 col mobile, 2 cols tablet+
- Padding formulario: `p-4` mobile, `p-6` tablet+

#### AdminProductos (modal agregar/editar)
- Precios siempre en misma fila (2 cols)
- Categoría + Subcategoría siempre en misma fila (2 cols)
- Tallas + Medidas + Género siempre en misma fila (3 cols)
- Tipo + Etiqueta siempre en misma fila (2 cols)

#### AdminCarruseles
- Popup info actualizado: "¿Dónde aparecen los carruseles?" con texto simple para clientes
- Popup responsive: `max-w-[280px]` y `p-3` en mobile
- Tabs: texto más chico, sin conteo de items
- Grid productos: 2→3→5 columnas responsive
- Nombre carrusel: input y botón apilados en mobile
- Modal: flex-col mobile, imagen w-full, max-h-[90vh] con scroll y header sticky

#### AdminBanner
- Tabs sin conteo, texto responsive
- Vista previa: `h-48` mobile, `h-72` tablet+
- Grid productos: 2→3→5 columnas responsive
- Modal: flex-col mobile, imagen w-full, max-h-[90vh] con scroll y header sticky

#### AdminEstadisticas
- Grid principal: 1 col mobile, 2 cols tablet+
- KPIs comercio: 2 cols mobile, 3 cols tablet+
- Nuevo KPI: **Clicks en productos** (rosa, icono touch_app) — mes actual
- Números de KPIs todos del mismo tamaño (`text-xl` mobile, `text-2xl` tablet+)
- Resumen visitas: 2 cols mobile, 4 cols tablet+

#### AdminTurismo (Mi Negocio turismo)
- Grid principal y campos: 1 col mobile, 2 cols tablet+
- Tabla negocios: scroll horizontal en mobile con min-width

#### AdminTour
- Modal: flex-col mobile, imagen w-full, max-h-[90vh] con scroll y header sticky

#### AdminPortada
- Layout: flex-col mobile, imagen w-full
- Botón "Guardar categorías" eliminado — todo se guarda con el botón "Guardar cambios"
- Vista previa: flex-col mobile

#### AdminPagina
- Layout: flex-col mobile, imagen w-full

### Backend - Nuevo endpoint y mejora analytics
- `GET /api/business/public/:userId` — datos públicos de un negocio sin autenticación
- `GET /api/analytics/stats` — nuevo campo `clicks_mes` en resumen (clicks en productos del mes actual)

### "Ver mi página" — Navegación directa
- Botón ya no abre nueva pestaña (`target="_blank"` eliminado) — navega en misma ventana, mantiene sesión
- Turismo: carga directa de la página premium sin mostrar el listado general (loading mientras busca)
- Si la empresa no está en listado público, carga desde API directamente
- Funciona aunque no tenga portada ni datos de negocio (abre con datos mínimos)

### Archivos modificados
- `src/admin/pages/AdminNegocio.jsx` — responsive mobile
- `src/admin/pages/AdminProductos.jsx` — modal campos siempre en fila
- `src/admin/pages/AdminCarruseles.jsx` — responsive + popup info actualizado
- `src/admin/pages/AdminBanner.jsx` — responsive mobile
- `src/admin/pages/AdminEstadisticas.jsx` — responsive + KPI clicks
- `src/admin/pages/AdminTurismo.jsx` — responsive mobile
- `src/admin/pages/AdminTour.jsx` — modal responsive
- `src/admin/pages/AdminPortada.jsx` — responsive + eliminar botón guardar categorías
- `src/admin/pages/AdminPagina.jsx` — responsive mobile
- `src/admin/components/AdminHeader.jsx` — Ver mi página sin nueva pestaña
- `src/components/TourismPage.jsx` — carga directa página premium
- `backend/routes/business.js` — endpoint público
- `backend/routes/analytics.js` — clicks_mes

---

## 18 de Marzo 2026 (sesión 10) - Páginas dedicadas Servicios y Arriendos, menú hamburguesa mobile, StorePage multi-tipo

### Header mobile - Menú hamburguesa
- Segunda fila del nav mobile: icono hamburguesa + buscador + iconos sesión + botón Planes
- Hamburguesa abre el sidebar de categorías de la sección activa (turismo, productos, etc.)
- Nav items mobile navegan a la página pero NO abren el sidebar automáticamente
- Sidebar mobile solo se abre al apretar hamburguesa, no al cambiar de sección
- Sidebar: ResizeObserver para medir header dinámicamente + visualViewport para mobile

### Página de Arriendos (nueva)
- `ArriendosPage.jsx` — página dedicada al apretar li "Arriendos"
- Grid de tarjetas (2-6 columnas según pantalla/sidebar) con paginación
- Tarjetas con: imagen (object-cover uniforme), badge categoría, nombre, ubicación, negocio, precio
- Icono ojo: abre popup/modal con imagen, descripción completa, precio y contacto (WhatsApp, teléfono, correo, redes)
- Icono tienda: visible solo para plan Normal/Premium (2+), navega a la StorePage del negocio
- Filtrado por categoría/subcategoría desde sidebar
- Datos demo como fallback + datos reales desde `/api/listings` filtrados por `tipo='arriendo'`

### Página de Servicios (nueva)
- `ServiciosPage.jsx` — página dedicada al apretar li "Servicios"
- Layout idéntico a TourismPage: grid 1-2 columnas, tarjetas horizontales
- Tarjetas con: iconos ubicación/horario clickeables, nombre grande, descripción (3 líneas), CardFan de 4 imágenes, categorías
- Botón "Ver más" (plan 2+): navega a la StorePage del negocio
- Botón "Ver fotos": popup con galería carousel de todas las imágenes + descripción completa
- Botón "Contactar": WhatsApp o teléfono
- CardFan4: abanico de 4 tarjetas con tamaño fijo uniforme (130/210/260px según breakpoint)
- Popup galería compacto: max-w-md, imagen con márgenes y bordes redondeados
- FloatingButton "Quitar filtro" cuando hay filtro activo
- Datos demo con imágenes Unsplash + datos reales desde `/api/servicios/public`

### Backend - Endpoint servicios públicos
- `GET /api/servicios/public` — negocios con listings tipo servicio
- Agrupa por negocio: info de business + primeras 5 imágenes de listing_images
- Categorías dinámicas desde listings (GROUP_CONCAT DISTINCT)
- Solo incluye negocios con al menos una imagen

### Panel Admin - Descripción del negocio
- Campo `descripcion` (TEXT) agregado a tabla `businesses`
- `AdminNegocio.jsx`: textarea "Descripción del negocio" en el formulario
- Backend `business.js`: POST incluye descripción en INSERT y UPDATE
- Botón guardar con margen superior (mt-6)

### StorePage - Agrupación por tipo y límites por plan
- Cuando el negocio tiene múltiples tipos de listings, se agrupan en secciones: PRODUCTOS, SERVICIOS, ARRIENDOS
- Cada sección con icono, título, cantidad y filas de carrusel de 10 tarjetas
- Límites de listings por plan: Gratis=5, Normal=25, Premium=100 (total, no por tipo)
- Carruseles y banners NO cuentan en el límite
- Backend valida el límite al crear listings (bloquea si se supera)
- `mapListing` incluye datos de negocio completos (contacto, redes sociales)
- Fix crash ProductModal cuando precio es 0 (servicios) — nullish coalescing

### ProductCard - Mejoras
- Imágenes con `object-cover` para tamaño uniforme en todas las tarjetas
- Fondo `bg-slate-50` en contenedor de imagen

### Base de datos
- `ALTER TABLE businesses ADD COLUMN descripcion TEXT`
- `UPDATE plans SET tiene_pagina = 1 WHERE id = 2` (Normal tiene página)
- Usuario test: `servicio@test.com` / `test123` (plan Normal, 14 listings demo)

### Routing App.jsx
- `toggleNav` con `openSidebar` param: mobile nav items pasan `false`
- Páginas dedicadas: arriendos, servicios (como turismo/locales/eventos)
- `handleSearchSelect` redirige a página dedicada según tipo
- `showInicio` y `onClose` sidebar incluyen arriendos y servicios

### StorePage - Carruseles distribuidos (Opción B)
- **Plan Normal (1 carrusel):**
  - Múltiples secciones: carrusel como separador entre secciones
  - 1 sección con 1 fila: carrusel al final
  - 1 sección con +1 fila: carrusel después de la primera fila
- **Plan Premium (3 carruseles + banner):**
  - Banner publicitario siempre arriba
  - Secciones ordenadas por tamaño (la más grande primero)
  - Carruseles se insertan dentro de la sección más grande (después de fila 1 y fila 3)
  - Carruseles sobrantes como separadores entre secciones
  - Si aún sobran, van al cierre como broche final
  - 1 sección chica (≤10): solo 1 carrusel al final
  - 1 sección grande (50+): C1 después fila 1, C2 después fila 3, C3 cierre

### ArriendosPage - Iconos de acción en tarjetas
- Icono ojo (visibility): abre popup/modal con detalle completo del arriendo
- Icono tienda (storefront): visible solo para plan Normal/Premium (2+), navega a la StorePage
- Precio e iconos en la misma línea inferior de la tarjeta

### Archivos nuevos
- `src/components/ArriendosPage.jsx`
- `src/components/ServiciosPage.jsx`
- `backend/routes/servicios.js`

### Archivos modificados
- `src/components/Header.jsx` — hamburguesa mobile
- `src/components/Sidebar.jsx` — ResizeObserver, mobileClosed por activeNav/openKey
- `src/components/StorePage.jsx` — agrupación por tipo, límites plan, mapListing completo, carruseles distribuidos
- `src/components/ProductCard.jsx` — object-cover, fix precio 0
- `src/admin/pages/AdminNegocio.jsx` — textarea descripción, margen botón guardar
- `backend/routes/business.js` — campo descripcion
- `backend/server.js` — ruta servicios
- `src/App.jsx` — routing arriendos/servicios, toggleNav openSidebar

---

## 17 de Marzo 2026 (sesión 9) - Mejoras mobile/tablet, datos demo, sidebar panel fixed

### Sidebar mobile/tablet - Panel fixed con límites dinámicos
- Panel fixed que va desde debajo del header hasta el borde superior del footer
- Overlay semitransparente para cerrar tocando fuera
- `bottom` dinámico: se ajusta al scrollear según visibilidad del footer (8px margen)
- `top` dinámico: mide la altura real del header con `getElementById`
- Scroll interno en lista de categorías cuando excede el espacio disponible
- Botón de acción y título siempre visibles (shrink-0)
- `openKey` para reabrir menú al tocar el mismo li después de cerrarlo
- Desktop: sidebar sticky lateral sin cambios

### Sidebar - Categorías demo para todos los menús
- **Productos:** Tecnología, Vestuario, Hogar, Deportes, Juguetería (c/u con 4 subcategorías)
- **Servicios:** Construcción, Automotriz, Educación, Belleza y Salud, Mascotas (con subs)
- **Arriendos:** Cabañas, Departamentos, Casas, Hospedajes (con subcategorías)
- **Negocios:** Panadería, Ferretería, Abarrotes, Peluquería, Librería, Cafetería, Mascotas, Bazar
- **Eventos:** Música, Gastronomía, Deporte, Cultura, Artesanía, Familiar, Naturaleza, Nocturno
- **Turismo:** 13 categorías dinámicas desde empresas demo

### Navegación mejorada
- Desde turismo/locales/eventos: tocar productos/servicios/arriendos vuelve a inicio filtrado
- Tocar el mismo li no redirige a inicio, mantiene la vista actual
- Botón "Inicio" visible al seleccionar cualquier li (activeSidebar !== null)
- Backend: categorías de locales solo muestran las que tienen locales activos (INNER JOIN)

### Tarjetas de productos - Datos demo
- 8 productos demo por sección con nombres coherentes (tecnología, ropa, arriendos, etc.)
- Precios variados, ofertas con precio anterior tachado + badge descuento
- Se reemplazan automáticamente cuando hay datos reales

### Carrusel productos mobile
- Sin tarjeta destacada fija — todas rotan juntas
- 2 tarjetas por fila (w-50%), rotación cada 4 segundos
- Tablet/desktop: destacada fija con borde amarillo + carrusel separado

### ProductCard mobile (página principal y "ver todos")
- Imagen más alta: h-32
- Nombre: text-xs, line-clamp-2, min-h-[24px] fijo (siempre 2 líneas de espacio)
- Descripción: text-[10px], line-clamp-3, min-h-[36px] fijo (siempre 3 líneas)
- Precio: text-[10px], botones h-6 w-6
- Todas las tarjetas misma altura gracias a min-h fijos
- "Ver todos": grid 2 columnas en mobile

### Eventos - Datos demo y carrusel mobile
- 8 eventos demo: Festival Cerveza, Música en Vivo, Feria Artesanal, Fútbol, Teatro, etc.
- Mobile: carrusel 2 filas con rotación cada 4 segundos
- Tarjetas con mismos tamaños que productos (imagen h-32, textos text-[10px])
- EventsPage: datos demo, grid 2 cols mobile, tarjetas compactas

### Locales/Negocios - Datos demo
- 8 negocios demo: Panadería Don Luis, Ferretería El Clavo, Minimarket, etc.
- StoresCarousel: imagen nueva, nombre text-xs, avatares w-24 h-24
- StoresPage: datos demo con categorías, grid 2 cols mobile, tarjetas con min-h

### Turismo - Datos demo completos
- 5 empresas demo: Aventura Villarrica, Termas del Sur, Cabalgatas Mapuche, Kayak, Trekking
- Cada una con 3 imágenes, descripción, dirección, horarios, contacto, subcategorías
- Página premium: 6 tours demo con precios, ubicación, descripción detallada
- Sección "Sobre Nosotros" y "Datos de la Empresa" con textos demo
- Abanico mobile: más junto (translateX ±28px, rotate ±12°, contenedor 120x100)
- Tarjetas turismo mobile: min-h-[195px], descripción line-clamp-5, botón "Ver más" whitespace-nowrap
- Categorías debajo del abanico: text-[10px], min-h-[28px] para 2 filas
- Modal tour mobile: carrusel 1 imagen con flechas y indicadores (no grid)

### Banner mobile
- Textos beneficios: text-[11px] (más grandes)
- Filas más juntas: gap-y-0, -mt-3
- Slides parejos: "CONOCE ANTES / DE COMPRAR" en 2 líneas como "TU VITRINA / DIGITAL"

### Header tablet
- Más alto: py-4, icono text-3xl con p-2, nombre text-xl
- Quitar icono persona del header, agregar icono registrarse en nav bar
- Buscador centrado y más angosto: max-w-[280px] con mx-auto
- Buscador mobile más ancho: w-[55%]

### Footer tablet
- Layout propio: logo + descripción en misma fila, 5 columnas debajo
- Columnas: Accesos, Legal, Mi cuenta, Contacto, Redes Sociales
- id="main-footer" para medición dinámica del sidebar

### Pendientes próxima sesión
- Revisar StorePage premium (comercio) en mobile
- **SMTP Gmail para emails de recuperación de contraseña**
- Eliminar datos demo cuando haya contenido real

---

## 16 de Marzo 2026 (sesión 8) - Responsive mobile y tablet

### Configuración de breakpoints
- **tailwind.config.js:** breakpoints personalizados `sm: 700px` (tablet), `md: 1101px` (desktop)
- Modo normal (desktop 1101px+) no fue modificado en ningún componente

### Header mobile (0-699px)
- Logo e icono más grandes (`text-2xl`, `py-4`)
- Buscador movido a la barra de navegación inferior (no en el header)
- Nav items (Productos, Servicios, Arriendos, Turismo, Negocios) siempre visibles en fila horizontal con scroll touch
- Registrarse e Ingresar como solo iconos, alineados a la derecha junto a botón Planes
- Eliminado botón hamburguesa (menú siempre visible)
- Eliminado carrito de compras de todos los modos (no se venden productos)

### Sidebar mobile/tablet
- Panel vertical flotante (`absolute`) sobre el contenido, no empuja el main
- Ancho ajustado al contenido (`w-fit`, `min-w-[180px]`, `max-w-[55%]`)
- Se cierra al: seleccionar opción, click fuera del panel, o botón X
- Categorías y subcategorías en lista vertical con scroll
- Desktop: sidebar lateral sin cambios

### Footer mobile
- Logo + descripción en una sola fila (icono izquierda, texto derecha)
- Fila 1: Accesos | Legal | Mi cuenta (3 columnas centradas con contenido alineado izquierda)
- Fila 2: Contacto | Redes Sociales (2 columnas centradas)
- Textos compactos (`text-[9px]`, `text-[8px]`)

### Componentes de contenido adaptados
- **ProductCarousel:** 2 tarjetas mobile, 3-4 tablet, 5-6 desktop
- **ProductCard:** imagen más corta, textos reducidos
- **Banner:** layout vertical en mobile (título → cartas abanico → beneficios), horizontal compacto en tablet
- **EventsSection:** grid 2→3→4 columnas responsive
- **StoresCarousel:** círculos 80px→112px→144px según modo
- **PlansModal:** planes en scroll horizontal con snap en mobile

### Páginas secundarias
- **SectionPage, StoresPage, EventsPage:** grids 2→3→5/6 columnas
- **TourismPage:** CardFan escalado, grilla tours 2→3→6 cols, tarjetas empresa compactas
- **StorePage:** banner 2→4 cols, footer responsivo, marquee adaptado

### Admin (compatibilidad breakpoints)
- Reemplazados `lg:`/`xl:` por `md:` en AdminDashboard, ProgramadorEventos, ProgramadorLocales

### Pendientes próxima sesión
- Ajustar modo tablet (700-1100px) con más detalle
- Revisar StorePage premium en mobile
- **SMTP Gmail para emails de recuperación de contraseña**
- **Analizar páginas públicas:** página principal, StorePage premium, páginas filtrado "Ver todos"

---

## 16 de Marzo 2026 (sesión 7) - Conexión API pública + auditoría completa paneles admin

### Componentes públicos conectados a la API (ya no usan datos hardcodeados)
- **StoresCarousel** — Carga locales desde `GET /api/locales`, muestra mensaje si no hay datos
- **StoresPage** — Carga locales desde `GET /api/locales`, filtrado por categoría desde BD
- **EventsSection** — Carga primeros 8 eventos desde `GET /api/eventos`, badge dinámico por categoría/gratis
- **EventsPage** — Carga todos los eventos desde `GET /api/eventos`, filtrado por categoría desde BD
- **Sidebar** — Categorías de locales y eventos cargadas desde `/api/locales/categorias` y `/api/eventos/categorias`
- Las secciones siempre muestran título + "Ver todo" aunque no haya datos (no desaparecen)

### Correcciones estadísticas del programador
- **Promedio diario corregido:** usa `COUNT(DISTINCT DATE(created_at))` (días reales con visitas, no calendario)
- **Visitantes reiterados corregido:** cuenta IPs con más de 1 visita (personas reales que volvieron)
- **Deduplicación de visitas:** `POST /api/servidor/visita` limita 1 registro por IP cada 30 minutos
- **Nuevo KPI "Visitas hoy"** agregado al panel (grid 7 columnas)

### Correcciones panel programador (Locales y Eventos)
- **parseCrop seguro:** parsea `imagen_crop` tanto si llega como string JSON o como objeto
- **Toast de feedback:** notificación verde/roja al crear, editar, eliminar, toggle y guardar encuadre
- **Manejo de errores:** errores del servidor se muestran al usuario en vez de fallar silenciosamente

### Mejoras de arquitectura backend
- **programadorMiddleware centralizado:** definido una sola vez en `auth.js`, importado en `servidor.js`, `locales.js`, `eventos.js`
- **Register devuelve `rol`:** consistente con login (antes faltaba)
- **Rutas dinámicas en servidor.js:** `/var/www/...` reemplazado por `path.join(__dirname, '..', 'uploads')`
- **ImageZoomPan:** borde corregido para dark mode (`border-gray-200` → `border-slate-600`)
- **CORS:** agregado `http://soloaunclick.cl`, `http://www.soloaunclick.cl` y `http://45.236.130.25` a whitelist

### Correcciones panel admin comercio (Productos/Servicios/Arriendos)
- **N+1 Query eliminado en listings.js:** tallas y medidas ahora se cargan en batch con `WHERE IN (?)` en vez de 1 query por producto
- **Imagen eliminada del disco al borrar listing:** `DELETE /api/listings/:id` ahora borra el archivo físico
- **alert() eliminado en todo el panel admin:** reemplazado por toast (AdminProductos, AdminCarruseles, AdminBanner) y error inline (AdminNegocio)
- **AdminBanner fixes:** `generateCroppedBlob` faltaba fillRect blanco, `clampPos` fórmula incorrecta, `buildBodyFromItem` faltaba campo `categoria`

### Correcciones panel admin turismo
- **parseJSON seguro:** aplicado en AdminTour (imagenes/crops), AdminPortada (imagenes/categorias/crops), AdminPagina (crop_superior/inferior), AdminEstadisticas (conteo imagenes)
- **Toast feedback en AdminTour:** notificaciones al crear, editar, eliminar tours
- **Feedback error en AdminNegocio:** errores del servidor y validación de redes sociales

### Correcciones analytics
- **Deduplicación page_visits:** `POST /api/analytics/track` con page_view limita 1 registro por IP cada 30 min por user

### Correcciones página premium turismo (pública)
- **Buscador turismo:** categorías de turismo ahora estáticas en searchIndex.js (17 categorías). Ya no depende de `companies` vacío
- **parseJSON seguro en TourismPage:** crops de página, imágenes/crops de tours y TourModal
- **Feedback de error:** mensajes visibles al usuario si fallan las peticiones (lista empresas y detalle empresa)
- **Eliminado export `companies` vacío** de TourismPage

### searchIndex.js
- Categorías de locales, eventos y turismo definidas localmente (ya no importa de componentes)

### Contraseña programador actualizada en producción
- `patcorher@gmail.com` / `Pmmj8282` — reseteada en BD de producción

### Pendientes para próxima sesión
- **Analizar página principal pública:** verificar conexiones, flujo de datos, inconsistencias
- **Analizar página premium de comercio (StorePage):** verificar tienda, carruseles, banners, filtros
- **Analizar páginas de filtrado "Ver todos":** SectionPage y filtrado por categoría/subcategoría
- **SMTP Gmail:** pendiente configurar para emails de recuperación de contraseña

---

---

## 13 de Marzo 2026 (sesión 6) - Panel Programador + Servidor

### Panel Programador (tema oscuro)
- Nuevo panel exclusivo para rol `programador` con tema dark (slate-900/950 + emerald)
- Login con credenciales del programador, detección por `rol` en BD
- Sidebar propio: Locales de Barrio, Próximos Eventos, Servidor
- Header limpio: sin nombre, sin plan, solo iconos de panel y logout
- Header público también limpio para programador (sin "Hola Programador Plan Premium")

### Locales de Barrio (CRUD completo)
- Tabla `locales_barrio` + tabla `categorias_barrio` con FK
- Backend: `/api/locales` — CRUD con multer, sanitización, programadorMiddleware
- Frontend: `ProgramadorLocales.jsx` — crear/editar/eliminar con ImageZoomPan
- Categorías desde BD (farmacia, abarrotes, florería, peluquería, etc.)
- Orden público aleatorio (ORDER BY RAND())
- Toggle activar/desactivar

### Próximos Eventos (CRUD completo)
- Tabla `eventos` + tabla `categorias_evento` con FK
- Backend: `/api/eventos` — CRUD con mismo patrón que locales
- Frontend: `ProgramadorEventos.jsx` — crear/editar con ImageZoomPan
- Campos: título, fecha, dirección, precio, categoría (desde BD), imagen
- Categorías: música, gastronomía, deporte, ferias, teatro, etc.

### Monitoreo de Servidor
- Backend: `/api/servidor/stats` — estadísticas de disco y BD (protegido con programadorMiddleware)
- Frontend: `ProgramadorServidor.jsx` — dos paneles lado a lado
- **Almacenamiento:** anillo de progreso con % usado, total/usado/disponible
- **Carpeta uploads:** expandible con desglose por subcarpetas (imágenes raíz + carousels)
- **Base de Datos:** anillo de progreso, datos/índices/tablas, tabla detallada por tabla MySQL
- Botón Actualizar para recargar stats

### Correcciones
- Fix `ip_address` → `ip` en INSERT de user_sessions (auth.js)
- Fix header público mostrando "Hola Programador Plan Premium" → solo iconos

### Pendientes
- **Conectar componentes públicos a API:** StoresCarousel, StoresPage, EventsSection, EventsPage aún usan datos hardcodeados
- **SMTP Gmail:** pendiente configurar para emails de recuperación de contraseña

---

## 13 de Marzo 2026 (sesión 5) - Correcciones de seguridad backend

### Helmet — Headers de seguridad HTTP
- Se agregó `helmet` para enviar headers seguros automáticamente (X-Content-Type-Options, X-Frame-Options, etc.)
- Configurado con `crossOriginResourcePolicy: 'cross-origin'` para que las imágenes carguen correctamente

### CORS restringido con whitelist
- CORS ya no acepta cualquier origen — solo `soloaunclick.cl`, `www.soloaunclick.cl`, `localhost:5173`, `localhost:3000`
- Requests sin `Origin` (mismo servidor, Postman) siguen permitidos

### Rate Limiting (protección contra brute force)
- **Global:** máximo 300 requests por IP cada 15 minutos
- **Login/Register:** máximo 10 intentos por IP cada 15 minutos
- **Password Reset:** máximo 5 intentos por IP por hora
- Mensajes de error en español para el usuario

### Sanitización de inputs (anti-XSS)
- Función `sanitize()` que elimina tags HTML de todos los campos de texto antes de guardarlos en BD
- Aplicado en: auth (register), business, listings, tours, portada, pagina
- URLs de imágenes no se sanitizan (se requieren tal cual)

### Validación con express-validator
- Login: valida email y contraseña obligatoria
- Register: valida email, contraseña mínimo 6 caracteres, nombre requerido
- Password Reset Request: valida formato de email
- Normalización automática de emails (lowercase, trim)

### Middleware centralizado de errores
- Captura errores de CORS, Multer (tamaño/tipo archivo) y errores genéricos
- Respuestas JSON consistentes en español

### Dependencias nuevas
- `express-rate-limit` ^7.1.5
- `helmet` ^7.1.0
- `express-validator` ^7.0.1

---

## 13 de Marzo 2026 (sesión 4) - Turismo premium: filtros, tracking, zoom imágenes y mejoras UX

### Separación columnas contacto en página premium turismo
- Información de contacto en 3 columnas con más separación (gap-8 → gap-10)
- Texto más compacto (text-[11px]) y whitespace-nowrap para que cada item quede en una fila

### Fix: "Ver mi página" redirige correctamente según tipo de cuenta
- Turismo usa `?turismo=ID` en vez de `?store=ID`
- App.jsx maneja parámetro `?turismo=` para abrir página turismo directamente
- TourismPage acepta `initialUserId` y auto-selecciona la empresa correspondiente

### Categorías por tour y filtrado desde sidebar
- Nueva columna `categoria` en tabla `turismo_tours`
- Selector de categoría en admin tours (carga categorías desde portada del usuario)
- Al clickear categoría en sidebar dentro de página premium: filtra tours por categoría (no cierra la página)
- Botón flotante sticky "Ver todos los tours" para quitar el filtro
- Título de sección cambia al nombre de la categoría activa

### Grid de tours: 6 columnas por fila
- Cambio de grid-cols-4 a grid-cols-6 para mostrar máximo 6 tours por fila
- Con 8 tours: 6 arriba y 2 abajo (siempre empieza con 6)

### Tracking de clicks en tarjeta turismo
- Nuevo event_type `card_click` en tabla analytics (ENUM actualizado)
- Se registra click en: icono ubicación, icono horario, botón "Ver más", botón "Contactar"
- Gráfico "Clicks en tu tarjeta" en estadísticas usa `card_click` para turismo
- Subtítulo actualizado: "iconos y botón Ver más"

### Click en "Turismo" nav vuelve a portada general
- Nuevo `resetKey` que se incrementa al clickear "Turismo" en la barra de navegación
- Deselecciona empresa activa y restaura todas las categorías en el sidebar

### Zoom y pan en imágenes del admin turismo
- Componente reutilizable `ImageZoomPan` con zoom +/- (100% a 300%) y arrastrar mouse/touch
- Controles de zoom centrados en la parte inferior de la imagen
- Scroll del mouse para hacer zoom
- Aplicado en: Portada (3 imgs), Tour (3 imgs), Mi Página (superior/inferior)

### Guardar encuadre (zoom + posición) de imágenes
- Nuevas columnas: `imagenes_crop` en turismo_portada y turismo_tours, `crop_superior`/`crop_inferior` en turismo_pagina
- Endpoints `PATCH /api/portada/:id/crop`, `PATCH /api/tours/:id/crop`, `PATCH /api/pagina/:id/crop`
- Botón "Guardar encuadre" debajo de cada imagen en el admin
- Crops aplicados en página pública: CardFan (portada), página premium (filas sup/inf), grilla de tours y modal de tours
- La imagen original NO se modifica, solo se guarda metadata de visualización (CSS transform)

### Limpieza de base de datos
- Vaciado completo de todas las tablas excepto `plans`, `categorias` y `subcategorias`
- AUTO_INCREMENT reseteado a 1 en todas las tablas vaciadas

### Pendientes
- **SMTP Gmail:** Configurar App Password para emails de recuperación de contraseña (solo se loguean en consola)
- **Categorías:** Continuar poblando desde letra I en adelante
- **Locales de barrio:** Tabla + panel programador pendiente

## 12 de Marzo 2026 (sesión 3) - Perfil editable, modal más ancho, tracking de clicks y mejoras admin

### Saludo simplificado en header
- Muestra solo primer nombre (máx 10 caracteres + "...") + "Plan Premium/Normal/Gratis"
- Eliminado el tipo de negocio (Productos/Servicios/Arriendos) del saludo
- Aplicado en página principal (Header.jsx) y página premium (App.jsx nav bar)

### Icono de perfil en panel de administrador
- Icono de usuario (account_circle) al lado de la hamburguesa en AdminHeader
- Modal con datos reales de la BD: nombre, correo, teléfono, ubicación, tipo de cuenta, plan, fecha de registro
- Editable: tipo de cuenta (Comercio/Turismo) con checkboxes Productos/Servicios/Arriendos
- Editable: plan (Gratis/Normal/Premium) con botones de colores
- Backend: `PUT /api/auth/profile` actualiza tipo de cuenta y plan + `GET /api/auth/profile/counts` para conteos

### Popup de confirmación al cambiar tipo de cuenta
- Al desmarcar Productos/Servicios/Arriendos: popup rojo advierte qué datos se eliminarán (publicaciones, carrusel, banner)
- Al cambiar Comercio → Turismo: elimina TODOS los datos de comercio (listings, imágenes, carruseles, negocio)
- Al cambiar Turismo → Comercio: elimina TODOS los datos de turismo (tours, portada, página, negocio)
- Archivos de imágenes eliminados del servidor
- Backend: funciones `deleteListingsByType`, `deleteAllCommerceData`, `deleteAllTurismData`
- Muestra conteo de registros existentes junto a cada checkbox

### Botón "Ver mi página" en admin
- Barra bajo el header del panel admin con link "Ver mi página" centrado
- Solo visible para plan Normal y Premium (plan_id >= 2)
- Abre en pestaña nueva (target="_blank") para no salir del admin
- App.jsx maneja parámetro `?store=userId` para abrir tienda directamente

### Modal de producto más ancho
- ProductCard modal ampliado de `max-w-md` a `max-w-lg` para que iconos inferiores no se corten

### Fix: tracking de clicks en productos de StorePage
- `mapListing` en StorePage no incluía `user_id`, impidiendo que `trackProductClick` registrara clicks
- Corregido: ahora los clicks desde la página de tienda (ojo + carruseles) se registran correctamente en analytics

### Gráficos de estadísticas: mes siguiente visible
- Los gráficos de visitas y clicks ahora muestran 7 meses: 5 anteriores + mes actual + mes siguiente
- El mes actual nunca queda como último punto del gráfico

### Backend: campo dirección en /api/auth/me
- Endpoint `/api/auth/me` ahora incluye `u.direccion` en la consulta

### Productos y carruseles de prueba
- 60 productos para `productos.premium@test.cl` (10 por sección)
- 24 productos de carrusel (8 × 3 carruseles) con productos variados
- Contraseñas de todos los usuarios de prueba reseteadas a `test123`

### Pendientes
- **SMTP Gmail para emails de recuperación de contraseña**
- **Poblar categorías desde letra I en adelante**
- Tabla de locales de barrio + panel programador
- Conectar StoresCarousel/StoresPage a esa tabla
- Limpiar datos demo del RegisterModal

---

## 12 de Marzo 2026 (sesión 2) - Mezcla ponderada, popup carruseles, productos de prueba y mejoras UI

### Mezcla ponderada de productos por plan en página principal
- Nuevo algoritmo `mixProductsByPlan` en `App.jsx`: los productos de cada sección se mezclan ponderando por plan del negocio
- Pesos por ronda: Premium recibe 3 slots, Normal 2, Gratis 1
- Round-robin entre negocios del mismo tier para distribución equitativa
- Selección aleatoria del producto de cada negocio (cambia cada carga)
- La tarjeta dorada (primer slot de plan>=2) no se altera

### Popup informativo en AdminCarruseles
- Al entrar a la sección Carruseles del admin aparece un popup con los requisitos de visibilidad
- Plan Normal: carrusel visible con 12+ productos publicados
- Plan Premium: carrusel 1 a los 12+, carrusel 2 a los 32+, carrusel 3 a los 52+ productos
- Popup se puede cerrar con botón "Entendido"

### Modal de producto más ancho
- `ProductCard.jsx`: modal ampliado de `max-w-md` (448px) a `max-w-lg` (512px)
- Los iconos de contacto inferiores ya no se cortan

### Descripción centrada verticalmente en modales
- ProductCard y StorePage: descripción del producto centrada verticalmente con `flex items-center`
- Scroll automático si el texto es muy largo, manteniendo márgenes con nombre y contenido inferior

### Visibilidad de carruseles en StorePage
- Carrusel 1 visible con 12+ productos, carrusel 2 con 32+, carrusel 3 con 52+
- Consistente con los requisitos mostrados en el popup de admin

### Productos de prueba cargados
- 60 productos reales para `productos.premium@test.cl` (10 por sección: destacados, ofertas, novedades, liquidación, tecnología, tendencia)
- Cada producto con nombre, descripción, precio, categoría, subcategoría, badge, género, imagen, tallas y/o dimensiones según corresponda
- 24 productos de carrusel (8 por cada uno de los 3 carruseles) con productos variados de distintas categorías

### Pendientes
- **SMTP Gmail para emails de recuperación de contraseña** — falta configurar App Password de Gmail y setear SMTP_USER/SMTP_PASS en el servidor
- **Poblar categorías desde letra I en adelante** en tabla `categorias`/`subcategorias`
- Tabla de locales de barrio + panel programador
- Conectar StoresCarousel/StoresPage a esa tabla
- Limpiar datos demo del RegisterModal

---

## 12 de Marzo 2026 - Límites por plan separados, sidebar categorías reales, nav bar tienda y mejoras UX

### Límites de plan: productos, carruseles y banner separados
- Backend (`listings.js`): el COUNT de límite del plan solo cuenta productos normales (`carousel_posicion IS NULL AND banner_orden IS NULL`)
- Carruseles y banners no consumen cuota del plan
- Límites: Normal = 25 productos + 8 carrusel (1 carrusel), Premium = 100 productos + 24 carrusel (3x8) + 10 banner (2x5)
- AdminProductos: lista de productos excluye tarjetas de carrusel y banner
- AdminCarruseles: eliminado sistema de "productos mínimos para desbloquear", carruseles disponibles directamente según plan (Normal: 1, Premium: 1-3)

### Nav bar en página premium (tienda)
- Nueva barra de navegación bajo el header de la tienda con estilo idéntico a la principal (`bg-[#4A2070]`, `border-y-2 border-accent`)
- Usuario logueado: muestra "Hola, María Productos Normal" + icono dashboard + icono logout
- Usuario no logueado: botón "Inicio" para volver
- Botón "Volver" al lado izquierdo de la nav bar para regresar a la página principal
- Header principal también muestra tipo de negocio y plan junto al saludo

### Volver desde tienda restaura posición de scroll
- `scrollBeforeStore` guarda la posición del scroll antes de abrir una tienda
- Al presionar "Volver", restaura la posición exacta donde estaba la tarjeta que llevó a la tienda

### Sidebar página premium: categorías reales
- Muestra las categorías reales de los productos (ej: Ropa, Electrónica) en vez de tipos (Productos/Servicios/Arriendos)
- Subcategorías se despliegan con accordion al hacer click en una categoría
- Título cambiado de nombre de tienda a "Categorías"
- Eliminada sección "Secciones" del menú lateral
- Botón "Volver" movido del sidebar a la nav bar

### Sidebar ancho dinámico
- Ambos sidebars (principal y tienda) usan `w-max max-w-44` en vez de `w-44` fijo
- El ancho se ajusta al texto más largo de las categorías
- Nombres de varias palabras se dividen en dos líneas
- Subcategorías alineadas al mismo nivel que categorías (`pl-2` en vez de `pl-6`)

### Botón "Ver todos los productos"
- Aparece entre la nav bar y la primera sección cuando hay filtro activo (categoría o subcategoría)
- Texto "← Ver todos los productos" limpia filtros al hacer click
- Margen superior aumentado (`pt-4`) para separar contenido del header

### Carrusel marquee mejorado
- Velocidad ajustada de 20s a 18s
- Si hay menos de 6 items: se muestran centrados sin duplicar ni animar
- Si hay 6+ items: efecto marquee infinito con duplicación

---

## 11 de Marzo 2026 (noche 3) - Sidebar público conectado a productos reales

### Sidebar muestra solo categorías con productos publicados
- Nuevo endpoint `GET /api/categorias/sidebar`: consulta DISTINCT categorías/subcategorías desde la tabla `listings` (activo=1, categoria NOT NULL, excluye carrusel y banner)
- `App.jsx`: sidebar ahora usa `/api/categorias/sidebar` en vez de `/api/categorias`
- Si no hay productos publicados → sidebar muestra "Sin categorías aún"
- Cuando un admin crea un producto con categoría X y subcategoría Y, esas aparecen automáticamente en el sidebar público
- Se eliminó la dependencia de la tabla de referencia `categorias` para el sidebar público (esa tabla sigue usándose en los paneles admin para los selects de categoría/subcategoría)

### Nginx — Fix caché
- `index.html` ahora tiene headers `no-cache, no-store, must-revalidate` para que el navegador siempre cargue el JS más reciente
- Eliminada config `default` duplicada que podía interferir
- Assets JS/CSS siguen con caché de 30d (tienen hash en el nombre)

---

## 11 de Marzo 2026 (noche 2) - UI recuperación de contraseña + nodemailer

### Mailer (backend/mailer.js) — NUEVO
- Transporter SMTP configurable vía env vars: SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM, SITE_URL
- Default: Gmail SMTP (smtp.gmail.com:587)
- `sendPasswordResetEmail(email, nombre, token)` — email HTML con branding Solo a un Click
- Botón "Restablecer contraseña" enlaza a `SITE_URL?reset=TOKEN`
- Si SMTP no está configurado, loguea token en consola (testing)

### passwordReset.js — Conectado a mailer
- `POST /request` ahora envía email real si SMTP está configurado
- Fallback: loguea token en consola para testing sin email

### LoginModal.jsx — Reescrito con flujo de recuperación
- Nuevo componente `ForgotPasswordView` con 3 pasos:
  1. **Email**: formulario para solicitar reset, muestra confirmación con icono
  2. **Nueva contraseña**: dos campos (contraseña + confirmar), validación mín 6 chars
  3. **Éxito**: confirmación visual con botón "Ir a login"
- Detecta `?reset=TOKEN` en URL para abrir directamente el paso 2
- Limpia URL después de leer el token
- Link "Olvidé mi contraseña" al lado del label de contraseña

### Header.jsx — Auto-abrir login si hay ?reset=
- Si URL contiene `?reset=`, abre LoginModal automáticamente al cargar

### Dependencias
- `nodemailer ^6.9.8` agregado a backend/package.json
- Instalado en servidor de producción

### Para activar emails reales
Configurar variables de entorno en el servidor:
```bash
pm2 set soloaunclick-api:SMTP_USER tu_email@gmail.com
pm2 set soloaunclick-api:SMTP_PASS tu_app_password
```
O crear `/var/www/soloaunclick/backend/.env` con:
```
SMTP_USER=tu_email@gmail.com
SMTP_PASS=tu_app_password_de_google
```

---

## 11 de Marzo 2026 (noche) - 4 tablas nuevas: page_visits, user_sessions, activity_log, password_resets

### page_visits — Tracking de visitas con IP
- `POST /api/analytics/track` ahora inserta en `page_visits` cuando `event_type=page_view`
- Registra: user_id (dueño del negocio), visitor_ip, pagina ('tienda' o 'turismo')
- `GET /api/analytics/stats` ahora lee visitas desde `page_visits` (no analytics)
- Nuevos datos en stats: `resumen.visitas_mes`, `resumen.visitantes_unicos`, `resumen.por_pagina`
- `StorePage.jsx` envía `pagina: 'tienda'` en tracking
- `TourismPage.jsx` CompanyDetail registra visita con `pagina: 'turismo'`
- `AdminEstadisticas.jsx` nueva sección "Resumen de visitas — Mes actual" con 3 tarjetas:
  - Visitas totales del mes
  - Visitantes únicos (por IP)
  - Desglose por tipo de página

### user_sessions — Registro de cada login
- `auth.js` login inserta en `user_sessions` (user_id, ip_address, user_agent)
- `auth.js` register también registra primera sesión
- Error en sesión no bloquea login/register (try/catch separado)

### activity_log — Log de acciones de administradores
- Nuevo helper `backend/logActivity.js`: `logActivity(userId, accion, entidad, entidadId, detalles)`
- Acciones: 'crear', 'editar', 'eliminar'
- Entidades: 'listing', 'tour', 'portada', 'business'
- Conectado a:
  - `listings.js`: crear/editar/eliminar publicaciones
  - `tours.js`: crear/editar/eliminar tours
  - `portada.js`: crear/editar/eliminar portada
  - `business.js`: crear/editar negocio

### password_resets — Recuperación de contraseña
- Nueva ruta `/api/password-reset` con 3 endpoints:
  - `POST /request` — genera token de 1h, invalida anteriores, no revela si email existe
  - `POST /validate` — verifica validez del token
  - `POST /reset` — cambia contraseña con token válido (mín 6 chars)
- Registrada en `server.js`
- TODO: configurar nodemailer + SMTP para envío real de emails
- TODO: crear UI "Olvidé mi contraseña" en frontend

### Archivos nuevos
- `backend/logActivity.js`
- `backend/routes/passwordReset.js`

### Archivos modificados
- `backend/routes/analytics.js` — page_visits insert + stats desde page_visits
- `backend/routes/auth.js` — user_sessions en login y register
- `backend/routes/business.js` — logActivity
- `backend/routes/listings.js` — logActivity
- `backend/routes/portada.js` — logActivity
- `backend/routes/tours.js` — logActivity
- `backend/server.js` — ruta passwordReset
- `src/admin/pages/AdminEstadisticas.jsx` — sección resumen visitas
- `src/components/StorePage.jsx` — pagina: 'tienda' en tracking
- `src/components/TourismPage.jsx` — tracking visita turismo

---

## 11 de Marzo 2026 (tarde) - Categorías dinámicas BD, página principal conectada, admin con selects reales

### Endpoint `/api/categorias` (NUEVO)
- `GET /api/categorias?tipo=turismo` — categorías con subcategorías por tipo
- Soporte multi-tipo: `?tipo=producto,servicio,arriendo` (separados por coma)
- Agrupa subcategorías bajo cada categoría
- Registrado en server.js

### Admin Portada Turismo — Categorías desde BD
- Eliminado array hardcodeado `CATEGORIAS_EJEMPLO`
- Ahora carga categorías tipo=turismo desde `/api/categorias?tipo=turismo`
- Chips de selección muestran subcategorías reales de la BD

### Admin Productos/Carruseles/Banner — Categorías y subcategorías dinámicas
- Nuevos selects: **Categoría** y **Subcategoría** (reemplazan el input de texto libre)
- Categorías se cargan desde BD filtradas por permisos del usuario:
  - Si marcó `vende_productos` → ve categorías tipo=producto
  - Si marcó `ofrece_servicios` → ve categorías tipo=servicio
  - Si marcó `ofrece_arriendos` → ve categorías tipo=arriendo
  - Si marcó varias → ve las categorías de todas las que marcó
- Al cambiar **Tipo** se resetea categoría y subcategoría
- Al cambiar **Categoría** se resetea subcategoría
- Subcategorías filtradas según la categoría seleccionada
- Campo `categoria` agregado al body de INSERT/UPDATE en backend
- Pestaña "Tendencia" agregada en AdminProductos

### Columna `categoria` en tabla `listings`
- `ALTER TABLE listings ADD COLUMN categoria VARCHAR(100) DEFAULT NULL AFTER precio_original`
- Ya ejecutado en servidor

### Backend Listings — Filtro feed principal
- `GET /api/listings` ahora excluye items de carrusel (`carousel_posicion IS NULL`) y banner (`banner_orden IS NULL`)
- Evita que productos de carrusel/banner aparezcan duplicados en las secciones de la página principal

### Página Principal — 8 secciones conectadas a BD
- Eliminado fallback a datos estáticos (`staticSections` de products.js)
- Las 8 secciones siempre se muestran con sus títulos aunque estén vacías
- ProductCarousel muestra "Próximamente" en secciones sin productos
- Sección "Tendencia" renombrada (antes era "turismo", ahora es independiente)
- Campo `categoria` incluido en el mapeo de listings

### Sidebar Público — Categorías reales desde BD
- Eliminados ~70 items hardcodeados (productos, servicios, arriendos)
- Ahora carga desde `/api/categorias?tipo=producto,servicio,arriendo`
- Muestra jerarquía real: Categoría → Subcategorías (expandible)
- Si no hay categorías en BD para un tipo → "Sin categorías aún"
- Turismo, Locales y Eventos no cambian

### 8 secciones de la página principal
1. **Productos Destacados** (destacados)
2. **Productos en Ofertas** (ofertas)
3. **Arriendos** (arriendos)
4. **Novedades** (novedades)
5. **Servicios** (servicios)
6. **Productos en Liquidación** (liquidacion)
7. **Tendencia** (tendencia) — ya no relacionada con turismo
8. **Tecnología** (tecnologia)

Intercalados: Banner (después de fila 2), Eventos (después de fila 3), Tiendas (después de fila 5)

---

## 11 de Marzo 2026 - Admin Mi Página, Sidebar dinámico, Categorías BD y Turismo Fix

### Admin Mi Página (`AdminPagina.jsx`) — Solo Premium
- Nueva sección en panel admin turismo para gestionar las filas de la página premium
- Dos pestañas: "Imagen + Texto Superior" e "Imagen + Texto Inferior"
- Cada pestaña: upload de imagen + campo título + textarea texto
- Vista previa en tiempo real de cómo se verá en la página premium
- Botón guardar con feedback verde "Guardado" por 3 segundos
- Conectado a BD: carga datos existentes, upload de imágenes vía /api/upload, POST/PUT a /api/pagina
- Fix dev-token 401 incluido
- Sidebar admin: nueva entrada "Mi Página" con icono web, bloqueada para plan gratis

### Backend Mi Página (`routes/pagina.js`)
- `GET /api/pagina` — datos del usuario autenticado
- `GET /api/pagina/public/:userId` — datos públicos por userId
- `POST /api/pagina` — crear con ON DUPLICATE KEY UPDATE (1 registro por usuario)
- `PUT /api/pagina/:id` — actualizar con validación Premium y user_id

### Página Premium Conectada a turismo_pagina
- CompanyDetail carga en paralelo tours + datos de página (`/api/pagina/public/:userId`)
- Fila superior: imagen, título y texto desde turismo_pagina (fallback a portada)
- Fila inferior: imagen, título y texto desde turismo_pagina + datos de contacto
- Sin cruce de datos: todo filtrado por userId de cada empresa

### Nueva tabla MySQL: `turismo_pagina`
- Columnas: id, user_id (UNIQUE), titulo_superior, texto_superior, imagen_superior, titulo_inferior, texto_inferior, imagen_inferior, created_at, updated_at

### Sidebar Dinámico desde BD
- Sidebar productos/servicios/arriendos muestra solo subcategorías que existen en listings reales
- Sin datos en BD = sidebar vacío (ya no muestra categorías hardcodeadas de ejemplo)
- Subcategorías extraídas de listings con tipo (producto/servicio/arriendo) para filtrar por sección
- Iconos heredados del mapeo hardcodeado cuando existe, genérico si no

### Turismo Header Fix
- Click en "Turismo" en el header ya no saca de la página al hacer doble clic
- Si ya estás en turismo: limpia filtros, vuelve a lista principal y scroll arriba

### Tablas de Categorías y Subcategorías
- Nuevas tablas: `categorias` (tipo, nombre, icono, orden) y `subcategorias` (categoria_id FK, nombre, orden)
- UNIQUE constraints para evitar duplicados
- CASCADE en FK: borrar categoría elimina sus subcategorías
- **Categorías pobladas (hasta letra H):**
  1. Accesorios para Vehículos (22 subcategorías)
  2. Agro (19 subcategorías)
  3. Alimentos y Bebidas (6 subcategorías)
  4. Mascotas (26 subcategorías)
  5. Antigüedades y Colecciones (9 subcategorías)
  6. Arte, Librería y Cordonería (4 subcategorías)
  7. Autos, Motos y Otros (8 subcategorías)
  8. Bebés (15 subcategorías)
  9. Belleza y Cuidado Personal (13 subcategorías)
  10. Cámaras y Accesorios (11 subcategorías)
  11. Celulares y Telefonía (10 subcategorías)
  12. Computación (20 subcategorías)
  13. Consolas y Videojuegos (7 subcategorías)
  14. Construcción (11 subcategorías)
  15. Deportes y Fitness (40 subcategorías)
  16. Electrodomésticos (8 subcategorías)
  17. Electrónica, Audio y Video (15 subcategorías)
  18. Entradas para Eventos (6 subcategorías)
  19. Herramientas (9 subcategorías)
  20. Hogar y Muebles (12 subcategorías)
- **PENDIENTE:** Continuar poblando desde la letra I en adelante

---

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

## 10 de Marzo 2026 (Sesión 2) - Panel Admin Turismo

### Nueva Sección: Admin Turismo (`AdminTurismo.jsx`)
- Panel CRUD completo para gestionar negocios de turismo y aventura
- Misma estética que AdminNegocio: formulario en 2 columnas (datos + horarios)
- Campos: Nombre, Ubicación, Descripción, WhatsApp, Teléfono, Correo, Dirección, Facebook, Instagram
- Horarios de atención idénticos a AdminNegocio (7 días, toggle activo/inactivo, apertura y cierre)
- Tabla/lista de negocios con nombre, ubicación, teléfono, correo y acciones (editar/eliminar)
- Estado vacío cuando no hay negocios registrados
- Crear, editar y eliminar negocios de turismo

### Sidebar Dinámico por Tipo de Cuenta
- Menú del sidebar cambia según `tipo_cuenta` del usuario:
  - **General:** Mi Negocio, Productos, Carruseles, Banner, Estadísticas
  - **Turismo:** Mi Negocio, Turismo, Estadísticas
- Redirección automática: usuarios turismo van a `/admin/turismo` al entrar a `/admin`

### Backend API Turismo (`backend/routes/turismo.js`)
- `GET /api/turismo` — listar negocios del usuario autenticado
- `GET /api/turismo/public` — listar todos los negocios activos (público)
- `POST /api/turismo` — crear nuevo negocio
- `PUT /api/turismo/:id` — actualizar negocio existente
- `DELETE /api/turismo/:id` — eliminar negocio
- Validación: nombre obligatorio, horarios guardados como JSON
- Ruta registrada en `server.js`

### Base de Datos
- **Nueva tabla `turismo_negocios`:** id, user_id, nombre, descripcion, direccion, ubicacion, whatsapp, telefono, correo, facebook, instagram, horarios (JSON), activo, created_at, updated_at
- Índices en user_id y activo

### Routing
- Nueva ruta `/admin/turismo` → `AdminTurismo`
- `AdminIndex` redirige a `/admin/turismo` si `tipo_cuenta === 'turismo'`

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
