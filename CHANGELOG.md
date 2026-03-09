# Registro de Cambios - Solo a un Click

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
