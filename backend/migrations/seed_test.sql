-- ============================================================
-- Seed de datos de prueba — Solo a un Click
-- Fecha: 2026-04-13
-- Branch: feature/db-schema-v2
-- Uso: Solo para entorno de testing (soloaunclick_test)
-- ============================================================
-- CONTRASEÑAS: todas usan hash bcrypt de "Test1234!"
-- Hash: $2a$10$n0JLDH9Z0ISftnaHEw7QOO0l.cI73BmKP9N3BQJIATHobC/ye8w/O (generado con Node.js bcryptjs)
-- ============================================================

SET FOREIGN_KEY_CHECKS = 0;
TRUNCATE TABLE password_resets;
TRUNCATE TABLE activity_log;
TRUNCATE TABLE user_sessions;
TRUNCATE TABLE page_visits;
TRUNCATE TABLE site_visits;
TRUNCATE TABLE analytics;
TRUNCATE TABLE turismo_pagina;
TRUNCATE TABLE turismo_portada;
TRUNCATE TABLE turismo_tours;
TRUNCATE TABLE turismo_negocios;
TRUNCATE TABLE carousel_images;
TRUNCATE TABLE carousels;
TRUNCATE TABLE listing_dimensions;
TRUNCATE TABLE listing_sizes;
TRUNCATE TABLE listing_images;
TRUNCATE TABLE listings;
TRUNCATE TABLE businesses;
TRUNCATE TABLE users;
TRUNCATE TABLE subcategorias;
TRUNCATE TABLE categorias;
TRUNCATE TABLE locales_barrio;
TRUNCATE TABLE categorias_barrio;
TRUNCATE TABLE eventos;
TRUNCATE TABLE categorias_evento;
TRUNCATE TABLE plans;
SET FOREIGN_KEY_CHECKS = 1;

-- =====================
-- PLANES
-- =====================
INSERT INTO plans (id, nombre, max_listings, tiene_pagina, tiene_destacados, tiene_estadisticas) VALUES
(1, 'Básico',   5,  0, 0, 0),
(2, 'Estándar', 15, 0, 1, 0),
(3, 'Premium',  50, 1, 1, 1);

-- =====================
-- USUARIOS
-- =====================
-- Contraseña para todos: Test1234!
INSERT INTO users (id, plan_id, tipo_cuenta, nombre, email, password, telefono, comuna, vende_productos, ofrece_servicios, ofrece_arriendos, rol, activo) VALUES
-- Usuarios generales (comercio)
(1, 3, 'general', 'María López',    'maria@test.com',    '$2a$10$n0JLDH9Z0ISftnaHEw7QOO0l.cI73BmKP9N3BQJIATHobC/ye8w/O', '+56912345001', 'Santiago',  1, 0, 0, 'user',  1),
(2, 2, 'general', 'Carlos Ruiz',    'carlos@test.com',   '$2a$10$n0JLDH9Z0ISftnaHEw7QOO0l.cI73BmKP9N3BQJIATHobC/ye8w/O', '+56912345002', 'Providencia',0, 1, 0, 'user',  1),
(3, 1, 'general', 'Ana Martínez',   'ana@test.com',      '$2a$10$n0JLDH9Z0ISftnaHEw7QOO0l.cI73BmKP9N3BQJIATHobC/ye8w/O', '+56912345003', 'Las Condes',  1, 1, 1, 'user',  1),
(4, 3, 'general', 'Pedro González', 'pedro@test.com',    '$2a$10$n0JLDH9Z0ISftnaHEw7QOO0l.cI73BmKP9N3BQJIATHobC/ye8w/O', '+56912345004', 'Maipú',       1, 0, 1, 'user',  1),
-- Usuarios turismo
(5, 3, 'turismo', 'Hotel Patagonia','hotel@test.com',    '$2a$10$n0JLDH9Z0ISftnaHEw7QOO0l.cI73BmKP9N3BQJIATHobC/ye8w/O', '+56912345005', 'Puerto Natales',0, 0, 0,'user',  1),
(6, 2, 'turismo', 'Expediciones Sur','exp@test.com',     '$2a$10$n0JLDH9Z0ISftnaHEw7QOO0l.cI73BmKP9N3BQJIATHobC/ye8w/O', '+56912345006', 'Punta Arenas', 0, 0, 0,'user',  1),
(7, 1, 'turismo', 'Cabaña Austral', 'cabana@test.com',   '$2a$10$n0JLDH9Z0ISftnaHEw7QOO0l.cI73BmKP9N3BQJIATHobC/ye8w/O', '+56912345007', 'Puerto Montt', 0, 0, 0,'user',  1),
-- Admin
(8, 3, 'general', 'Admin Sistema',  'admin@test.com',    '$2a$10$n0JLDH9Z0ISftnaHEw7QOO0l.cI73BmKP9N3BQJIATHobC/ye8w/O', '+56912345008', 'Santiago',    0, 0, 0, 'admin', 1),
-- Usuario inactivo
(9, 1, 'general', 'Usuario Inactivo','inactivo@test.com','$2a$10$n0JLDH9Z0ISftnaHEw7QOO0l.cI73BmKP9N3BQJIATHobC/ye8w/O', NULL,           NULL,          0, 0, 0, 'user',  0);

-- =====================
-- BUSINESSES (tabla unificada — incluye turismo)
-- =====================
INSERT INTO businesses (user_id, nombre_negocio, slogan, descripcion, direccion, ubicacion, whatsapp, telefono, correo, facebook, instagram, horarios, tipo, activo) VALUES
-- Generales
(1, 'Moda María',       'Tu estilo, nuestro trabajo',    'Tienda de ropa femenina y accesorios premium',       'Av. Providencia 1234, Santiago',    NULL,              '+56912345001', '222345001', 'contacto@modamaria.cl',    'https://facebook.com/modamaria',    '@modamaria',    '{"lun-vie": "10:00-19:00", "sab": "10:00-14:00"}', 'general', 1),
(2, 'Servicios Ruiz',   'Calidad y compromiso',          'Empresa de servicios del hogar y reparaciones',     'Calle Las Flores 567, Providencia', NULL,              '+56912345002', '222345002', 'info@serviciosruiz.cl',    NULL,                                '@serviciosruiz', '{"lun-vie": "08:00-18:00"}',             'general', 1),
(3, 'Multishop Ana',    'Todo en un lugar',              'Productos, servicios y arriendos de calidad',       'Av. Apoquindo 890, Las Condes',     NULL,              '+56912345003', '222345003', 'ana@multishop.cl',         'https://facebook.com/multishopana', '@multishopana', '{"lun-sab": "09:00-20:00"}',             'general', 1),
(4, 'Pedro Rentals',    'Arriendos confiables',          'Especialistas en arriendo de equipos y vehículos',  'Gran Avenida 2345, Maipú',          NULL,              '+56912345004', '222345004', 'pedro@rentals.cl',         NULL,                                '@pedrorentals', '{"lun-vie": "09:00-18:00", "sab": "09:00-13:00"}', 'general', 1),
-- Turismo (Fase 1: van directo a businesses con tipo='turismo')
(5, 'Hotel Patagonia',  'El fin del mundo te espera',   'Hotel boutique en el corazón de la Patagonia chilena','Av. Balmaceda 123, Puerto Natales', 'Puerto Natales, Magallanes', '+56912345005', '612345005', 'reservas@hotelpatagonia.cl','https://facebook.com/hotelpatagonia','@hotelpatagonia','{"todos": "24 horas"}', 'turismo', 1),
(6, 'Expediciones Sur', 'Aventura sin límites',         'Operador turístico especializado en trekking y kayak','Calle Magallanes 456, Punta Arenas', 'Punta Arenas, Magallanes',  '+56912345006', '612345006', 'info@expediccionessur.cl', 'https://facebook.com/expsur',       '@expediccionessur','{"lun-dom": "08:00-20:00"}','turismo', 1),
(7, 'Cabaña Austral',   'Naturaleza en tu hogar',       'Cabañas de madera en entorno natural privilegiado', 'Camino a Ralún km 5, Puerto Montt', 'Puerto Montt, Los Lagos',   '+56912345007', '652345007', 'reservas@cabanaustral.cl', NULL,                                '@cabanaustral', '{"todos": "09:00-21:00"}', 'turismo', 1);

-- =====================
-- CATEGORÍAS
-- =====================
INSERT INTO categorias (id, nombre, tipo, icono) VALUES
(1,  'Ropa',          'producto',  'tshirt'),
(2,  'Calzado',       'producto',  'shoe'),
(3,  'Electrónica',   'producto',  'laptop'),
(4,  'Hogar',         'producto',  'home'),
(5,  'Deportes',      'producto',  'dumbbell'),
(6,  'Gastronomía',   'producto',  'utensils'),
(7,  'Reparaciones',  'servicio',  'wrench'),
(8,  'Limpieza',      'servicio',  'sparkles'),
(9,  'Transporte',    'servicio',  'truck'),
(10, 'Construcción',  'servicio',  'hammer'),
(11, 'Vehículos',     'arriendo',  'car'),
(12, 'Equipos',       'arriendo',  'tool'),
(13, 'Inmuebles',     'arriendo',  'building');

INSERT INTO subcategorias (categoria_id, nombre) VALUES
(1, 'Mujer'), (1, 'Hombre'), (1, 'Niños'), (1, 'Accesorios'),
(3, 'Computadores'), (3, 'Celulares'), (3, 'Audio'),
(7, 'Plomería'), (7, 'Electricidad'), (7, 'Gasfitería'),
(11, 'Autos'), (11, 'Camionetas'), (11, 'Furgones');

-- =====================
-- LISTINGS (comercio)
-- =====================
INSERT INTO listings (id, user_id, tipo, seccion, nombre, descripcion, precio, precio_original, categoria, subcategoria, badge, genero, carousel_posicion, carousel_orden, banner_orden, activo) VALUES
-- María (plan 3) — productos con carousel y banner
(1,  1, 'producto', 'destacados', 'Vestido Primavera 2026',   'Vestido floral de algodón premium, talla S-XL', 45990, 59990, 'Ropa',        'Mujer',       'Nuevo',    'mujer', 1, 1, 1,    1),
(2,  1, 'producto', 'destacados', 'Bolso de Cuero Italiano',  'Bolso artesanal 100% cuero genuino',          89990, NULL,  'Ropa',        'Accesorios',  'Destacado', NULL,    1, 2, 2,    1),
(3,  1, 'producto', 'destacados', 'Jeans Slim Fit Hombre',    'Jeans premium con elastano, varios colores',   34990, 44990, 'Ropa',        'Hombre',      'Oferta',   'hombre',2, 1, NULL, 1),
(4,  1, 'producto', 'destacados', 'Zapatillas Running',       'Zapatillas para correr con suela reforzada',   69990, NULL,  'Calzado',     NULL,          NULL,        NULL,   NULL, NULL, NULL, 1),
(5,  1, 'producto', 'destacados', 'Polera Básica Pack x3',    'Pack de 3 poleras lisas, colores básicos',     24990, 35990, 'Ropa',        'Hombre',      'Oferta',   'hombre',NULL, NULL, NULL, 1),
-- Carlos (plan 2) — servicios
(6,  2, 'servicio', 'destacados', 'Gasfitería de Urgencia',   'Servicio 24/7 para emergencias de gasfitería', 35000, NULL,  'Reparaciones','Gasfitería',  NULL,        NULL,   1, 1, NULL, 1),
(7,  2, 'servicio', 'destacados', 'Electricista Certificado', 'Instalaciones y reparaciones eléctricas',      45000, NULL,  'Reparaciones','Electricidad', NULL,       NULL,   NULL, NULL, NULL, 1),
(8,  2, 'servicio', 'destacados', 'Limpieza Profunda Hogar',  'Limpieza completa de hogar o departamento',    60000, NULL,  'Limpieza',    NULL,          NULL,        NULL,   NULL, NULL, NULL, 1),
-- Ana (plan 1) — mix
(9,  3, 'producto', 'destacados', 'Smartphone Samsung A55',   'Samsung Galaxy A55, 256GB, azul',              399990,449990,'Electrónica', 'Celulares',   'Nuevo',     NULL,   NULL, NULL, NULL, 1),
(10, 3, 'servicio', 'destacados', 'Clases de Yoga Online',    'Clases personalizadas de yoga vía Zoom',        25000, NULL,  'Deportes',    NULL,          NULL,        NULL,   NULL, NULL, NULL, 1),
(11, 3, 'arriendo', 'destacados', 'Arriendo Bicicleta MTB',   'Bicicleta MTB profesional, casco incluido',    15000, NULL,  'Equipos',     NULL,          NULL,        NULL,   NULL, NULL, NULL, 1),
-- Pedro (plan 3) — arriendos
(12, 4, 'arriendo', 'destacados', 'Arriendo Ford F-150 2024', 'Camioneta doble cabina, diesel, GPS',         120000, NULL,  'Vehículos',   'Camionetas',  NULL,        NULL,   1, 1, 1,    1),
(13, 4, 'arriendo', 'destacados', 'Arriendo Generador 5kW',   'Generador industrial, combustible incluido',   45000, NULL,  'Equipos',     NULL,          NULL,        NULL,   NULL, NULL, NULL, 1),
-- Listing eliminado (soft delete — test de Fase 1)
(14, 1, 'producto', 'destacados', 'Producto Eliminado Test',  'Este listing fue eliminado con soft delete',   9990,  NULL,  'Ropa',        NULL,          NULL,        NULL,   NULL, NULL, NULL, 0);

-- Soft delete en listing 14
UPDATE listings SET deleted_at = '2026-04-10 15:30:00' WHERE id = 14;

-- =====================
-- LISTING IMAGES
-- =====================
INSERT INTO listing_images (listing_id, url) VALUES
(1, '/uploads/listing_1_a.jpg'), (1, '/uploads/listing_1_b.jpg'),
(2, '/uploads/listing_2_a.jpg'),
(3, '/uploads/listing_3_a.jpg'), (3, '/uploads/listing_3_b.jpg'),
(6, '/uploads/listing_6_a.jpg'),
(9, '/uploads/listing_9_a.jpg'), (9, '/uploads/listing_9_b.jpg'),
(12,'/uploads/listing_12_a.jpg'),(12,'/uploads/listing_12_b.jpg');

-- =====================
-- LISTING SIZES
-- =====================
INSERT INTO listing_sizes (listing_id, tipo_talla, valor) VALUES
(1, 'talla', 'S'), (1, 'talla', 'M'), (1, 'talla', 'L'), (1, 'talla', 'XL'),
(3, 'talla', '28'), (3, 'talla', '30'), (3, 'talla', '32'), (3, 'talla', '34');

-- =====================
-- LISTING DIMENSIONS
-- =====================
INSERT INTO listing_dimensions (listing_id, alto, ancho, profundidad) VALUES
(9, 15.0, 7.5, 0.8);

-- =====================
-- CAROUSELS
-- =====================
INSERT INTO carousels (id, user_id, posicion, nombre) VALUES
(1, 1, 1, 'Novedades Verano'),
(2, 1, 2, 'Ofertas Especiales'),
(3, 4, 1, 'Flota de Vehículos');

INSERT INTO carousel_images (carousel_id, imagen_url, orden) VALUES
(1, '/uploads/carousel_1_1.jpg', 1),
(1, '/uploads/carousel_1_2.jpg', 2),
(1, '/uploads/carousel_1_3.jpg', 3),
(2, '/uploads/carousel_2_1.jpg', 1),
(3, '/uploads/carousel_3_1.jpg', 1),
(3, '/uploads/carousel_3_2.jpg', 2);

-- =====================
-- TURISMO TOURS (usuario Hotel Patagonia — plan 3)
-- =====================
INSERT INTO turismo_tours (id, user_id, nombre, categoria, ubicacion, detalle, precio, precio_antes, imagen_principal, imagenes, imagenes_crop, activo) VALUES
(1, 5, 'Trekking Torres del Paine', 'Aventura', 'Torres del Paine, Magallanes',
  'Full day trekking por el circuito W, guía certificado, almuerzo incluido. Dificultad media.',
  85000, 99000, 0,
  '["/uploads/tour_1_a.jpg", "/uploads/tour_1_b.jpg", "/uploads/tour_1_c.jpg"]',
  '[{"index":0,"x":0,"y":0,"width":100,"height":100},{"index":1,"x":0,"y":0,"width":100,"height":100}]',
  1),
(2, 5, 'Avistamiento de Fauna Patagónica', 'Naturaleza', 'Reserva Laguna Azul, Magallanes',
  'Excursión para observar guanacos, cóndores y pingüinos en su hábitat natural.',
  65000, NULL, 0,
  '["/uploads/tour_2_a.jpg", "/uploads/tour_2_b.jpg"]',
  NULL,
  1),
(3, 6, 'Kayak en los Canales', 'Deportes acuáticos', 'Estrecho de Magallanes',
  'Aventura de kayak de mar de 4 horas por los canales magallánicos, equipamiento incluido.',
  55000, 70000, 0,
  '["/uploads/tour_3_a.jpg"]',
  NULL,
  1);

-- =====================
-- TURISMO PORTADA (Hotel Patagonia)
-- =====================
INSERT INTO turismo_portada (user_id, nombre, descripcion, imagenes, categorias, activo) VALUES
(5, 'Hotel Patagonia', 'Descubre la Patagonia desde el confort de nuestro hotel boutique',
  '["/uploads/portada_5_a.jpg", "/uploads/portada_5_b.jpg"]',
  '["Hospedaje", "Tours", "Restaurante"]',
  1);

-- =====================
-- CATEGORÍAS EVENTO
-- =====================
INSERT INTO categorias_evento (id, nombre, icono, orden, activo) VALUES
(1, 'Música',    'music',    1, 1),
(2, 'Deporte',   'trophy',   2, 1),
(3, 'Cultura',   'palette',  3, 1),
(4, 'Gastronomía','utensils',4, 1);

-- =====================
-- EVENTOS
-- =====================
INSERT INTO eventos (titulo, imagen, fecha, ubicacion, precio, categoria_evento_id, activo) VALUES
('Festival de Jazz Santiago 2026', '/uploads/evento_jazz.jpg', '2026-05-15', 'Parque O\'Higgins, Santiago', '$15.000', 1, 1),
('Maratón Ciudad de Santiago',     '/uploads/evento_maraton.jpg','2026-05-22','Parque Forestal, Santiago',   'Gratis',  2, 1),
('Feria del Libro 2026',           '/uploads/evento_libro.jpg', '2026-06-01', 'Centro Cultural Mapocho',    '$3.000',  3, 1);

-- =====================
-- CATEGORÍAS BARRIO
-- =====================
INSERT INTO categorias_barrio (id, nombre, icono, orden, activo) VALUES
(1, 'Restaurantes', 'utensils', 1, 1),
(2, 'Cafeterías',   'coffee',   2, 1),
(3, 'Comercio',     'shopping-bag', 3, 1);

INSERT INTO locales_barrio (nombre, direccion, categoria_barrio_id, imagen, orden, activo) VALUES
('Café Central',        'Plaza de Armas 100', 2, '/uploads/local_cafe.jpg',    1, 1),
('Restaurante El Patrón','Calle Merced 234',  1, '/uploads/local_patron.jpg',  2, 1),
('Librería Antártica',  'Huérfanos 623',      3, '/uploads/local_libreria.jpg', 3, 1);

-- =====================
-- SITE VISITS (datos para tests de analytics)
-- =====================
INSERT INTO site_visits (ip, pagina, user_agent, created_at) VALUES
('192.168.1.1', '/home', 'Mozilla/5.0', '2026-04-10 10:00:00'),
('192.168.1.2', '/home', 'Chrome/120',  '2026-04-11 11:30:00'),
('192.168.1.3', '/',     'Safari/17',   '2026-04-12 09:15:00');

SELECT 'Seed completado exitosamente' AS resultado;
SELECT tabla, total FROM (
  SELECT 'plans'    AS tabla, COUNT(*) AS total FROM plans    UNION ALL
  SELECT 'users',             COUNT(*)           FROM users    UNION ALL
  SELECT 'businesses',        COUNT(*)           FROM businesses UNION ALL
  SELECT 'listings',          COUNT(*)           FROM listings  UNION ALL
  SELECT 'turismo_tours',     COUNT(*)           FROM turismo_tours UNION ALL
  SELECT 'categorias',        COUNT(*)           FROM categorias
) resumen;
