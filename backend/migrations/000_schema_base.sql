-- ============================================================
-- Migración 000: Schema Base Completo
-- Proyecto: Solo a un Click
-- Fecha: 2026-04-13
-- Uso: Crear BD desde cero (producción o testing)
-- mysql -u root -p < 000_schema_base.sql
-- ============================================================

SET FOREIGN_KEY_CHECKS = 0;

-- =====================
-- PLANES
-- =====================
CREATE TABLE IF NOT EXISTS plans (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  max_listings INT NOT NULL DEFAULT 10,
  tiene_pagina TINYINT(1) NOT NULL DEFAULT 0,
  tiene_destacados TINYINT(1) NOT NULL DEFAULT 0,
  tiene_estadisticas TINYINT(1) NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =====================
-- USUARIOS
-- =====================
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  plan_id INT NOT NULL DEFAULT 1,
  tipo_cuenta VARCHAR(20) NOT NULL DEFAULT 'general',
  nombre VARCHAR(150) NOT NULL,
  email VARCHAR(191) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  telefono VARCHAR(30) NULL,
  comuna VARCHAR(100) NULL,
  direccion VARCHAR(255) NULL,
  vende_productos TINYINT(1) NOT NULL DEFAULT 0,
  ofrece_servicios TINYINT(1) NOT NULL DEFAULT 0,
  ofrece_arriendos TINYINT(1) NOT NULL DEFAULT 0,
  rol VARCHAR(50) NULL DEFAULT 'user',
  activo TINYINT(1) NOT NULL DEFAULT 1,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_users_plan_id FOREIGN KEY (plan_id) REFERENCES plans(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =====================
-- NEGOCIOS (tabla unificada — Fase 1)
-- =====================
CREATE TABLE IF NOT EXISTS businesses (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL UNIQUE,
  nombre_negocio VARCHAR(200) NULL,
  slogan VARCHAR(255) NULL,
  descripcion TEXT NULL,
  direccion VARCHAR(255) NULL,
  ubicacion VARCHAR(255) NULL,           -- Nuevo en Fase 1 (antes solo en turismo_negocios)
  whatsapp VARCHAR(50) NULL,
  telefono VARCHAR(50) NULL,
  correo VARCHAR(191) NULL,
  facebook VARCHAR(255) NULL,
  instagram VARCHAR(255) NULL,
  horarios JSON NULL,                    -- Nuevo en Fase 1: tipo JSON nativo (antes TEXT)
  tipo VARCHAR(20) NOT NULL DEFAULT 'general',  -- Nuevo en Fase 1: 'general' | 'turismo'
  activo TINYINT(1) NOT NULL DEFAULT 1,  -- Nuevo en Fase 1 (antes solo en turismo_negocios)
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_businesses_user_id FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =====================
-- LISTINGS
-- =====================
CREATE TABLE IF NOT EXISTS listings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  business_id INT NOT NULL,
  tipo VARCHAR(30) NOT NULL,
  seccion VARCHAR(50) NOT NULL DEFAULT 'destacados',
  nombre VARCHAR(255) NOT NULL,
  descripcion TEXT NULL,
  precio DECIMAL(12,2) NOT NULL DEFAULT 0,
  precio_original DECIMAL(12,2) NULL,
  categoria VARCHAR(150) NULL,
  subcategoria VARCHAR(150) NULL,
  badge VARCHAR(100) NULL,
  genero VARCHAR(50) NULL,
  carousel_posicion INT NULL,
  carousel_orden INT NULL,
  banner_orden INT NULL,
  banner_pos_x DECIMAL(6,2) NULL DEFAULT 50,
  banner_pos_y DECIMAL(6,2) NULL DEFAULT 50,
  banner_scale DECIMAL(5,2) NULL DEFAULT 1,
  activo TINYINT(1) NOT NULL DEFAULT 1,
  deleted_at TIMESTAMP NULL DEFAULT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_listings_business_id FOREIGN KEY (business_id) REFERENCES businesses(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =====================
-- LISTING IMAGES
-- =====================
CREATE TABLE IF NOT EXISTS listing_images (
  id INT AUTO_INCREMENT PRIMARY KEY,
  listing_id INT NOT NULL,
  url VARCHAR(500) NOT NULL,
  CONSTRAINT fk_listing_images_listing_id FOREIGN KEY (listing_id) REFERENCES listings(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =====================
-- LISTING SIZES
-- =====================
CREATE TABLE IF NOT EXISTS listing_sizes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  listing_id INT NOT NULL,
  tipo_talla VARCHAR(50) NOT NULL,
  valor VARCHAR(50) NOT NULL,
  CONSTRAINT fk_listing_sizes_listing_id FOREIGN KEY (listing_id) REFERENCES listings(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =====================
-- LISTING DIMENSIONS
-- =====================
CREATE TABLE IF NOT EXISTS listing_dimensions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  listing_id INT NOT NULL,
  alto DECIMAL(10,2) NULL,
  ancho DECIMAL(10,2) NULL,
  profundidad DECIMAL(10,2) NULL,
  CONSTRAINT fk_listing_dimensions_listing_id FOREIGN KEY (listing_id) REFERENCES listings(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =====================
-- CAROUSELS
-- =====================
CREATE TABLE IF NOT EXISTS carousels (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  posicion INT NOT NULL,
  nombre VARCHAR(150) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_carousels_user_id FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =====================
-- CAROUSEL IMAGES
-- =====================
CREATE TABLE IF NOT EXISTS carousel_images (
  id INT AUTO_INCREMENT PRIMARY KEY,
  carousel_id INT NOT NULL,
  imagen_url VARCHAR(500) NOT NULL,
  orden INT NOT NULL DEFAULT 0,
  CONSTRAINT fk_carousel_images_carousel_id FOREIGN KEY (carousel_id) REFERENCES carousels(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =====================
-- TURISMO NEGOCIOS (legacy — mantenida por compatibilidad, deprecada en Fase 1)
-- Los datos nuevos van a businesses con tipo='turismo'
-- =====================
CREATE TABLE IF NOT EXISTS turismo_negocios (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL UNIQUE,
  nombre VARCHAR(200) NULL,
  descripcion TEXT NULL,
  direccion VARCHAR(255) NULL,
  ubicacion VARCHAR(255) NULL,
  whatsapp VARCHAR(50) NULL,
  telefono VARCHAR(50) NULL,
  correo VARCHAR(191) NULL,
  facebook VARCHAR(255) NULL,
  instagram VARCHAR(255) NULL,
  horarios TEXT NULL,
  activo TINYINT(1) NOT NULL DEFAULT 1,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_turismo_negocios_user_id FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =====================
-- TURISMO TOURS
-- =====================
CREATE TABLE IF NOT EXISTS turismo_tours (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  nombre VARCHAR(255) NOT NULL,
  categoria VARCHAR(150) NULL,
  ubicacion VARCHAR(255) NULL,
  detalle TEXT NULL,
  precio DECIMAL(12,2) NULL,
  precio_antes DECIMAL(12,2) NULL,
  imagen_principal INT NULL,
  imagenes TEXT NULL,
  imagenes_crop TEXT NULL,
  activo TINYINT(1) NOT NULL DEFAULT 1,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_turismo_tours_user_id FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =====================
-- TURISMO PORTADA
-- =====================
CREATE TABLE IF NOT EXISTS turismo_portada (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL UNIQUE,
  nombre VARCHAR(200) NULL,
  descripcion TEXT NULL,
  imagenes TEXT NULL,
  categorias TEXT NULL,
  imagenes_crop TEXT NULL,
  activo TINYINT(1) NOT NULL DEFAULT 1,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_turismo_portada_user_id FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =====================
-- TURISMO PAGINA
-- =====================
CREATE TABLE IF NOT EXISTS turismo_pagina (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL UNIQUE,
  titulo_superior VARCHAR(255) NULL,
  texto_superior TEXT NULL,
  imagen_superior VARCHAR(500) NULL,
  titulo_inferior VARCHAR(255) NULL,
  texto_inferior TEXT NULL,
  imagen_inferior VARCHAR(500) NULL,
  crop_superior TEXT NULL,
  crop_inferior TEXT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_turismo_pagina_user_id FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =====================
-- CATEGORIAS
-- =====================
CREATE TABLE IF NOT EXISTS categorias (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(150) NOT NULL,
  tipo VARCHAR(30) NOT NULL,
  icono VARCHAR(100) NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =====================
-- SUBCATEGORIAS
-- =====================
CREATE TABLE IF NOT EXISTS subcategorias (
  id INT AUTO_INCREMENT PRIMARY KEY,
  categoria_id INT NOT NULL,
  nombre VARCHAR(150) NOT NULL,
  CONSTRAINT fk_subcategorias_categoria_id FOREIGN KEY (categoria_id) REFERENCES categorias(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =====================
-- CATEGORIAS EVENTO
-- =====================
CREATE TABLE IF NOT EXISTS categorias_evento (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(150) NOT NULL,
  icono VARCHAR(100) NULL,
  orden INT NULL DEFAULT 0,
  activo TINYINT(1) NOT NULL DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =====================
-- EVENTOS
-- =====================
CREATE TABLE IF NOT EXISTS eventos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  titulo VARCHAR(255) NOT NULL,
  imagen VARCHAR(500) NULL,
  fecha VARCHAR(50) NULL,
  ubicacion VARCHAR(255) NULL,
  precio VARCHAR(100) NULL,
  categoria_evento_id INT NULL,
  activo TINYINT(1) NOT NULL DEFAULT 1,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_eventos_categoria_evento_id FOREIGN KEY (categoria_evento_id) REFERENCES categorias_evento(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =====================
-- CATEGORIAS BARRIO
-- =====================
CREATE TABLE IF NOT EXISTS categorias_barrio (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(150) NOT NULL,
  icono VARCHAR(100) NULL,
  orden INT NULL DEFAULT 0,
  activo TINYINT(1) NOT NULL DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =====================
-- LOCALES BARRIO
-- =====================
CREATE TABLE IF NOT EXISTS locales_barrio (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(255) NOT NULL,
  direccion VARCHAR(255) NULL,
  categoria_barrio_id INT NULL,
  imagen VARCHAR(500) NULL,
  orden INT NULL DEFAULT 0,
  activo TINYINT(1) NOT NULL DEFAULT 1,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_locales_barrio_categoria_id FOREIGN KEY (categoria_barrio_id) REFERENCES categorias_barrio(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =====================
-- ANALYTICS
-- =====================
CREATE TABLE IF NOT EXISTS analytics (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  event_type VARCHAR(50) NOT NULL,
  listing_id INT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_analytics_user_id FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =====================
-- PAGE VISITS
-- =====================
CREATE TABLE IF NOT EXISTS page_visits (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  visitor_ip VARCHAR(50) NOT NULL,
  pagina VARCHAR(100) NOT NULL DEFAULT 'tienda',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_page_visits_user_id FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =====================
-- SITE VISITS
-- =====================
CREATE TABLE IF NOT EXISTS site_visits (
  id INT AUTO_INCREMENT PRIMARY KEY,
  ip VARCHAR(50) NOT NULL,
  pagina VARCHAR(150) NULL,
  user_agent VARCHAR(500) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =====================
-- USER SESSIONS
-- =====================
CREATE TABLE IF NOT EXISTS user_sessions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  ip VARCHAR(50) NOT NULL,
  user_agent VARCHAR(500) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_user_sessions_user_id FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =====================
-- ACTIVITY LOG
-- =====================
CREATE TABLE IF NOT EXISTS activity_log (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  accion VARCHAR(50) NOT NULL,
  entity_type VARCHAR(50) NULL,
  entity_id INT NULL,
  detalles JSON NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_activity_log_user_id FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =====================
-- PASSWORD RESETS
-- =====================
CREATE TABLE IF NOT EXISTS password_resets (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  token VARCHAR(255) NOT NULL UNIQUE,
  usado TINYINT(1) NOT NULL DEFAULT 0,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_password_resets_user_id FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =====================
-- ÍNDICES
-- =====================
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_plan_id ON users(plan_id);
CREATE INDEX idx_users_activo ON users(activo);

CREATE INDEX idx_businesses_user_id ON businesses(user_id);
CREATE INDEX idx_businesses_tipo ON businesses(tipo);

CREATE INDEX idx_listings_business_id ON listings(business_id);
CREATE INDEX idx_listings_activo ON listings(activo);
CREATE INDEX idx_listings_tipo ON listings(tipo);
CREATE INDEX idx_listings_deleted ON listings(deleted_at);
CREATE INDEX idx_listings_business_carousel ON listings(business_id, carousel_posicion);
CREATE INDEX idx_listings_business_banner ON listings(business_id, banner_orden);

CREATE INDEX idx_listing_images_listing_id ON listing_images(listing_id);
CREATE INDEX idx_listing_sizes_listing_id ON listing_sizes(listing_id);
CREATE INDEX idx_listing_dimensions_listing_id ON listing_dimensions(listing_id);

CREATE INDEX idx_carousels_user_id ON carousels(user_id);
CREATE INDEX idx_carousels_user_posicion ON carousels(user_id, posicion);
CREATE INDEX idx_carousel_images_carousel_id ON carousel_images(carousel_id);

CREATE INDEX idx_turismo_negocios_user_id ON turismo_negocios(user_id);
CREATE INDEX idx_turismo_tours_user_id ON turismo_tours(user_id);
CREATE INDEX idx_turismo_portada_user_id ON turismo_portada(user_id);
CREATE INDEX idx_turismo_pagina_user_id ON turismo_pagina(user_id);

CREATE INDEX idx_categorias_tipo ON categorias(tipo);
CREATE INDEX idx_subcategorias_categoria_id ON subcategorias(categoria_id);
CREATE INDEX idx_eventos_categoria_evento_id ON eventos(categoria_evento_id);
CREATE INDEX idx_eventos_activo ON eventos(activo);
CREATE INDEX idx_locales_barrio_categoria_id ON locales_barrio(categoria_barrio_id);
CREATE INDEX idx_locales_barrio_activo ON locales_barrio(activo);

CREATE INDEX idx_analytics_user_id ON analytics(user_id);
CREATE INDEX idx_analytics_listing_id ON analytics(listing_id);
CREATE INDEX idx_analytics_created_at ON analytics(created_at);
CREATE INDEX idx_page_visits_user_id ON page_visits(user_id);
CREATE INDEX idx_page_visits_created_at ON page_visits(created_at);
CREATE INDEX idx_site_visits_created_at ON site_visits(created_at);
CREATE INDEX idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX idx_user_sessions_created_at ON user_sessions(created_at);
CREATE INDEX idx_activity_log_user_id ON activity_log(user_id);
CREATE INDEX idx_activity_log_accion ON activity_log(accion);
CREATE INDEX idx_password_resets_token ON password_resets(token);
CREATE INDEX idx_password_resets_user_id ON password_resets(user_id);

SET FOREIGN_KEY_CHECKS = 1;
