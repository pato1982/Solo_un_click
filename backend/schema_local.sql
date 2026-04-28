-- ============================================================
-- SCHEMA LOCAL — Solo a un Click
-- Uso: mysql -u root -p soloaunclick_dev < schema_local.sql
-- ============================================================

CREATE DATABASE IF NOT EXISTS soloaunclick_dev
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE soloaunclick_dev;

-- ==================== PLANS ====================
CREATE TABLE IF NOT EXISTS plans (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  nombre      VARCHAR(50)     NOT NULL,
  precio      DECIMAL(10,2)   DEFAULT 0,
  max_listings INT            DEFAULT 5,
  descripcion TEXT,
  activo      TINYINT(1)      DEFAULT 1,
  created_at  TIMESTAMP       DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO plans (id, nombre, precio, max_listings, descripcion) VALUES
(1, 'Gratis',   0,     5,   'Plan gratuito con hasta 5 publicaciones'),
(2, 'Normal',   9990,  20,  'Plan normal con hasta 20 publicaciones'),
(3, 'Premium',  19990, 100, 'Plan premium con publicaciones ilimitadas');

-- ==================== USERS ====================
CREATE TABLE IF NOT EXISTS users (
  id                  INT AUTO_INCREMENT PRIMARY KEY,
  plan_id             INT          DEFAULT 1,
  tipo_cuenta         ENUM('general','turismo') DEFAULT 'general',
  nombre              VARCHAR(150) NOT NULL,
  email               VARCHAR(150) NOT NULL UNIQUE,
  password            VARCHAR(255) NOT NULL,
  telefono            VARCHAR(30),
  comuna              VARCHAR(100),
  direccion           VARCHAR(255),
  vende_productos     TINYINT(1)   DEFAULT 0,
  ofrece_servicios    TINYINT(1)   DEFAULT 0,
  ofrece_arriendos    TINYINT(1)   DEFAULT 0,
  activo              TINYINT(1)   DEFAULT 1,
  created_at          TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
  updated_at          TIMESTAMP    DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (plan_id) REFERENCES plans(id)
);

-- Usuario admin de prueba (password: admin123)
INSERT INTO users (plan_id, tipo_cuenta, nombre, email, password, telefono, comuna, activo)
VALUES (3, 'general', 'Admin Local', 'admin@local.cl',
        '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', -- password: password
        '+56912345678', 'Villarrica', 1);

-- ==================== BUSINESSES ====================
CREATE TABLE IF NOT EXISTS businesses (
  id             INT AUTO_INCREMENT PRIMARY KEY,
  user_id        INT          NOT NULL UNIQUE,
  nombre_negocio VARCHAR(150),
  slogan         VARCHAR(255),
  descripcion    TEXT,
  direccion      VARCHAR(255),
  ubicacion      VARCHAR(255),
  whatsapp       VARCHAR(30),
  telefono       VARCHAR(30),
  correo         VARCHAR(150),
  facebook       VARCHAR(255),
  instagram      VARCHAR(255),
  horarios       JSON,
  logo           VARCHAR(500),
  banner         VARCHAR(500),
  activo         TINYINT(1)   DEFAULT 1,
  deleted_at     TIMESTAMP    NULL DEFAULT NULL,
  created_at     TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
  updated_at     TIMESTAMP    DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

INSERT INTO businesses (user_id, nombre_negocio, slogan, descripcion, direccion, whatsapp)
VALUES (1, 'Negocio de Prueba', 'El mejor negocio local', 'Descripción de prueba', 'Av. Principal 123, Villarrica', '+56912345678');

-- ==================== CATEGORIAS ====================
CREATE TABLE IF NOT EXISTS categorias (
  id     INT AUTO_INCREMENT PRIMARY KEY,
  tipo   ENUM('producto','servicio','arriendo') NOT NULL,
  nombre VARCHAR(100) NOT NULL
);

INSERT INTO categorias (tipo, nombre) VALUES
('producto',  'Ropa y Moda'),
('producto',  'Electrónica'),
('producto',  'Hogar y Jardín'),
('producto',  'Deportes'),
('producto',  'Alimentos'),
('producto',  'Juguetes'),
('servicio',  'Construcción'),
('servicio',  'Limpieza'),
('servicio',  'Educación'),
('servicio',  'Salud y Belleza'),
('servicio',  'Tecnología'),
('arriendo',  'Habitación'),
('arriendo',  'Departamento'),
('arriendo',  'Casa'),
('arriendo',  'Local Comercial'),
('arriendo',  'Vehículo');

-- ==================== SUBCATEGORIAS ====================
CREATE TABLE IF NOT EXISTS subcategorias (
  id           INT AUTO_INCREMENT PRIMARY KEY,
  categoria_id INT         NOT NULL,
  nombre       VARCHAR(100) NOT NULL,
  FOREIGN KEY (categoria_id) REFERENCES categorias(id) ON DELETE CASCADE
);

-- ==================== LISTINGS ====================
CREATE TABLE IF NOT EXISTS listings (
  id                INT AUTO_INCREMENT PRIMARY KEY,
  business_id       INT             NOT NULL,
  tipo              ENUM('producto','servicio','arriendo') NOT NULL DEFAULT 'producto',
  seccion           VARCHAR(50),
  nombre            VARCHAR(255)    NOT NULL,
  descripcion       TEXT,
  precio            DECIMAL(12,2),
  precio_original   DECIMAL(12,2),
  categoria         VARCHAR(100),
  subcategoria      VARCHAR(100),
  badge             VARCHAR(50),
  genero            VARCHAR(30),
  carousel_posicion INT,
  carousel_orden    INT,
  banner_orden      INT,
  activo            TINYINT(1)      DEFAULT 1,
  created_at        TIMESTAMP       DEFAULT CURRENT_TIMESTAMP,
  updated_at        TIMESTAMP       DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (business_id) REFERENCES businesses(id) ON DELETE CASCADE
);

-- ==================== LISTING_SIZES ====================
CREATE TABLE IF NOT EXISTS listing_sizes (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  listing_id INT          NOT NULL,
  tipo_talla VARCHAR(50),
  valor      VARCHAR(50),
  FOREIGN KEY (listing_id) REFERENCES listings(id) ON DELETE CASCADE
);

-- ==================== LISTING_DIMENSIONS ====================
CREATE TABLE IF NOT EXISTS listing_dimensions (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  listing_id INT NOT NULL,
  alto       DECIMAL(10,2),
  ancho      DECIMAL(10,2),
  profundidad DECIMAL(10,2),
  FOREIGN KEY (listing_id) REFERENCES listings(id) ON DELETE CASCADE
);

-- ==================== MEDIA (unificada) ====================
CREATE TABLE IF NOT EXISTS media (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  entity_type VARCHAR(50)  NOT NULL,
  entity_id   INT          NOT NULL,
  url         VARCHAR(500) NOT NULL,
  orden       INT          DEFAULT 0,
  created_at  TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_media_entity (entity_type, entity_id)
);

-- ==================== CAROUSELS ====================
CREATE TABLE IF NOT EXISTS carousels (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  user_id    INT          NOT NULL,
  nombre     VARCHAR(150),
  posicion   INT          DEFAULT 0,
  created_at TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ==================== TURISMO ====================
CREATE TABLE IF NOT EXISTS turismo_tours (
  id               INT AUTO_INCREMENT PRIMARY KEY,
  user_id          INT          NOT NULL,
  nombre           VARCHAR(255),
  categoria        VARCHAR(100),
  ubicacion        VARCHAR(255),
  detalle          TEXT,
  precio           DECIMAL(12,2),
  precio_antes     DECIMAL(12,2),
  imagen_principal VARCHAR(500),
  imagenes         JSON,
  imagenes_crop    JSON,
  activo           TINYINT(1)   DEFAULT 1,
  created_at       TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
  updated_at       TIMESTAMP    DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS turismo_portada (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  user_id     INT  NOT NULL UNIQUE,
  nombre      VARCHAR(255),
  descripcion TEXT,
  imagenes    JSON,
  categorias  JSON,
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS turismo_pagina (
  id               INT AUTO_INCREMENT PRIMARY KEY,
  user_id          INT  NOT NULL UNIQUE,
  titulo_superior  VARCHAR(255),
  texto_superior   TEXT,
  imagen_superior  VARCHAR(500),
  titulo_inferior  VARCHAR(255),
  texto_inferior   TEXT,
  imagen_inferior  VARCHAR(500),
  created_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ==================== EVENTOS ====================
CREATE TABLE IF NOT EXISTS categorias_evento (
  id     INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  icono  VARCHAR(100)
);

INSERT INTO categorias_evento (nombre, icono) VALUES
('Música',       'music_note'),
('Gastronomía',  'restaurant'),
('Deporte',      'sports'),
('Cultura',      'theater_comedy'),
('Artesanía',    'palette'),
('Ferias',       'storefront'),
('Familiar',     'family_restroom'),
('Nocturno',     'nightlife'),
('Educación',    'school'),
('Beneficencia', 'volunteer_activism'),
('Naturaleza',   'park'),
('Religioso',    'church');

CREATE TABLE IF NOT EXISTS eventos (
  id                  INT AUTO_INCREMENT PRIMARY KEY,
  titulo              VARCHAR(255)   NOT NULL,
  imagen              VARCHAR(500),
  fecha               VARCHAR(100),
  ubicacion           VARCHAR(255),
  precio              VARCHAR(100),
  categoria_evento_id INT,
  activo              TINYINT(1)     DEFAULT 1,
  imagen_crop         TEXT,
  created_at          TIMESTAMP      DEFAULT CURRENT_TIMESTAMP,
  updated_at          TIMESTAMP      DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (categoria_evento_id) REFERENCES categorias_evento(id)
);

-- ==================== LOCALES ====================
CREATE TABLE IF NOT EXISTS categorias_barrio (
  id     INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL
);

INSERT INTO categorias_barrio (nombre) VALUES
('Restaurante'), ('Cafetería'), ('Tienda'), ('Servicio'),
('Farmacia'), ('Banco'), ('Supermercado'), ('Otro');

CREATE TABLE IF NOT EXISTS locales_barrio (
  id                 INT AUTO_INCREMENT PRIMARY KEY,
  nombre             VARCHAR(255) NOT NULL,
  direccion          VARCHAR(255),
  categoria_barrio_id INT,
  imagen             VARCHAR(500),
  orden              INT          DEFAULT 0,
  activo             TINYINT(1)   DEFAULT 1,
  created_at         TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
  updated_at         TIMESTAMP    DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (categoria_barrio_id) REFERENCES categorias_barrio(id)
);

-- ==================== ANALYTICS ====================
CREATE TABLE IF NOT EXISTS analytics (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  user_id    INT,
  event_type VARCHAR(50),
  listing_id INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS page_visits (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  user_id     INT,
  visitor_ip  VARCHAR(50),
  pagina      VARCHAR(255),
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS site_visits (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  ip         VARCHAR(50),
  pagina     VARCHAR(255),
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS user_sessions (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  user_id    INT,
  ip         VARCHAR(50),
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS activity_log (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  user_id    INT,
  accion     VARCHAR(100),
  detalles   TEXT,
  ip         VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS password_resets (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  user_id    INT,
  token      VARCHAR(255),
  expires_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ==================== ÍNDICES ====================
CREATE INDEX idx_users_email       ON users(email);
CREATE INDEX idx_users_plan_id     ON users(plan_id);
CREATE INDEX idx_listings_business_id ON listings(business_id);
CREATE INDEX idx_listings_activo   ON listings(activo);
CREATE INDEX idx_listings_tipo     ON listings(tipo);
CREATE INDEX idx_eventos_activo    ON eventos(activo);
CREATE INDEX idx_analytics_user_id ON analytics(user_id);

SELECT 'Schema local creado exitosamente ✓' AS resultado;
