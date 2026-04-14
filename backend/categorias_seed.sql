-- ================================================
-- SEED: Categorías y Subcategorías — Solo a un Click
-- Generado: 14 de Abril 2026
-- ================================================

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- Limpiar tablas existentes
TRUNCATE TABLE subcategorias;
TRUNCATE TABLE categorias;

SET FOREIGN_KEY_CHECKS = 1;

-- ── CATEGORÍAS ─────────────────────────────────
INSERT INTO categorias (nombre, tipo, orden, activo) VALUES
  ('Accesorios para Vehículos', 'producto', 1, 1),
  ('Agro y Campo', 'producto', 2, 1),
  ('Alimentos y Bebidas', 'producto', 3, 1),
  ('Antigüedades y Colecciones', 'producto', 4, 1),
  ('Arte y Manualidades', 'producto', 5, 1),
  ('Autos, Motos y Vehículos', 'producto', 6, 1),
  ('Bebés y Maternidad', 'producto', 7, 1),
  ('Belleza y Cuidado Personal', 'producto', 8, 1),
  ('Cámaras y Fotografía', 'producto', 9, 1),
  ('Celulares y Telefonía', 'producto', 10, 1),
  ('Computación', 'producto', 11, 1),
  ('Consolas y Videojuegos', 'producto', 12, 1),
  ('Construcción y Materiales', 'producto', 13, 1),
  ('Deportes y Fitness', 'producto', 14, 1),
  ('Electrodomésticos', 'producto', 15, 1),
  ('Electrónica y Audio', 'producto', 16, 1),
  ('Herramientas', 'producto', 17, 1),
  ('Hogar y Muebles', 'producto', 18, 1),
  ('Industria y Oficinas', 'producto', 19, 1),
  ('Instrumentos Musicales', 'producto', 20, 1),
  ('Juegos y Juguetes', 'producto', 21, 1),
  ('Libros y Revistas', 'producto', 22, 1),
  ('Mascotas', 'producto', 23, 1),
  ('Música y Entretenimiento', 'producto', 24, 1),
  ('Relojes y Joyas', 'producto', 25, 1),
  ('Salud y Equipamiento Médico', 'producto', 26, 1),
  ('Souvenirs y Fiestas', 'producto', 27, 1),
  ('Vestuario y Calzado', 'producto', 28, 1),
  ('Construcción y Remodelación', 'servicio', 1, 1),
  ('Educación y Clases', 'servicio', 2, 1),
  ('Salud y Bienestar', 'servicio', 3, 1),
  ('Limpieza y Mantención del Hogar', 'servicio', 4, 1),
  ('Tecnología y Soporte', 'servicio', 5, 1),
  ('Fotografía y Video', 'servicio', 6, 1),
  ('Belleza y Estética', 'servicio', 7, 1),
  ('Gastronomía y Catering', 'servicio', 8, 1),
  ('Transporte y Mudanzas', 'servicio', 9, 1),
  ('Eventos y Fiestas', 'servicio', 10, 1),
  ('Profesionales y Consultoría', 'servicio', 11, 1),
  ('Mantención de Vehículos', 'servicio', 12, 1),
  ('Casas y Departamentos', 'arriendo', 1, 1),
  ('Habitaciones', 'arriendo', 2, 1),
  ('Locales y Oficinas', 'arriendo', 3, 1),
  ('Vehículos', 'arriendo', 4, 1),
  ('Equipos y Herramientas', 'arriendo', 5, 1),
  ('Espacios para Eventos', 'arriendo', 6, 1),
  ('Equipos para Eventos', 'arriendo', 7, 1),
  ('Embarcaciones y Deportes Acuáticos', 'arriendo', 8, 1),
  ('Agrícola y Rural', 'arriendo', 9, 1),
  ('Aventura y Adrenalina', 'turismo', 1, 1),
  ('Volcán y Nieve', 'turismo', 2, 1),
  ('Lago y Actividades Acuáticas', 'turismo', 3, 1),
  ('Senderismo y Trekking', 'turismo', 4, 1),
  ('Naturaleza y Ecoturismo', 'turismo', 5, 1),
  ('Termas y Bienestar', 'turismo', 6, 1),
  ('Cultura y Patrimonio', 'turismo', 7, 1),
  ('Gastronomía y Sabores Locales', 'turismo', 8, 1),
  ('Ciclismo y Rutas', 'turismo', 9, 1),
  ('Equitación y Campo', 'turismo', 10, 1),
  ('Tours y Excursiones', 'turismo', 11, 1),
  ('Turismo Familiar', 'turismo', 12, 1),
  ('Fotografía y Arte', 'turismo', 13, 1),
  ('Alojamiento Turístico', 'turismo', 14, 1),
  ('Noche y Vida Social', 'turismo', 15, 1);

-- ── SUBCATEGORÍAS ───────────────────────────────
-- Accesorios para Vehículos (producto)
INSERT INTO subcategorias (categoria_id, nombre)
  SELECT id, 'Accesorios de Auto y Camioneta' FROM categorias WHERE nombre = 'Accesorios para Vehículos' AND tipo = 'producto'
UNION ALL
  SELECT id, 'Accesorios para Motos' FROM categorias WHERE nombre = 'Accesorios para Vehículos' AND tipo = 'producto'
UNION ALL
  SELECT id, 'Audio para Vehículos' FROM categorias WHERE nombre = 'Accesorios para Vehículos' AND tipo = 'producto'
UNION ALL
  SELECT id, 'Herramientas para Vehículos' FROM categorias WHERE nombre = 'Accesorios para Vehículos' AND tipo = 'producto'
UNION ALL
  SELECT id, 'Llantas y Neumáticos' FROM categorias WHERE nombre = 'Accesorios para Vehículos' AND tipo = 'producto'
UNION ALL
  SELECT id, 'Lubricantes y Fluidos' FROM categorias WHERE nombre = 'Accesorios para Vehículos' AND tipo = 'producto'
UNION ALL
  SELECT id, 'Navegadores GPS' FROM categorias WHERE nombre = 'Accesorios para Vehículos' AND tipo = 'producto'
UNION ALL
  SELECT id, 'Repuestos Autos y Camionetas' FROM categorias WHERE nombre = 'Accesorios para Vehículos' AND tipo = 'producto'
UNION ALL
  SELECT id, 'Repuestos Motos' FROM categorias WHERE nombre = 'Accesorios para Vehículos' AND tipo = 'producto'
UNION ALL
  SELECT id, 'Seguridad Vehicular' FROM categorias WHERE nombre = 'Accesorios para Vehículos' AND tipo = 'producto'
UNION ALL
  SELECT id, 'Tuning' FROM categorias WHERE nombre = 'Accesorios para Vehículos' AND tipo = 'producto'
UNION ALL
  SELECT id, 'Otros' FROM categorias WHERE nombre = 'Accesorios para Vehículos' AND tipo = 'producto';

-- Agro y Campo (producto)
INSERT INTO subcategorias (categoria_id, nombre)
  SELECT id, 'Agricultura de Precisión' FROM categorias WHERE nombre = 'Agro y Campo' AND tipo = 'producto'
UNION ALL
  SELECT id, 'Apicultura' FROM categorias WHERE nombre = 'Agro y Campo' AND tipo = 'producto'
UNION ALL
  SELECT id, 'Fertilizantes' FROM categorias WHERE nombre = 'Agro y Campo' AND tipo = 'producto'
UNION ALL
  SELECT id, 'Herramientas de Campo' FROM categorias WHERE nombre = 'Agro y Campo' AND tipo = 'producto'
UNION ALL
  SELECT id, 'Insumos Agrícolas' FROM categorias WHERE nombre = 'Agro y Campo' AND tipo = 'producto'
UNION ALL
  SELECT id, 'Insumos Ganaderos' FROM categorias WHERE nombre = 'Agro y Campo' AND tipo = 'producto'
UNION ALL
  SELECT id, 'Maquinaria Agrícola' FROM categorias WHERE nombre = 'Agro y Campo' AND tipo = 'producto'
UNION ALL
  SELECT id, 'Producción Animal' FROM categorias WHERE nombre = 'Agro y Campo' AND tipo = 'producto'
UNION ALL
  SELECT id, 'Protección de Cultivos' FROM categorias WHERE nombre = 'Agro y Campo' AND tipo = 'producto'
UNION ALL
  SELECT id, 'Riego' FROM categorias WHERE nombre = 'Agro y Campo' AND tipo = 'producto'
UNION ALL
  SELECT id, 'Semillas' FROM categorias WHERE nombre = 'Agro y Campo' AND tipo = 'producto'
UNION ALL
  SELECT id, 'Otros' FROM categorias WHERE nombre = 'Agro y Campo' AND tipo = 'producto';

-- Alimentos y Bebidas (producto)
INSERT INTO subcategorias (categoria_id, nombre)
  SELECT id, 'Almacén y Despensa' FROM categorias WHERE nombre = 'Alimentos y Bebidas' AND tipo = 'producto'
UNION ALL
  SELECT id, 'Bebidas' FROM categorias WHERE nombre = 'Alimentos y Bebidas' AND tipo = 'producto'
UNION ALL
  SELECT id, 'Comida Preparada' FROM categorias WHERE nombre = 'Alimentos y Bebidas' AND tipo = 'producto'
UNION ALL
  SELECT id, 'Congelados' FROM categorias WHERE nombre = 'Alimentos y Bebidas' AND tipo = 'producto'
UNION ALL
  SELECT id, 'Frescos y Verduras' FROM categorias WHERE nombre = 'Alimentos y Bebidas' AND tipo = 'producto'
UNION ALL
  SELECT id, 'Lácteos y Quesos' FROM categorias WHERE nombre = 'Alimentos y Bebidas' AND tipo = 'producto'
UNION ALL
  SELECT id, 'Repostería y Panadería' FROM categorias WHERE nombre = 'Alimentos y Bebidas' AND tipo = 'producto'
UNION ALL
  SELECT id, 'Otros' FROM categorias WHERE nombre = 'Alimentos y Bebidas' AND tipo = 'producto';

-- Antigüedades y Colecciones (producto)
INSERT INTO subcategorias (categoria_id, nombre)
  SELECT id, 'Antigüedades' FROM categorias WHERE nombre = 'Antigüedades y Colecciones' AND tipo = 'producto'
UNION ALL
  SELECT id, 'Coleccionables' FROM categorias WHERE nombre = 'Antigüedades y Colecciones' AND tipo = 'producto'
UNION ALL
  SELECT id, 'Filatelia' FROM categorias WHERE nombre = 'Antigüedades y Colecciones' AND tipo = 'producto'
UNION ALL
  SELECT id, 'Numismática' FROM categorias WHERE nombre = 'Antigüedades y Colecciones' AND tipo = 'producto'
UNION ALL
  SELECT id, 'Militaria' FROM categorias WHERE nombre = 'Antigüedades y Colecciones' AND tipo = 'producto'
UNION ALL
  SELECT id, 'Esculturas y Arte' FROM categorias WHERE nombre = 'Antigüedades y Colecciones' AND tipo = 'producto'
UNION ALL
  SELECT id, 'Otros' FROM categorias WHERE nombre = 'Antigüedades y Colecciones' AND tipo = 'producto';

-- Arte y Manualidades (producto)
INSERT INTO subcategorias (categoria_id, nombre)
  SELECT id, 'Artículos de Dibujo y Pintura' FROM categorias WHERE nombre = 'Arte y Manualidades' AND tipo = 'producto'
UNION ALL
  SELECT id, 'Artículos de Costura' FROM categorias WHERE nombre = 'Arte y Manualidades' AND tipo = 'producto'
UNION ALL
  SELECT id, 'Librería' FROM categorias WHERE nombre = 'Arte y Manualidades' AND tipo = 'producto'
UNION ALL
  SELECT id, 'Papelería' FROM categorias WHERE nombre = 'Arte y Manualidades' AND tipo = 'producto'
UNION ALL
  SELECT id, 'Scrapbooking' FROM categorias WHERE nombre = 'Arte y Manualidades' AND tipo = 'producto'
UNION ALL
  SELECT id, 'Telas y Telares' FROM categorias WHERE nombre = 'Arte y Manualidades' AND tipo = 'producto'
UNION ALL
  SELECT id, 'Otros' FROM categorias WHERE nombre = 'Arte y Manualidades' AND tipo = 'producto';

-- Autos, Motos y Vehículos (producto)
INSERT INTO subcategorias (categoria_id, nombre)
  SELECT id, 'Autos y Camionetas' FROM categorias WHERE nombre = 'Autos, Motos y Vehículos' AND tipo = 'producto'
UNION ALL
  SELECT id, 'Camiones' FROM categorias WHERE nombre = 'Autos, Motos y Vehículos' AND tipo = 'producto'
UNION ALL
  SELECT id, 'Motos' FROM categorias WHERE nombre = 'Autos, Motos y Vehículos' AND tipo = 'producto'
UNION ALL
  SELECT id, 'Cuatrimotos' FROM categorias WHERE nombre = 'Autos, Motos y Vehículos' AND tipo = 'producto'
UNION ALL
  SELECT id, 'Bicicletas' FROM categorias WHERE nombre = 'Autos, Motos y Vehículos' AND tipo = 'producto'
UNION ALL
  SELECT id, 'Embarcaciones' FROM categorias WHERE nombre = 'Autos, Motos y Vehículos' AND tipo = 'producto'
UNION ALL
  SELECT id, 'Otros' FROM categorias WHERE nombre = 'Autos, Motos y Vehículos' AND tipo = 'producto';

-- Bebés y Maternidad (producto)
INSERT INTO subcategorias (categoria_id, nombre)
  SELECT id, 'Ropa de Bebé' FROM categorias WHERE nombre = 'Bebés y Maternidad' AND tipo = 'producto'
UNION ALL
  SELECT id, 'Dormitorio del Bebé' FROM categorias WHERE nombre = 'Bebés y Maternidad' AND tipo = 'producto'
UNION ALL
  SELECT id, 'Higiene y Cuidado' FROM categorias WHERE nombre = 'Bebés y Maternidad' AND tipo = 'producto'
UNION ALL
  SELECT id, 'Juguetes para Bebés' FROM categorias WHERE nombre = 'Bebés y Maternidad' AND tipo = 'producto'
UNION ALL
  SELECT id, 'Lactancia y Alimentación' FROM categorias WHERE nombre = 'Bebés y Maternidad' AND tipo = 'producto'
UNION ALL
  SELECT id, 'Paseo del Bebé' FROM categorias WHERE nombre = 'Bebés y Maternidad' AND tipo = 'producto'
UNION ALL
  SELECT id, 'Seguridad para Bebés' FROM categorias WHERE nombre = 'Bebés y Maternidad' AND tipo = 'producto'
UNION ALL
  SELECT id, 'Otros' FROM categorias WHERE nombre = 'Bebés y Maternidad' AND tipo = 'producto';

-- Belleza y Cuidado Personal (producto)
INSERT INTO subcategorias (categoria_id, nombre)
  SELECT id, 'Cuidado de la Piel' FROM categorias WHERE nombre = 'Belleza y Cuidado Personal' AND tipo = 'producto'
UNION ALL
  SELECT id, 'Cuidado del Cabello' FROM categorias WHERE nombre = 'Belleza y Cuidado Personal' AND tipo = 'producto'
UNION ALL
  SELECT id, 'Maquillaje' FROM categorias WHERE nombre = 'Belleza y Cuidado Personal' AND tipo = 'producto'
UNION ALL
  SELECT id, 'Perfumes' FROM categorias WHERE nombre = 'Belleza y Cuidado Personal' AND tipo = 'producto'
UNION ALL
  SELECT id, 'Higiene Personal' FROM categorias WHERE nombre = 'Belleza y Cuidado Personal' AND tipo = 'producto'
UNION ALL
  SELECT id, 'Manicura y Pedicura' FROM categorias WHERE nombre = 'Belleza y Cuidado Personal' AND tipo = 'producto'
UNION ALL
  SELECT id, 'Depilación' FROM categorias WHERE nombre = 'Belleza y Cuidado Personal' AND tipo = 'producto'
UNION ALL
  SELECT id, 'Otros' FROM categorias WHERE nombre = 'Belleza y Cuidado Personal' AND tipo = 'producto';

-- Cámaras y Fotografía (producto)
INSERT INTO subcategorias (categoria_id, nombre)
  SELECT id, 'Cámaras Fotográficas' FROM categorias WHERE nombre = 'Cámaras y Fotografía' AND tipo = 'producto'
UNION ALL
  SELECT id, 'Lentes y Filtros' FROM categorias WHERE nombre = 'Cámaras y Fotografía' AND tipo = 'producto'
UNION ALL
  SELECT id, 'Drones' FROM categorias WHERE nombre = 'Cámaras y Fotografía' AND tipo = 'producto'
UNION ALL
  SELECT id, 'Filmadoras' FROM categorias WHERE nombre = 'Cámaras y Fotografía' AND tipo = 'producto'
UNION ALL
  SELECT id, 'Accesorios para Cámaras' FROM categorias WHERE nombre = 'Cámaras y Fotografía' AND tipo = 'producto'
UNION ALL
  SELECT id, 'Trípodes y Soportes' FROM categorias WHERE nombre = 'Cámaras y Fotografía' AND tipo = 'producto'
UNION ALL
  SELECT id, 'Otros' FROM categorias WHERE nombre = 'Cámaras y Fotografía' AND tipo = 'producto';

-- Celulares y Telefonía (producto)
INSERT INTO subcategorias (categoria_id, nombre)
  SELECT id, 'Celulares y Smartphones' FROM categorias WHERE nombre = 'Celulares y Telefonía' AND tipo = 'producto'
UNION ALL
  SELECT id, 'Accesorios para Celulares' FROM categorias WHERE nombre = 'Celulares y Telefonía' AND tipo = 'producto'
UNION ALL
  SELECT id, 'Smartwatches' FROM categorias WHERE nombre = 'Celulares y Telefonía' AND tipo = 'producto'
UNION ALL
  SELECT id, 'Telefonía Fija' FROM categorias WHERE nombre = 'Celulares y Telefonía' AND tipo = 'producto'
UNION ALL
  SELECT id, 'Repuestos Celulares' FROM categorias WHERE nombre = 'Celulares y Telefonía' AND tipo = 'producto'
UNION ALL
  SELECT id, 'Otros' FROM categorias WHERE nombre = 'Celulares y Telefonía' AND tipo = 'producto';

-- Computación (producto)
INSERT INTO subcategorias (categoria_id, nombre)
  SELECT id, 'Notebooks' FROM categorias WHERE nombre = 'Computación' AND tipo = 'producto'
UNION ALL
  SELECT id, 'PC de Escritorio' FROM categorias WHERE nombre = 'Computación' AND tipo = 'producto'
UNION ALL
  SELECT id, 'Tablets' FROM categorias WHERE nombre = 'Computación' AND tipo = 'producto'
UNION ALL
  SELECT id, 'Monitores' FROM categorias WHERE nombre = 'Computación' AND tipo = 'producto'
UNION ALL
  SELECT id, 'Componentes de PC' FROM categorias WHERE nombre = 'Computación' AND tipo = 'producto'
UNION ALL
  SELECT id, 'Periféricos' FROM categorias WHERE nombre = 'Computación' AND tipo = 'producto'
UNION ALL
  SELECT id, 'Almacenamiento' FROM categorias WHERE nombre = 'Computación' AND tipo = 'producto'
UNION ALL
  SELECT id, 'Impresoras' FROM categorias WHERE nombre = 'Computación' AND tipo = 'producto'
UNION ALL
  SELECT id, 'Otros' FROM categorias WHERE nombre = 'Computación' AND tipo = 'producto';

-- Consolas y Videojuegos (producto)
INSERT INTO subcategorias (categoria_id, nombre)
  SELECT id, 'Consolas' FROM categorias WHERE nombre = 'Consolas y Videojuegos' AND tipo = 'producto'
UNION ALL
  SELECT id, 'Videojuegos' FROM categorias WHERE nombre = 'Consolas y Videojuegos' AND tipo = 'producto'
UNION ALL
  SELECT id, 'Accesorios para Consolas' FROM categorias WHERE nombre = 'Consolas y Videojuegos' AND tipo = 'producto'
UNION ALL
  SELECT id, 'Juegos de PC' FROM categorias WHERE nombre = 'Consolas y Videojuegos' AND tipo = 'producto'
UNION ALL
  SELECT id, 'Otros' FROM categorias WHERE nombre = 'Consolas y Videojuegos' AND tipo = 'producto';

-- Construcción y Materiales (producto)
INSERT INTO subcategorias (categoria_id, nombre)
  SELECT id, 'Aberturas y Ventanas' FROM categorias WHERE nombre = 'Construcción y Materiales' AND tipo = 'producto'
UNION ALL
  SELECT id, 'Electricidad' FROM categorias WHERE nombre = 'Construcción y Materiales' AND tipo = 'producto'
UNION ALL
  SELECT id, 'Gasfitería y Sanitarios' FROM categorias WHERE nombre = 'Construcción y Materiales' AND tipo = 'producto'
UNION ALL
  SELECT id, 'Materiales de Obra' FROM categorias WHERE nombre = 'Construcción y Materiales' AND tipo = 'producto'
UNION ALL
  SELECT id, 'Mobiliario para Baños' FROM categorias WHERE nombre = 'Construcción y Materiales' AND tipo = 'producto'
UNION ALL
  SELECT id, 'Mobiliario para Cocinas' FROM categorias WHERE nombre = 'Construcción y Materiales' AND tipo = 'producto'
UNION ALL
  SELECT id, 'Pinturería' FROM categorias WHERE nombre = 'Construcción y Materiales' AND tipo = 'producto'
UNION ALL
  SELECT id, 'Pisos y Revestimientos' FROM categorias WHERE nombre = 'Construcción y Materiales' AND tipo = 'producto'
UNION ALL
  SELECT id, 'Otros' FROM categorias WHERE nombre = 'Construcción y Materiales' AND tipo = 'producto';

-- Deportes y Fitness (producto)
INSERT INTO subcategorias (categoria_id, nombre)
  SELECT id, 'Fútbol' FROM categorias WHERE nombre = 'Deportes y Fitness' AND tipo = 'producto'
UNION ALL
  SELECT id, 'Tenis y Pádel' FROM categorias WHERE nombre = 'Deportes y Fitness' AND tipo = 'producto'
UNION ALL
  SELECT id, 'Ciclismo' FROM categorias WHERE nombre = 'Deportes y Fitness' AND tipo = 'producto'
UNION ALL
  SELECT id, 'Natación' FROM categorias WHERE nombre = 'Deportes y Fitness' AND tipo = 'producto'
UNION ALL
  SELECT id, 'Ski y Snowboard' FROM categorias WHERE nombre = 'Deportes y Fitness' AND tipo = 'producto'
UNION ALL
  SELECT id, 'Trekking y Montañismo' FROM categorias WHERE nombre = 'Deportes y Fitness' AND tipo = 'producto'
UNION ALL
  SELECT id, 'Kayak y Deportes Acuáticos' FROM categorias WHERE nombre = 'Deportes y Fitness' AND tipo = 'producto'
UNION ALL
  SELECT id, 'Fitness y Musculación' FROM categorias WHERE nombre = 'Deportes y Fitness' AND tipo = 'producto'
UNION ALL
  SELECT id, 'Artes Marciales' FROM categorias WHERE nombre = 'Deportes y Fitness' AND tipo = 'producto'
UNION ALL
  SELECT id, 'Camping y Pesca' FROM categorias WHERE nombre = 'Deportes y Fitness' AND tipo = 'producto'
UNION ALL
  SELECT id, 'Ropa Deportiva' FROM categorias WHERE nombre = 'Deportes y Fitness' AND tipo = 'producto'
UNION ALL
  SELECT id, 'Suplementos' FROM categorias WHERE nombre = 'Deportes y Fitness' AND tipo = 'producto'
UNION ALL
  SELECT id, 'Otros' FROM categorias WHERE nombre = 'Deportes y Fitness' AND tipo = 'producto';

-- Electrodomésticos (producto)
INSERT INTO subcategorias (categoria_id, nombre)
  SELECT id, 'Climatización' FROM categorias WHERE nombre = 'Electrodomésticos' AND tipo = 'producto'
UNION ALL
  SELECT id, 'Hornos y Cocinas' FROM categorias WHERE nombre = 'Electrodomésticos' AND tipo = 'producto'
UNION ALL
  SELECT id, 'Lavado' FROM categorias WHERE nombre = 'Electrodomésticos' AND tipo = 'producto'
UNION ALL
  SELECT id, 'Refrigeración' FROM categorias WHERE nombre = 'Electrodomésticos' AND tipo = 'producto'
UNION ALL
  SELECT id, 'Pequeños Electrodomésticos' FROM categorias WHERE nombre = 'Electrodomésticos' AND tipo = 'producto'
UNION ALL
  SELECT id, 'Otros' FROM categorias WHERE nombre = 'Electrodomésticos' AND tipo = 'producto';

-- Electrónica y Audio (producto)
INSERT INTO subcategorias (categoria_id, nombre)
  SELECT id, 'Televisores' FROM categorias WHERE nombre = 'Electrónica y Audio' AND tipo = 'producto'
UNION ALL
  SELECT id, 'Audio y Parlantes' FROM categorias WHERE nombre = 'Electrónica y Audio' AND tipo = 'producto'
UNION ALL
  SELECT id, 'Proyectores' FROM categorias WHERE nombre = 'Electrónica y Audio' AND tipo = 'producto'
UNION ALL
  SELECT id, 'Cables y Conectores' FROM categorias WHERE nombre = 'Electrónica y Audio' AND tipo = 'producto'
UNION ALL
  SELECT id, 'Pilas y Cargadores' FROM categorias WHERE nombre = 'Electrónica y Audio' AND tipo = 'producto'
UNION ALL
  SELECT id, 'Componentes Electrónicos' FROM categorias WHERE nombre = 'Electrónica y Audio' AND tipo = 'producto'
UNION ALL
  SELECT id, 'Otros' FROM categorias WHERE nombre = 'Electrónica y Audio' AND tipo = 'producto';

-- Herramientas (producto)
INSERT INTO subcategorias (categoria_id, nombre)
  SELECT id, 'Herramientas Eléctricas' FROM categorias WHERE nombre = 'Herramientas' AND tipo = 'producto'
UNION ALL
  SELECT id, 'Herramientas Manuales' FROM categorias WHERE nombre = 'Herramientas' AND tipo = 'producto'
UNION ALL
  SELECT id, 'Herramientas Neumáticas' FROM categorias WHERE nombre = 'Herramientas' AND tipo = 'producto'
UNION ALL
  SELECT id, 'Herramientas de Medición' FROM categorias WHERE nombre = 'Herramientas' AND tipo = 'producto'
UNION ALL
  SELECT id, 'Herramientas para Jardín' FROM categorias WHERE nombre = 'Herramientas' AND tipo = 'producto'
UNION ALL
  SELECT id, 'Cajas y Organizadores' FROM categorias WHERE nombre = 'Herramientas' AND tipo = 'producto'
UNION ALL
  SELECT id, 'Otros' FROM categorias WHERE nombre = 'Herramientas' AND tipo = 'producto';

-- Hogar y Muebles (producto)
INSERT INTO subcategorias (categoria_id, nombre)
  SELECT id, 'Dormitorio' FROM categorias WHERE nombre = 'Hogar y Muebles' AND tipo = 'producto'
UNION ALL
  SELECT id, 'Cocina y Comedor' FROM categorias WHERE nombre = 'Hogar y Muebles' AND tipo = 'producto'
UNION ALL
  SELECT id, 'Baño' FROM categorias WHERE nombre = 'Hogar y Muebles' AND tipo = 'producto'
UNION ALL
  SELECT id, 'Sala y Living' FROM categorias WHERE nombre = 'Hogar y Muebles' AND tipo = 'producto'
UNION ALL
  SELECT id, 'Decoración' FROM categorias WHERE nombre = 'Hogar y Muebles' AND tipo = 'producto'
UNION ALL
  SELECT id, 'Iluminación' FROM categorias WHERE nombre = 'Hogar y Muebles' AND tipo = 'producto'
UNION ALL
  SELECT id, 'Jardín y Exterior' FROM categorias WHERE nombre = 'Hogar y Muebles' AND tipo = 'producto'
UNION ALL
  SELECT id, 'Textiles del Hogar' FROM categorias WHERE nombre = 'Hogar y Muebles' AND tipo = 'producto'
UNION ALL
  SELECT id, 'Organización del Hogar' FROM categorias WHERE nombre = 'Hogar y Muebles' AND tipo = 'producto'
UNION ALL
  SELECT id, 'Otros' FROM categorias WHERE nombre = 'Hogar y Muebles' AND tipo = 'producto';

-- Industria y Oficinas (producto)
INSERT INTO subcategorias (categoria_id, nombre)
  SELECT id, 'Equipamiento para Oficinas' FROM categorias WHERE nombre = 'Industria y Oficinas' AND tipo = 'producto'
UNION ALL
  SELECT id, 'Equipamiento para Comercios' FROM categorias WHERE nombre = 'Industria y Oficinas' AND tipo = 'producto'
UNION ALL
  SELECT id, 'Maquinaria Industrial' FROM categorias WHERE nombre = 'Industria y Oficinas' AND tipo = 'producto'
UNION ALL
  SELECT id, 'Equipamiento Médico' FROM categorias WHERE nombre = 'Industria y Oficinas' AND tipo = 'producto'
UNION ALL
  SELECT id, 'Embalaje y Logística' FROM categorias WHERE nombre = 'Industria y Oficinas' AND tipo = 'producto'
UNION ALL
  SELECT id, 'Otros' FROM categorias WHERE nombre = 'Industria y Oficinas' AND tipo = 'producto';

-- Instrumentos Musicales (producto)
INSERT INTO subcategorias (categoria_id, nombre)
  SELECT id, 'Guitarras y Cuerdas' FROM categorias WHERE nombre = 'Instrumentos Musicales' AND tipo = 'producto'
UNION ALL
  SELECT id, 'Pianos y Teclados' FROM categorias WHERE nombre = 'Instrumentos Musicales' AND tipo = 'producto'
UNION ALL
  SELECT id, 'Baterías y Percusión' FROM categorias WHERE nombre = 'Instrumentos Musicales' AND tipo = 'producto'
UNION ALL
  SELECT id, 'Vientos' FROM categorias WHERE nombre = 'Instrumentos Musicales' AND tipo = 'producto'
UNION ALL
  SELECT id, 'Equipos de DJ' FROM categorias WHERE nombre = 'Instrumentos Musicales' AND tipo = 'producto'
UNION ALL
  SELECT id, 'Micrófonos y Amplificadores' FROM categorias WHERE nombre = 'Instrumentos Musicales' AND tipo = 'producto'
UNION ALL
  SELECT id, 'Otros' FROM categorias WHERE nombre = 'Instrumentos Musicales' AND tipo = 'producto';

-- Juegos y Juguetes (producto)
INSERT INTO subcategorias (categoria_id, nombre)
  SELECT id, 'Juguetes para Bebés' FROM categorias WHERE nombre = 'Juegos y Juguetes' AND tipo = 'producto'
UNION ALL
  SELECT id, 'Muñecos y Muñecas' FROM categorias WHERE nombre = 'Juegos y Juguetes' AND tipo = 'producto'
UNION ALL
  SELECT id, 'Juegos de Mesa' FROM categorias WHERE nombre = 'Juegos y Juguetes' AND tipo = 'producto'
UNION ALL
  SELECT id, 'Juegos de Construcción' FROM categorias WHERE nombre = 'Juegos y Juguetes' AND tipo = 'producto'
UNION ALL
  SELECT id, 'Vehículos de Juguete' FROM categorias WHERE nombre = 'Juegos y Juguetes' AND tipo = 'producto'
UNION ALL
  SELECT id, 'Peluches' FROM categorias WHERE nombre = 'Juegos y Juguetes' AND tipo = 'producto'
UNION ALL
  SELECT id, 'Juegos de Aire Libre' FROM categorias WHERE nombre = 'Juegos y Juguetes' AND tipo = 'producto'
UNION ALL
  SELECT id, 'Electrónicos para Niños' FROM categorias WHERE nombre = 'Juegos y Juguetes' AND tipo = 'producto'
UNION ALL
  SELECT id, 'Otros' FROM categorias WHERE nombre = 'Juegos y Juguetes' AND tipo = 'producto';

-- Libros y Revistas (producto)
INSERT INTO subcategorias (categoria_id, nombre)
  SELECT id, 'Libros Físicos' FROM categorias WHERE nombre = 'Libros y Revistas' AND tipo = 'producto'
UNION ALL
  SELECT id, 'Revistas' FROM categorias WHERE nombre = 'Libros y Revistas' AND tipo = 'producto'
UNION ALL
  SELECT id, 'Comics y Manga' FROM categorias WHERE nombre = 'Libros y Revistas' AND tipo = 'producto'
UNION ALL
  SELECT id, 'Libros de Texto' FROM categorias WHERE nombre = 'Libros y Revistas' AND tipo = 'producto'
UNION ALL
  SELECT id, 'Libros Infantiles' FROM categorias WHERE nombre = 'Libros y Revistas' AND tipo = 'producto'
UNION ALL
  SELECT id, 'Otros' FROM categorias WHERE nombre = 'Libros y Revistas' AND tipo = 'producto';

-- Mascotas (producto)
INSERT INTO subcategorias (categoria_id, nombre)
  SELECT id, 'Perros' FROM categorias WHERE nombre = 'Mascotas' AND tipo = 'producto'
UNION ALL
  SELECT id, 'Gatos' FROM categorias WHERE nombre = 'Mascotas' AND tipo = 'producto'
UNION ALL
  SELECT id, 'Aves' FROM categorias WHERE nombre = 'Mascotas' AND tipo = 'producto'
UNION ALL
  SELECT id, 'Peces' FROM categorias WHERE nombre = 'Mascotas' AND tipo = 'producto'
UNION ALL
  SELECT id, 'Roedores' FROM categorias WHERE nombre = 'Mascotas' AND tipo = 'producto'
UNION ALL
  SELECT id, 'Reptiles' FROM categorias WHERE nombre = 'Mascotas' AND tipo = 'producto'
UNION ALL
  SELECT id, 'Alimento para Mascotas' FROM categorias WHERE nombre = 'Mascotas' AND tipo = 'producto'
UNION ALL
  SELECT id, 'Accesorios para Mascotas' FROM categorias WHERE nombre = 'Mascotas' AND tipo = 'producto'
UNION ALL
  SELECT id, 'Otros' FROM categorias WHERE nombre = 'Mascotas' AND tipo = 'producto';

-- Música y Entretenimiento (producto)
INSERT INTO subcategorias (categoria_id, nombre)
  SELECT id, 'Música Física (CD/Vinilo)' FROM categorias WHERE nombre = 'Música y Entretenimiento' AND tipo = 'producto'
UNION ALL
  SELECT id, 'Películas Físicas' FROM categorias WHERE nombre = 'Música y Entretenimiento' AND tipo = 'producto'
UNION ALL
  SELECT id, 'Cursos y Clases Online' FROM categorias WHERE nombre = 'Música y Entretenimiento' AND tipo = 'producto'
UNION ALL
  SELECT id, 'Otros' FROM categorias WHERE nombre = 'Música y Entretenimiento' AND tipo = 'producto';

-- Relojes y Joyas (producto)
INSERT INTO subcategorias (categoria_id, nombre)
  SELECT id, 'Relojes' FROM categorias WHERE nombre = 'Relojes y Joyas' AND tipo = 'producto'
UNION ALL
  SELECT id, 'Joyería' FROM categorias WHERE nombre = 'Relojes y Joyas' AND tipo = 'producto'
UNION ALL
  SELECT id, 'Bijoutería' FROM categorias WHERE nombre = 'Relojes y Joyas' AND tipo = 'producto'
UNION ALL
  SELECT id, 'Piercings' FROM categorias WHERE nombre = 'Relojes y Joyas' AND tipo = 'producto'
UNION ALL
  SELECT id, 'Otros' FROM categorias WHERE nombre = 'Relojes y Joyas' AND tipo = 'producto';

-- Salud y Equipamiento Médico (producto)
INSERT INTO subcategorias (categoria_id, nombre)
  SELECT id, 'Cuidado de la Salud' FROM categorias WHERE nombre = 'Salud y Equipamiento Médico' AND tipo = 'producto'
UNION ALL
  SELECT id, 'Equipamiento Médico' FROM categorias WHERE nombre = 'Salud y Equipamiento Médico' AND tipo = 'producto'
UNION ALL
  SELECT id, 'Ortopedia' FROM categorias WHERE nombre = 'Salud y Equipamiento Médico' AND tipo = 'producto'
UNION ALL
  SELECT id, 'Movilidad' FROM categorias WHERE nombre = 'Salud y Equipamiento Médico' AND tipo = 'producto'
UNION ALL
  SELECT id, 'Suplementos Alimenticios' FROM categorias WHERE nombre = 'Salud y Equipamiento Médico' AND tipo = 'producto'
UNION ALL
  SELECT id, 'Terapias Alternativas' FROM categorias WHERE nombre = 'Salud y Equipamiento Médico' AND tipo = 'producto'
UNION ALL
  SELECT id, 'Otros' FROM categorias WHERE nombre = 'Salud y Equipamiento Médico' AND tipo = 'producto';

-- Souvenirs y Fiestas (producto)
INSERT INTO subcategorias (categoria_id, nombre)
  SELECT id, 'Souvenirs y Artesanías' FROM categorias WHERE nombre = 'Souvenirs y Fiestas' AND tipo = 'producto'
UNION ALL
  SELECT id, 'Decoración para Fiestas' FROM categorias WHERE nombre = 'Souvenirs y Fiestas' AND tipo = 'producto'
UNION ALL
  SELECT id, 'Cotillón' FROM categorias WHERE nombre = 'Souvenirs y Fiestas' AND tipo = 'producto'
UNION ALL
  SELECT id, 'Disfraces' FROM categorias WHERE nombre = 'Souvenirs y Fiestas' AND tipo = 'producto'
UNION ALL
  SELECT id, 'Artículos de Repostería' FROM categorias WHERE nombre = 'Souvenirs y Fiestas' AND tipo = 'producto'
UNION ALL
  SELECT id, 'Otros' FROM categorias WHERE nombre = 'Souvenirs y Fiestas' AND tipo = 'producto';

-- Vestuario y Calzado (producto)
INSERT INTO subcategorias (categoria_id, nombre)
  SELECT id, 'Poleras y Camisas' FROM categorias WHERE nombre = 'Vestuario y Calzado' AND tipo = 'producto'
UNION ALL
  SELECT id, 'Pantalones y Jeans' FROM categorias WHERE nombre = 'Vestuario y Calzado' AND tipo = 'producto'
UNION ALL
  SELECT id, 'Vestidos y Faldas' FROM categorias WHERE nombre = 'Vestuario y Calzado' AND tipo = 'producto'
UNION ALL
  SELECT id, 'Ropa Deportiva' FROM categorias WHERE nombre = 'Vestuario y Calzado' AND tipo = 'producto'
UNION ALL
  SELECT id, 'Ropa Interior' FROM categorias WHERE nombre = 'Vestuario y Calzado' AND tipo = 'producto'
UNION ALL
  SELECT id, 'Abrigos y Chaquetas' FROM categorias WHERE nombre = 'Vestuario y Calzado' AND tipo = 'producto'
UNION ALL
  SELECT id, 'Calzado Hombre' FROM categorias WHERE nombre = 'Vestuario y Calzado' AND tipo = 'producto'
UNION ALL
  SELECT id, 'Calzado Mujer' FROM categorias WHERE nombre = 'Vestuario y Calzado' AND tipo = 'producto'
UNION ALL
  SELECT id, 'Calzado Niños' FROM categorias WHERE nombre = 'Vestuario y Calzado' AND tipo = 'producto'
UNION ALL
  SELECT id, 'Accesorios de Moda' FROM categorias WHERE nombre = 'Vestuario y Calzado' AND tipo = 'producto'
UNION ALL
  SELECT id, 'Bolsos y Carteras' FROM categorias WHERE nombre = 'Vestuario y Calzado' AND tipo = 'producto'
UNION ALL
  SELECT id, 'Otros' FROM categorias WHERE nombre = 'Vestuario y Calzado' AND tipo = 'producto';

-- Construcción y Remodelación (servicio)
INSERT INTO subcategorias (categoria_id, nombre)
  SELECT id, 'Albañilería' FROM categorias WHERE nombre = 'Construcción y Remodelación' AND tipo = 'servicio'
UNION ALL
  SELECT id, 'Carpintería' FROM categorias WHERE nombre = 'Construcción y Remodelación' AND tipo = 'servicio'
UNION ALL
  SELECT id, 'Electricidad' FROM categorias WHERE nombre = 'Construcción y Remodelación' AND tipo = 'servicio'
UNION ALL
  SELECT id, 'Gasfitería' FROM categorias WHERE nombre = 'Construcción y Remodelación' AND tipo = 'servicio'
UNION ALL
  SELECT id, 'Pintura' FROM categorias WHERE nombre = 'Construcción y Remodelación' AND tipo = 'servicio'
UNION ALL
  SELECT id, 'Pavimentación' FROM categorias WHERE nombre = 'Construcción y Remodelación' AND tipo = 'servicio'
UNION ALL
  SELECT id, 'Techado y Cubiertas' FROM categorias WHERE nombre = 'Construcción y Remodelación' AND tipo = 'servicio'
UNION ALL
  SELECT id, 'Instalación de Puertas y Ventanas' FROM categorias WHERE nombre = 'Construcción y Remodelación' AND tipo = 'servicio'
UNION ALL
  SELECT id, 'Climatización e Instalaciones' FROM categorias WHERE nombre = 'Construcción y Remodelación' AND tipo = 'servicio'
UNION ALL
  SELECT id, 'Otros' FROM categorias WHERE nombre = 'Construcción y Remodelación' AND tipo = 'servicio';

-- Educación y Clases (servicio)
INSERT INTO subcategorias (categoria_id, nombre)
  SELECT id, 'Clases Particulares' FROM categorias WHERE nombre = 'Educación y Clases' AND tipo = 'servicio'
UNION ALL
  SELECT id, 'Idiomas' FROM categorias WHERE nombre = 'Educación y Clases' AND tipo = 'servicio'
UNION ALL
  SELECT id, 'Música e Instrumentos' FROM categorias WHERE nombre = 'Educación y Clases' AND tipo = 'servicio'
UNION ALL
  SELECT id, 'Deportes y Artes Marciales' FROM categorias WHERE nombre = 'Educación y Clases' AND tipo = 'servicio'
UNION ALL
  SELECT id, 'Arte y Manualidades' FROM categorias WHERE nombre = 'Educación y Clases' AND tipo = 'servicio'
UNION ALL
  SELECT id, 'Tecnología e Informática' FROM categorias WHERE nombre = 'Educación y Clases' AND tipo = 'servicio'
UNION ALL
  SELECT id, 'Oficios y Capacitación' FROM categorias WHERE nombre = 'Educación y Clases' AND tipo = 'servicio'
UNION ALL
  SELECT id, 'Otros' FROM categorias WHERE nombre = 'Educación y Clases' AND tipo = 'servicio';

-- Salud y Bienestar (servicio)
INSERT INTO subcategorias (categoria_id, nombre)
  SELECT id, 'Médico y Consulta' FROM categorias WHERE nombre = 'Salud y Bienestar' AND tipo = 'servicio'
UNION ALL
  SELECT id, 'Dental' FROM categorias WHERE nombre = 'Salud y Bienestar' AND tipo = 'servicio'
UNION ALL
  SELECT id, 'Psicología y Psiquiatría' FROM categorias WHERE nombre = 'Salud y Bienestar' AND tipo = 'servicio'
UNION ALL
  SELECT id, 'Nutrición' FROM categorias WHERE nombre = 'Salud y Bienestar' AND tipo = 'servicio'
UNION ALL
  SELECT id, 'Kinesiología y Rehabilitación' FROM categorias WHERE nombre = 'Salud y Bienestar' AND tipo = 'servicio'
UNION ALL
  SELECT id, 'Masajes Terapéuticos' FROM categorias WHERE nombre = 'Salud y Bienestar' AND tipo = 'servicio'
UNION ALL
  SELECT id, 'Yoga y Meditación' FROM categorias WHERE nombre = 'Salud y Bienestar' AND tipo = 'servicio'
UNION ALL
  SELECT id, 'Otros' FROM categorias WHERE nombre = 'Salud y Bienestar' AND tipo = 'servicio';

-- Limpieza y Mantención del Hogar (servicio)
INSERT INTO subcategorias (categoria_id, nombre)
  SELECT id, 'Limpieza de Casas y Oficinas' FROM categorias WHERE nombre = 'Limpieza y Mantención del Hogar' AND tipo = 'servicio'
UNION ALL
  SELECT id, 'Jardinería' FROM categorias WHERE nombre = 'Limpieza y Mantención del Hogar' AND tipo = 'servicio'
UNION ALL
  SELECT id, 'Mantención de Piscinas' FROM categorias WHERE nombre = 'Limpieza y Mantención del Hogar' AND tipo = 'servicio'
UNION ALL
  SELECT id, 'Control de Plagas' FROM categorias WHERE nombre = 'Limpieza y Mantención del Hogar' AND tipo = 'servicio'
UNION ALL
  SELECT id, 'Lavado de Alfombras' FROM categorias WHERE nombre = 'Limpieza y Mantención del Hogar' AND tipo = 'servicio'
UNION ALL
  SELECT id, 'Limpieza de Vidrios' FROM categorias WHERE nombre = 'Limpieza y Mantención del Hogar' AND tipo = 'servicio'
UNION ALL
  SELECT id, 'Otros' FROM categorias WHERE nombre = 'Limpieza y Mantención del Hogar' AND tipo = 'servicio';

-- Tecnología y Soporte (servicio)
INSERT INTO subcategorias (categoria_id, nombre)
  SELECT id, 'Reparación de PC y Notebook' FROM categorias WHERE nombre = 'Tecnología y Soporte' AND tipo = 'servicio'
UNION ALL
  SELECT id, 'Reparación de Celulares' FROM categorias WHERE nombre = 'Tecnología y Soporte' AND tipo = 'servicio'
UNION ALL
  SELECT id, 'Soporte Técnico a Domicilio' FROM categorias WHERE nombre = 'Tecnología y Soporte' AND tipo = 'servicio'
UNION ALL
  SELECT id, 'Desarrollo Web y Apps' FROM categorias WHERE nombre = 'Tecnología y Soporte' AND tipo = 'servicio'
UNION ALL
  SELECT id, 'Cámaras de Seguridad' FROM categorias WHERE nombre = 'Tecnología y Soporte' AND tipo = 'servicio'
UNION ALL
  SELECT id, 'Redes e Internet' FROM categorias WHERE nombre = 'Tecnología y Soporte' AND tipo = 'servicio'
UNION ALL
  SELECT id, 'Otros' FROM categorias WHERE nombre = 'Tecnología y Soporte' AND tipo = 'servicio';

-- Fotografía y Video (servicio)
INSERT INTO subcategorias (categoria_id, nombre)
  SELECT id, 'Fotografía de Bodas' FROM categorias WHERE nombre = 'Fotografía y Video' AND tipo = 'servicio'
UNION ALL
  SELECT id, 'Fotografía de Eventos' FROM categorias WHERE nombre = 'Fotografía y Video' AND tipo = 'servicio'
UNION ALL
  SELECT id, 'Retratos y Familias' FROM categorias WHERE nombre = 'Fotografía y Video' AND tipo = 'servicio'
UNION ALL
  SELECT id, 'Video Corporativo' FROM categorias WHERE nombre = 'Fotografía y Video' AND tipo = 'servicio'
UNION ALL
  SELECT id, 'Drones y Aéreo' FROM categorias WHERE nombre = 'Fotografía y Video' AND tipo = 'servicio'
UNION ALL
  SELECT id, 'Edición y Postproducción' FROM categorias WHERE nombre = 'Fotografía y Video' AND tipo = 'servicio'
UNION ALL
  SELECT id, 'Otros' FROM categorias WHERE nombre = 'Fotografía y Video' AND tipo = 'servicio';

-- Belleza y Estética (servicio)
INSERT INTO subcategorias (categoria_id, nombre)
  SELECT id, 'Peluquería' FROM categorias WHERE nombre = 'Belleza y Estética' AND tipo = 'servicio'
UNION ALL
  SELECT id, 'Manicura y Pedicura' FROM categorias WHERE nombre = 'Belleza y Estética' AND tipo = 'servicio'
UNION ALL
  SELECT id, 'Maquillaje Profesional' FROM categorias WHERE nombre = 'Belleza y Estética' AND tipo = 'servicio'
UNION ALL
  SELECT id, 'Depilación' FROM categorias WHERE nombre = 'Belleza y Estética' AND tipo = 'servicio'
UNION ALL
  SELECT id, 'Tratamientos Faciales' FROM categorias WHERE nombre = 'Belleza y Estética' AND tipo = 'servicio'
UNION ALL
  SELECT id, 'Masajes Estéticos' FROM categorias WHERE nombre = 'Belleza y Estética' AND tipo = 'servicio'
UNION ALL
  SELECT id, 'Barbería' FROM categorias WHERE nombre = 'Belleza y Estética' AND tipo = 'servicio'
UNION ALL
  SELECT id, 'Otros' FROM categorias WHERE nombre = 'Belleza y Estética' AND tipo = 'servicio';

-- Gastronomía y Catering (servicio)
INSERT INTO subcategorias (categoria_id, nombre)
  SELECT id, 'Catering y Banquetería' FROM categorias WHERE nombre = 'Gastronomía y Catering' AND tipo = 'servicio'
UNION ALL
  SELECT id, 'Chef a Domicilio' FROM categorias WHERE nombre = 'Gastronomía y Catering' AND tipo = 'servicio'
UNION ALL
  SELECT id, 'Repostería y Tortas' FROM categorias WHERE nombre = 'Gastronomía y Catering' AND tipo = 'servicio'
UNION ALL
  SELECT id, 'Servicio de Barman' FROM categorias WHERE nombre = 'Gastronomía y Catering' AND tipo = 'servicio'
UNION ALL
  SELECT id, 'Producción de Alimentos Artesanales' FROM categorias WHERE nombre = 'Gastronomía y Catering' AND tipo = 'servicio'
UNION ALL
  SELECT id, 'Otros' FROM categorias WHERE nombre = 'Gastronomía y Catering' AND tipo = 'servicio';

-- Transporte y Mudanzas (servicio)
INSERT INTO subcategorias (categoria_id, nombre)
  SELECT id, 'Transporte de Personas' FROM categorias WHERE nombre = 'Transporte y Mudanzas' AND tipo = 'servicio'
UNION ALL
  SELECT id, 'Servicios de Fletes' FROM categorias WHERE nombre = 'Transporte y Mudanzas' AND tipo = 'servicio'
UNION ALL
  SELECT id, 'Mudanzas' FROM categorias WHERE nombre = 'Transporte y Mudanzas' AND tipo = 'servicio'
UNION ALL
  SELECT id, 'Remises y Transfer' FROM categorias WHERE nombre = 'Transporte y Mudanzas' AND tipo = 'servicio'
UNION ALL
  SELECT id, 'Transporte Escolar' FROM categorias WHERE nombre = 'Transporte y Mudanzas' AND tipo = 'servicio'
UNION ALL
  SELECT id, 'Servicios de Grúa' FROM categorias WHERE nombre = 'Transporte y Mudanzas' AND tipo = 'servicio'
UNION ALL
  SELECT id, 'Otros' FROM categorias WHERE nombre = 'Transporte y Mudanzas' AND tipo = 'servicio';

-- Eventos y Fiestas (servicio)
INSERT INTO subcategorias (categoria_id, nombre)
  SELECT id, 'Animación y Entretenimiento' FROM categorias WHERE nombre = 'Eventos y Fiestas' AND tipo = 'servicio'
UNION ALL
  SELECT id, 'DJ y Música en Vivo' FROM categorias WHERE nombre = 'Eventos y Fiestas' AND tipo = 'servicio'
UNION ALL
  SELECT id, 'Sonido e Iluminación' FROM categorias WHERE nombre = 'Eventos y Fiestas' AND tipo = 'servicio'
UNION ALL
  SELECT id, 'Decoración de Eventos' FROM categorias WHERE nombre = 'Eventos y Fiestas' AND tipo = 'servicio'
UNION ALL
  SELECT id, 'Fotografía de Eventos' FROM categorias WHERE nombre = 'Eventos y Fiestas' AND tipo = 'servicio'
UNION ALL
  SELECT id, 'Arriendos para Eventos' FROM categorias WHERE nombre = 'Eventos y Fiestas' AND tipo = 'servicio'
UNION ALL
  SELECT id, 'Otros' FROM categorias WHERE nombre = 'Eventos y Fiestas' AND tipo = 'servicio';

-- Profesionales y Consultoría (servicio)
INSERT INTO subcategorias (categoria_id, nombre)
  SELECT id, 'Abogacía' FROM categorias WHERE nombre = 'Profesionales y Consultoría' AND tipo = 'servicio'
UNION ALL
  SELECT id, 'Contabilidad y Finanzas' FROM categorias WHERE nombre = 'Profesionales y Consultoría' AND tipo = 'servicio'
UNION ALL
  SELECT id, 'Arquitectura y Diseño' FROM categorias WHERE nombre = 'Profesionales y Consultoría' AND tipo = 'servicio'
UNION ALL
  SELECT id, 'Marketing y Publicidad' FROM categorias WHERE nombre = 'Profesionales y Consultoría' AND tipo = 'servicio'
UNION ALL
  SELECT id, 'Diseño Gráfico' FROM categorias WHERE nombre = 'Profesionales y Consultoría' AND tipo = 'servicio'
UNION ALL
  SELECT id, 'Traducciones' FROM categorias WHERE nombre = 'Profesionales y Consultoría' AND tipo = 'servicio'
UNION ALL
  SELECT id, 'Otros' FROM categorias WHERE nombre = 'Profesionales y Consultoría' AND tipo = 'servicio';

-- Mantención de Vehículos (servicio)
INSERT INTO subcategorias (categoria_id, nombre)
  SELECT id, 'Mecánica General' FROM categorias WHERE nombre = 'Mantención de Vehículos' AND tipo = 'servicio'
UNION ALL
  SELECT id, 'Electricidad Vehicular' FROM categorias WHERE nombre = 'Mantención de Vehículos' AND tipo = 'servicio'
UNION ALL
  SELECT id, 'Pintura y Chapería' FROM categorias WHERE nombre = 'Mantención de Vehículos' AND tipo = 'servicio'
UNION ALL
  SELECT id, 'Cambio de Aceite y Filtros' FROM categorias WHERE nombre = 'Mantención de Vehículos' AND tipo = 'servicio'
UNION ALL
  SELECT id, 'Neumáticos y Alineación' FROM categorias WHERE nombre = 'Mantención de Vehículos' AND tipo = 'servicio'
UNION ALL
  SELECT id, 'Otros' FROM categorias WHERE nombre = 'Mantención de Vehículos' AND tipo = 'servicio';

-- Casas y Departamentos (arriendo)
INSERT INTO subcategorias (categoria_id, nombre)
  SELECT id, 'Casa Completa' FROM categorias WHERE nombre = 'Casas y Departamentos' AND tipo = 'arriendo'
UNION ALL
  SELECT id, 'Departamento' FROM categorias WHERE nombre = 'Casas y Departamentos' AND tipo = 'arriendo'
UNION ALL
  SELECT id, 'Cabaña' FROM categorias WHERE nombre = 'Casas y Departamentos' AND tipo = 'arriendo'
UNION ALL
  SELECT id, 'Tiny House' FROM categorias WHERE nombre = 'Casas y Departamentos' AND tipo = 'arriendo'
UNION ALL
  SELECT id, 'Arriendo Diario' FROM categorias WHERE nombre = 'Casas y Departamentos' AND tipo = 'arriendo'
UNION ALL
  SELECT id, 'Arriendo Semanal' FROM categorias WHERE nombre = 'Casas y Departamentos' AND tipo = 'arriendo'
UNION ALL
  SELECT id, 'Arriendo Mensual' FROM categorias WHERE nombre = 'Casas y Departamentos' AND tipo = 'arriendo'
UNION ALL
  SELECT id, 'Arriendo Anual' FROM categorias WHERE nombre = 'Casas y Departamentos' AND tipo = 'arriendo'
UNION ALL
  SELECT id, 'Otros' FROM categorias WHERE nombre = 'Casas y Departamentos' AND tipo = 'arriendo';

-- Habitaciones (arriendo)
INSERT INTO subcategorias (categoria_id, nombre)
  SELECT id, 'Habitación en Casa Compartida' FROM categorias WHERE nombre = 'Habitaciones' AND tipo = 'arriendo'
UNION ALL
  SELECT id, 'Residencial Estudiantil' FROM categorias WHERE nombre = 'Habitaciones' AND tipo = 'arriendo'
UNION ALL
  SELECT id, 'Cuarto con Baño Privado' FROM categorias WHERE nombre = 'Habitaciones' AND tipo = 'arriendo'
UNION ALL
  SELECT id, 'Cuarto con Baño Compartido' FROM categorias WHERE nombre = 'Habitaciones' AND tipo = 'arriendo'
UNION ALL
  SELECT id, 'Otros' FROM categorias WHERE nombre = 'Habitaciones' AND tipo = 'arriendo';

-- Locales y Oficinas (arriendo)
INSERT INTO subcategorias (categoria_id, nombre)
  SELECT id, 'Local Comercial' FROM categorias WHERE nombre = 'Locales y Oficinas' AND tipo = 'arriendo'
UNION ALL
  SELECT id, 'Oficina' FROM categorias WHERE nombre = 'Locales y Oficinas' AND tipo = 'arriendo'
UNION ALL
  SELECT id, 'Bodega' FROM categorias WHERE nombre = 'Locales y Oficinas' AND tipo = 'arriendo'
UNION ALL
  SELECT id, 'Galería o Stand' FROM categorias WHERE nombre = 'Locales y Oficinas' AND tipo = 'arriendo'
UNION ALL
  SELECT id, 'Espacio para Coworking' FROM categorias WHERE nombre = 'Locales y Oficinas' AND tipo = 'arriendo'
UNION ALL
  SELECT id, 'Otros' FROM categorias WHERE nombre = 'Locales y Oficinas' AND tipo = 'arriendo';

-- Vehículos (arriendo)
INSERT INTO subcategorias (categoria_id, nombre)
  SELECT id, 'Autos y Camionetas' FROM categorias WHERE nombre = 'Vehículos' AND tipo = 'arriendo'
UNION ALL
  SELECT id, 'Motos' FROM categorias WHERE nombre = 'Vehículos' AND tipo = 'arriendo'
UNION ALL
  SELECT id, 'Bicicletas' FROM categorias WHERE nombre = 'Vehículos' AND tipo = 'arriendo'
UNION ALL
  SELECT id, 'Camiones y Furgones' FROM categorias WHERE nombre = 'Vehículos' AND tipo = 'arriendo'
UNION ALL
  SELECT id, 'Maquinaria Agrícola' FROM categorias WHERE nombre = 'Vehículos' AND tipo = 'arriendo'
UNION ALL
  SELECT id, 'Otros' FROM categorias WHERE nombre = 'Vehículos' AND tipo = 'arriendo';

-- Equipos y Herramientas (arriendo)
INSERT INTO subcategorias (categoria_id, nombre)
  SELECT id, 'Herramientas Eléctricas' FROM categorias WHERE nombre = 'Equipos y Herramientas' AND tipo = 'arriendo'
UNION ALL
  SELECT id, 'Maquinaria de Construcción' FROM categorias WHERE nombre = 'Equipos y Herramientas' AND tipo = 'arriendo'
UNION ALL
  SELECT id, 'Equipos de Jardinería' FROM categorias WHERE nombre = 'Equipos y Herramientas' AND tipo = 'arriendo'
UNION ALL
  SELECT id, 'Equipos de Limpieza Industrial' FROM categorias WHERE nombre = 'Equipos y Herramientas' AND tipo = 'arriendo'
UNION ALL
  SELECT id, 'Andamios y Escaleras' FROM categorias WHERE nombre = 'Equipos y Herramientas' AND tipo = 'arriendo'
UNION ALL
  SELECT id, 'Otros' FROM categorias WHERE nombre = 'Equipos y Herramientas' AND tipo = 'arriendo';

-- Espacios para Eventos (arriendo)
INSERT INTO subcategorias (categoria_id, nombre)
  SELECT id, 'Salón de Eventos' FROM categorias WHERE nombre = 'Espacios para Eventos' AND tipo = 'arriendo'
UNION ALL
  SELECT id, 'Quincho y Asado' FROM categorias WHERE nombre = 'Espacios para Eventos' AND tipo = 'arriendo'
UNION ALL
  SELECT id, 'Cancha Deportiva' FROM categorias WHERE nombre = 'Espacios para Eventos' AND tipo = 'arriendo'
UNION ALL
  SELECT id, 'Terraza y Jardín' FROM categorias WHERE nombre = 'Espacios para Eventos' AND tipo = 'arriendo'
UNION ALL
  SELECT id, 'Sala de Reuniones' FROM categorias WHERE nombre = 'Espacios para Eventos' AND tipo = 'arriendo'
UNION ALL
  SELECT id, 'Otros' FROM categorias WHERE nombre = 'Espacios para Eventos' AND tipo = 'arriendo';

-- Equipos para Eventos (arriendo)
INSERT INTO subcategorias (categoria_id, nombre)
  SELECT id, 'Sonido e Iluminación' FROM categorias WHERE nombre = 'Equipos para Eventos' AND tipo = 'arriendo'
UNION ALL
  SELECT id, 'Carpas y Toldos' FROM categorias WHERE nombre = 'Equipos para Eventos' AND tipo = 'arriendo'
UNION ALL
  SELECT id, 'Mesas y Sillas' FROM categorias WHERE nombre = 'Equipos para Eventos' AND tipo = 'arriendo'
UNION ALL
  SELECT id, 'Vajilla y Menaje' FROM categorias WHERE nombre = 'Equipos para Eventos' AND tipo = 'arriendo'
UNION ALL
  SELECT id, 'Juegos Inflables' FROM categorias WHERE nombre = 'Equipos para Eventos' AND tipo = 'arriendo'
UNION ALL
  SELECT id, 'Otros' FROM categorias WHERE nombre = 'Equipos para Eventos' AND tipo = 'arriendo';

-- Embarcaciones y Deportes Acuáticos (arriendo)
INSERT INTO subcategorias (categoria_id, nombre)
  SELECT id, 'Kayaks' FROM categorias WHERE nombre = 'Embarcaciones y Deportes Acuáticos' AND tipo = 'arriendo'
UNION ALL
  SELECT id, 'Tablas de Paddle (SUP)' FROM categorias WHERE nombre = 'Embarcaciones y Deportes Acuáticos' AND tipo = 'arriendo'
UNION ALL
  SELECT id, 'Botes a Motor' FROM categorias WHERE nombre = 'Embarcaciones y Deportes Acuáticos' AND tipo = 'arriendo'
UNION ALL
  SELECT id, 'Botes a Remo' FROM categorias WHERE nombre = 'Embarcaciones y Deportes Acuáticos' AND tipo = 'arriendo'
UNION ALL
  SELECT id, 'Tablas de Surf' FROM categorias WHERE nombre = 'Embarcaciones y Deportes Acuáticos' AND tipo = 'arriendo'
UNION ALL
  SELECT id, 'Otros' FROM categorias WHERE nombre = 'Embarcaciones y Deportes Acuáticos' AND tipo = 'arriendo';

-- Agrícola y Rural (arriendo)
INSERT INTO subcategorias (categoria_id, nombre)
  SELECT id, 'Terrenos Agrícolas' FROM categorias WHERE nombre = 'Agrícola y Rural' AND tipo = 'arriendo'
UNION ALL
  SELECT id, 'Maquinaria Agrícola' FROM categorias WHERE nombre = 'Agrícola y Rural' AND tipo = 'arriendo'
UNION ALL
  SELECT id, 'Animales de Trabajo' FROM categorias WHERE nombre = 'Agrícola y Rural' AND tipo = 'arriendo'
UNION ALL
  SELECT id, 'Equipos de Riego' FROM categorias WHERE nombre = 'Agrícola y Rural' AND tipo = 'arriendo'
UNION ALL
  SELECT id, 'Otros' FROM categorias WHERE nombre = 'Agrícola y Rural' AND tipo = 'arriendo';

-- Aventura y Adrenalina (turismo)
INSERT INTO subcategorias (categoria_id, nombre)
  SELECT id, 'Rafting' FROM categorias WHERE nombre = 'Aventura y Adrenalina' AND tipo = 'turismo'
UNION ALL
  SELECT id, 'Kayak de Aguas Bravas' FROM categorias WHERE nombre = 'Aventura y Adrenalina' AND tipo = 'turismo'
UNION ALL
  SELECT id, 'Canopy y Tirolesa' FROM categorias WHERE nombre = 'Aventura y Adrenalina' AND tipo = 'turismo'
UNION ALL
  SELECT id, 'Rappel y Escalada' FROM categorias WHERE nombre = 'Aventura y Adrenalina' AND tipo = 'turismo'
UNION ALL
  SELECT id, 'Bungee y Saltos Extremos' FROM categorias WHERE nombre = 'Aventura y Adrenalina' AND tipo = 'turismo'
UNION ALL
  SELECT id, 'Paintball' FROM categorias WHERE nombre = 'Aventura y Adrenalina' AND tipo = 'turismo'
UNION ALL
  SELECT id, 'Parapente y Ala Delta' FROM categorias WHERE nombre = 'Aventura y Adrenalina' AND tipo = 'turismo'
UNION ALL
  SELECT id, 'Cuatrimotos y Off-Road' FROM categorias WHERE nombre = 'Aventura y Adrenalina' AND tipo = 'turismo'
UNION ALL
  SELECT id, 'Tiro con Arco' FROM categorias WHERE nombre = 'Aventura y Adrenalina' AND tipo = 'turismo'
UNION ALL
  SELECT id, 'Otros' FROM categorias WHERE nombre = 'Aventura y Adrenalina' AND tipo = 'turismo';

-- Volcán y Nieve (turismo)
INSERT INTO subcategorias (categoria_id, nombre)
  SELECT id, 'Ascenso al Volcán' FROM categorias WHERE nombre = 'Volcán y Nieve' AND tipo = 'turismo'
UNION ALL
  SELECT id, 'Tour Guiado al Volcán' FROM categorias WHERE nombre = 'Volcán y Nieve' AND tipo = 'turismo'
UNION ALL
  SELECT id, 'Ski y Snowboard' FROM categorias WHERE nombre = 'Volcán y Nieve' AND tipo = 'turismo'
UNION ALL
  SELECT id, 'Clases de Ski' FROM categorias WHERE nombre = 'Volcán y Nieve' AND tipo = 'turismo'
UNION ALL
  SELECT id, 'Snowshoeing (Raquetas de Nieve)' FROM categorias WHERE nombre = 'Volcán y Nieve' AND tipo = 'turismo'
UNION ALL
  SELECT id, 'Fotografía de Volcán' FROM categorias WHERE nombre = 'Volcán y Nieve' AND tipo = 'turismo'
UNION ALL
  SELECT id, 'Observación de Lava y Geología' FROM categorias WHERE nombre = 'Volcán y Nieve' AND tipo = 'turismo'
UNION ALL
  SELECT id, 'Otros' FROM categorias WHERE nombre = 'Volcán y Nieve' AND tipo = 'turismo';

-- Lago y Actividades Acuáticas (turismo)
INSERT INTO subcategorias (categoria_id, nombre)
  SELECT id, 'Paseo en Lancha' FROM categorias WHERE nombre = 'Lago y Actividades Acuáticas' AND tipo = 'turismo'
UNION ALL
  SELECT id, 'Paseo en Velero' FROM categorias WHERE nombre = 'Lago y Actividades Acuáticas' AND tipo = 'turismo'
UNION ALL
  SELECT id, 'Kayak en el Lago' FROM categorias WHERE nombre = 'Lago y Actividades Acuáticas' AND tipo = 'turismo'
UNION ALL
  SELECT id, 'Paddle SUP (Stand Up Paddle)' FROM categorias WHERE nombre = 'Lago y Actividades Acuáticas' AND tipo = 'turismo'
UNION ALL
  SELECT id, 'Pesca Deportiva' FROM categorias WHERE nombre = 'Lago y Actividades Acuáticas' AND tipo = 'turismo'
UNION ALL
  SELECT id, 'Natación y Playa de Lago' FROM categorias WHERE nombre = 'Lago y Actividades Acuáticas' AND tipo = 'turismo'
UNION ALL
  SELECT id, 'Wakeboard y Esquí Acuático' FROM categorias WHERE nombre = 'Lago y Actividades Acuáticas' AND tipo = 'turismo'
UNION ALL
  SELECT id, 'Snorkel y Buceo en Lagos' FROM categorias WHERE nombre = 'Lago y Actividades Acuáticas' AND tipo = 'turismo'
UNION ALL
  SELECT id, 'Otros' FROM categorias WHERE nombre = 'Lago y Actividades Acuáticas' AND tipo = 'turismo';

-- Senderismo y Trekking (turismo)
INSERT INTO subcategorias (categoria_id, nombre)
  SELECT id, 'Trekking Media Jornada' FROM categorias WHERE nombre = 'Senderismo y Trekking' AND tipo = 'turismo'
UNION ALL
  SELECT id, 'Trekking Día Completo' FROM categorias WHERE nombre = 'Senderismo y Trekking' AND tipo = 'turismo'
UNION ALL
  SELECT id, 'Trekking Nocturno' FROM categorias WHERE nombre = 'Senderismo y Trekking' AND tipo = 'turismo'
UNION ALL
  SELECT id, 'Caminata a Cascadas' FROM categorias WHERE nombre = 'Senderismo y Trekking' AND tipo = 'turismo'
UNION ALL
  SELECT id, 'Caminata a Miradores' FROM categorias WHERE nombre = 'Senderismo y Trekking' AND tipo = 'turismo'
UNION ALL
  SELECT id, 'Senderismo Familiar' FROM categorias WHERE nombre = 'Senderismo y Trekking' AND tipo = 'turismo'
UNION ALL
  SELECT id, 'Caminata Fotográfica' FROM categorias WHERE nombre = 'Senderismo y Trekking' AND tipo = 'turismo'
UNION ALL
  SELECT id, 'Alta Montaña' FROM categorias WHERE nombre = 'Senderismo y Trekking' AND tipo = 'turismo'
UNION ALL
  SELECT id, 'Otros' FROM categorias WHERE nombre = 'Senderismo y Trekking' AND tipo = 'turismo';

-- Naturaleza y Ecoturismo (turismo)
INSERT INTO subcategorias (categoria_id, nombre)
  SELECT id, 'Parque Nacional Villarrica' FROM categorias WHERE nombre = 'Naturaleza y Ecoturismo' AND tipo = 'turismo'
UNION ALL
  SELECT id, 'Reservas y Santuarios Naturales' FROM categorias WHERE nombre = 'Naturaleza y Ecoturismo' AND tipo = 'turismo'
UNION ALL
  SELECT id, 'Avistamiento de Aves' FROM categorias WHERE nombre = 'Naturaleza y Ecoturismo' AND tipo = 'turismo'
UNION ALL
  SELECT id, 'Avistamiento de Fauna Silvestre' FROM categorias WHERE nombre = 'Naturaleza y Ecoturismo' AND tipo = 'turismo'
UNION ALL
  SELECT id, 'Fotografía de Naturaleza' FROM categorias WHERE nombre = 'Naturaleza y Ecoturismo' AND tipo = 'turismo'
UNION ALL
  SELECT id, 'Recorrido por Bosque Nativo' FROM categorias WHERE nombre = 'Naturaleza y Ecoturismo' AND tipo = 'turismo'
UNION ALL
  SELECT id, 'Jardines y Viveros' FROM categorias WHERE nombre = 'Naturaleza y Ecoturismo' AND tipo = 'turismo'
UNION ALL
  SELECT id, 'Observación de Estrellas' FROM categorias WHERE nombre = 'Naturaleza y Ecoturismo' AND tipo = 'turismo'
UNION ALL
  SELECT id, 'Otros' FROM categorias WHERE nombre = 'Naturaleza y Ecoturismo' AND tipo = 'turismo';

-- Termas y Bienestar (turismo)
INSERT INTO subcategorias (categoria_id, nombre)
  SELECT id, 'Termas Naturales al Aire Libre' FROM categorias WHERE nombre = 'Termas y Bienestar' AND tipo = 'turismo'
UNION ALL
  SELECT id, 'Termas con Piscinas Cubiertas' FROM categorias WHERE nombre = 'Termas y Bienestar' AND tipo = 'turismo'
UNION ALL
  SELECT id, 'Spa y Masajes Relajantes' FROM categorias WHERE nombre = 'Termas y Bienestar' AND tipo = 'turismo'
UNION ALL
  SELECT id, 'Masajes Terapéuticos' FROM categorias WHERE nombre = 'Termas y Bienestar' AND tipo = 'turismo'
UNION ALL
  SELECT id, 'Retiro de Yoga y Meditación' FROM categorias WHERE nombre = 'Termas y Bienestar' AND tipo = 'turismo'
UNION ALL
  SELECT id, 'Temazcal' FROM categorias WHERE nombre = 'Termas y Bienestar' AND tipo = 'turismo'
UNION ALL
  SELECT id, 'Baño de Bosque (Shinrin-Yoku)' FROM categorias WHERE nombre = 'Termas y Bienestar' AND tipo = 'turismo'
UNION ALL
  SELECT id, 'Flotación y Mindfulness' FROM categorias WHERE nombre = 'Termas y Bienestar' AND tipo = 'turismo'
UNION ALL
  SELECT id, 'Otros' FROM categorias WHERE nombre = 'Termas y Bienestar' AND tipo = 'turismo';

-- Cultura y Patrimonio (turismo)
INSERT INTO subcategorias (categoria_id, nombre)
  SELECT id, 'Cultura Mapuche' FROM categorias WHERE nombre = 'Cultura y Patrimonio' AND tipo = 'turismo'
UNION ALL
  SELECT id, 'Ruka Mapuche y Ceremonias' FROM categorias WHERE nombre = 'Cultura y Patrimonio' AND tipo = 'turismo'
UNION ALL
  SELECT id, 'Artesanías Locales' FROM categorias WHERE nombre = 'Cultura y Patrimonio' AND tipo = 'turismo'
UNION ALL
  SELECT id, 'Museos y Centros Culturales' FROM categorias WHERE nombre = 'Cultura y Patrimonio' AND tipo = 'turismo'
UNION ALL
  SELECT id, 'Sitios Arqueológicos' FROM categorias WHERE nombre = 'Cultura y Patrimonio' AND tipo = 'turismo'
UNION ALL
  SELECT id, 'Visita a Comunidades Rurales' FROM categorias WHERE nombre = 'Cultura y Patrimonio' AND tipo = 'turismo'
UNION ALL
  SELECT id, 'Folklore y Danzas Tradicionales' FROM categorias WHERE nombre = 'Cultura y Patrimonio' AND tipo = 'turismo'
UNION ALL
  SELECT id, 'Fotografía Patrimonial' FROM categorias WHERE nombre = 'Cultura y Patrimonio' AND tipo = 'turismo'
UNION ALL
  SELECT id, 'Otros' FROM categorias WHERE nombre = 'Cultura y Patrimonio' AND tipo = 'turismo';

-- Gastronomía y Sabores Locales (turismo)
INSERT INTO subcategorias (categoria_id, nombre)
  SELECT id, 'Tour Gastronómico' FROM categorias WHERE nombre = 'Gastronomía y Sabores Locales' AND tipo = 'turismo'
UNION ALL
  SELECT id, 'Cocina Mapuche y Ancestral' FROM categorias WHERE nombre = 'Gastronomía y Sabores Locales' AND tipo = 'turismo'
UNION ALL
  SELECT id, 'Cervecerías Artesanales' FROM categorias WHERE nombre = 'Gastronomía y Sabores Locales' AND tipo = 'turismo'
UNION ALL
  SELECT id, 'Viñas y Bodegas' FROM categorias WHERE nombre = 'Gastronomía y Sabores Locales' AND tipo = 'turismo'
UNION ALL
  SELECT id, 'Mercados y Ferias de Productores' FROM categorias WHERE nombre = 'Gastronomía y Sabores Locales' AND tipo = 'turismo'
UNION ALL
  SELECT id, 'Picadas y Comida Típica' FROM categorias WHERE nombre = 'Gastronomía y Sabores Locales' AND tipo = 'turismo'
UNION ALL
  SELECT id, 'Clase de Cocina Tradicional' FROM categorias WHERE nombre = 'Gastronomía y Sabores Locales' AND tipo = 'turismo'
UNION ALL
  SELECT id, 'Maridajes y Catas' FROM categorias WHERE nombre = 'Gastronomía y Sabores Locales' AND tipo = 'turismo'
UNION ALL
  SELECT id, 'Otros' FROM categorias WHERE nombre = 'Gastronomía y Sabores Locales' AND tipo = 'turismo';

-- Ciclismo y Rutas (turismo)
INSERT INTO subcategorias (categoria_id, nombre)
  SELECT id, 'Ciclismo de Montaña (MTB)' FROM categorias WHERE nombre = 'Ciclismo y Rutas' AND tipo = 'turismo'
UNION ALL
  SELECT id, 'Ruta en Bicicleta por el Lago' FROM categorias WHERE nombre = 'Ciclismo y Rutas' AND tipo = 'turismo'
UNION ALL
  SELECT id, 'E-Bike (Bicicleta Eléctrica)' FROM categorias WHERE nombre = 'Ciclismo y Rutas' AND tipo = 'turismo'
UNION ALL
  SELECT id, 'Ruta Panorámica' FROM categorias WHERE nombre = 'Ciclismo y Rutas' AND tipo = 'turismo'
UNION ALL
  SELECT id, 'Descenso en Bicicleta' FROM categorias WHERE nombre = 'Ciclismo y Rutas' AND tipo = 'turismo'
UNION ALL
  SELECT id, 'Ciclismo Familiar' FROM categorias WHERE nombre = 'Ciclismo y Rutas' AND tipo = 'turismo'
UNION ALL
  SELECT id, 'Cicloturismo Rural' FROM categorias WHERE nombre = 'Ciclismo y Rutas' AND tipo = 'turismo'
UNION ALL
  SELECT id, 'Otros' FROM categorias WHERE nombre = 'Ciclismo y Rutas' AND tipo = 'turismo';

-- Equitación y Campo (turismo)
INSERT INTO subcategorias (categoria_id, nombre)
  SELECT id, 'Paseo a Caballo' FROM categorias WHERE nombre = 'Equitación y Campo' AND tipo = 'turismo'
UNION ALL
  SELECT id, 'Trekking Ecuestre' FROM categorias WHERE nombre = 'Equitación y Campo' AND tipo = 'turismo'
UNION ALL
  SELECT id, 'Visita a Estancia y Hacienda' FROM categorias WHERE nombre = 'Equitación y Campo' AND tipo = 'turismo'
UNION ALL
  SELECT id, 'Ordeña y Vida Rural' FROM categorias WHERE nombre = 'Equitación y Campo' AND tipo = 'turismo'
UNION ALL
  SELECT id, 'Arreo de Animales' FROM categorias WHERE nombre = 'Equitación y Campo' AND tipo = 'turismo'
UNION ALL
  SELECT id, 'Rodeo y Tradición Campesina' FROM categorias WHERE nombre = 'Equitación y Campo' AND tipo = 'turismo'
UNION ALL
  SELECT id, 'Otros' FROM categorias WHERE nombre = 'Equitación y Campo' AND tipo = 'turismo';

-- Tours y Excursiones (turismo)
INSERT INTO subcategorias (categoria_id, nombre)
  SELECT id, 'Tour Día Completo (Full Day)' FROM categorias WHERE nombre = 'Tours y Excursiones' AND tipo = 'turismo'
UNION ALL
  SELECT id, 'Tour Medio Día' FROM categorias WHERE nombre = 'Tours y Excursiones' AND tipo = 'turismo'
UNION ALL
  SELECT id, 'City Tour' FROM categorias WHERE nombre = 'Tours y Excursiones' AND tipo = 'turismo'
UNION ALL
  SELECT id, 'Excursión a Parque Nacional' FROM categorias WHERE nombre = 'Tours y Excursiones' AND tipo = 'turismo'
UNION ALL
  SELECT id, 'Tour Fotográfico' FROM categorias WHERE nombre = 'Tours y Excursiones' AND tipo = 'turismo'
UNION ALL
  SELECT id, 'Tour en Minivan o Bus Turístico' FROM categorias WHERE nombre = 'Tours y Excursiones' AND tipo = 'turismo'
UNION ALL
  SELECT id, 'Tour Privado a Medida' FROM categorias WHERE nombre = 'Tours y Excursiones' AND tipo = 'turismo'
UNION ALL
  SELECT id, 'Tour Nocturno' FROM categorias WHERE nombre = 'Tours y Excursiones' AND tipo = 'turismo'
UNION ALL
  SELECT id, 'Excursión Combinada (2+ actividades)' FROM categorias WHERE nombre = 'Tours y Excursiones' AND tipo = 'turismo'
UNION ALL
  SELECT id, 'Otros' FROM categorias WHERE nombre = 'Tours y Excursiones' AND tipo = 'turismo';

-- Turismo Familiar (turismo)
INSERT INTO subcategorias (categoria_id, nombre)
  SELECT id, 'Parques de Juegos y Entretenimiento' FROM categorias WHERE nombre = 'Turismo Familiar' AND tipo = 'turismo'
UNION ALL
  SELECT id, 'Granjas Educativas' FROM categorias WHERE nombre = 'Turismo Familiar' AND tipo = 'turismo'
UNION ALL
  SELECT id, 'Zoológicos y Parques Animales' FROM categorias WHERE nombre = 'Turismo Familiar' AND tipo = 'turismo'
UNION ALL
  SELECT id, 'Actividades para Niños' FROM categorias WHERE nombre = 'Turismo Familiar' AND tipo = 'turismo'
UNION ALL
  SELECT id, 'Paseos en Bote Familiar' FROM categorias WHERE nombre = 'Turismo Familiar' AND tipo = 'turismo'
UNION ALL
  SELECT id, 'Picnic y Áreas Verdes' FROM categorias WHERE nombre = 'Turismo Familiar' AND tipo = 'turismo'
UNION ALL
  SELECT id, 'Talleres Creativos para Niños' FROM categorias WHERE nombre = 'Turismo Familiar' AND tipo = 'turismo'
UNION ALL
  SELECT id, 'Otros' FROM categorias WHERE nombre = 'Turismo Familiar' AND tipo = 'turismo';

-- Fotografía y Arte (turismo)
INSERT INTO subcategorias (categoria_id, nombre)
  SELECT id, 'Tour Fotográfico de Paisajes' FROM categorias WHERE nombre = 'Fotografía y Arte' AND tipo = 'turismo'
UNION ALL
  SELECT id, 'Fotografía de Fauna' FROM categorias WHERE nombre = 'Fotografía y Arte' AND tipo = 'turismo'
UNION ALL
  SELECT id, 'Fotografía de Volcán y Lago' FROM categorias WHERE nombre = 'Fotografía y Arte' AND tipo = 'turismo'
UNION ALL
  SELECT id, 'Talleres de Fotografía' FROM categorias WHERE nombre = 'Fotografía y Arte' AND tipo = 'turismo'
UNION ALL
  SELECT id, 'Arte Urbano y Grafiti' FROM categorias WHERE nombre = 'Fotografía y Arte' AND tipo = 'turismo'
UNION ALL
  SELECT id, 'Visita a Galerías de Arte' FROM categorias WHERE nombre = 'Fotografía y Arte' AND tipo = 'turismo'
UNION ALL
  SELECT id, 'Otros' FROM categorias WHERE nombre = 'Fotografía y Arte' AND tipo = 'turismo';

-- Alojamiento Turístico (turismo)
INSERT INTO subcategorias (categoria_id, nombre)
  SELECT id, 'Cabañas con Vista al Lago' FROM categorias WHERE nombre = 'Alojamiento Turístico' AND tipo = 'turismo'
UNION ALL
  SELECT id, 'Camping Equipado' FROM categorias WHERE nombre = 'Alojamiento Turístico' AND tipo = 'turismo'
UNION ALL
  SELECT id, 'Glamping' FROM categorias WHERE nombre = 'Alojamiento Turístico' AND tipo = 'turismo'
UNION ALL
  SELECT id, 'Refugio de Montaña' FROM categorias WHERE nombre = 'Alojamiento Turístico' AND tipo = 'turismo'
UNION ALL
  SELECT id, 'Hostales y Guesthouses' FROM categorias WHERE nombre = 'Alojamiento Turístico' AND tipo = 'turismo'
UNION ALL
  SELECT id, 'Lodge Ecológico' FROM categorias WHERE nombre = 'Alojamiento Turístico' AND tipo = 'turismo'
UNION ALL
  SELECT id, 'Casa Rural (Turismo Rural)' FROM categorias WHERE nombre = 'Alojamiento Turístico' AND tipo = 'turismo'
UNION ALL
  SELECT id, 'Otros' FROM categorias WHERE nombre = 'Alojamiento Turístico' AND tipo = 'turismo';

-- Noche y Vida Social (turismo)
INSERT INTO subcategorias (categoria_id, nombre)
  SELECT id, 'Bares con Vista al Lago' FROM categorias WHERE nombre = 'Noche y Vida Social' AND tipo = 'turismo'
UNION ALL
  SELECT id, 'Cervecerías Artesanales con Show' FROM categorias WHERE nombre = 'Noche y Vida Social' AND tipo = 'turismo'
UNION ALL
  SELECT id, 'Eventos en Vivo (Música, Folklore)' FROM categorias WHERE nombre = 'Noche y Vida Social' AND tipo = 'turismo'
UNION ALL
  SELECT id, 'Discotecas y Boliches' FROM categorias WHERE nombre = 'Noche y Vida Social' AND tipo = 'turismo'
UNION ALL
  SELECT id, 'Cenas con Espectáculo' FROM categorias WHERE nombre = 'Noche y Vida Social' AND tipo = 'turismo'
UNION ALL
  SELECT id, 'Observación Nocturna de Estrellas' FROM categorias WHERE nombre = 'Noche y Vida Social' AND tipo = 'turismo'
UNION ALL
  SELECT id, 'Fogones y Asados Nocturnos' FROM categorias WHERE nombre = 'Noche y Vida Social' AND tipo = 'turismo'
UNION ALL
  SELECT id, 'Otros' FROM categorias WHERE nombre = 'Noche y Vida Social' AND tipo = 'turismo';

-- TOTAL: 64 categorías · 490 subcategorías
SELECT CONCAT('Categorías: ', COUNT(*)) as resumen FROM categorias;
SELECT CONCAT('Subcategorías: ', COUNT(*)) as resumen FROM subcategorias;