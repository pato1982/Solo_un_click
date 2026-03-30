-- ============================================
-- Migración 001: Índices y Foreign Keys
-- Proyecto: Solo a un Click
-- Fecha: 2026-03-30
-- ============================================
-- INSTRUCCIONES: Ejecutar en el servidor MySQL
-- mysql -u root -p soloaunclick < 001_indices_y_foreign_keys.sql
-- ============================================

-- Usar IF NOT EXISTS donde sea posible para que sea idempotente

-- =====================
-- 1. ÍNDICES
-- =====================

-- users
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_plan_id ON users(plan_id);
CREATE INDEX idx_users_activo ON users(activo);

-- listings (tabla más consultada)
CREATE INDEX idx_listings_user_id ON listings(user_id);
CREATE INDEX idx_listings_activo ON listings(activo);
CREATE INDEX idx_listings_tipo ON listings(tipo);
CREATE INDEX idx_listings_user_carousel ON listings(user_id, carousel_posicion);
CREATE INDEX idx_listings_user_banner ON listings(user_id, banner_orden);

-- listing_images
CREATE INDEX idx_listing_images_listing_id ON listing_images(listing_id);

-- listing_sizes
CREATE INDEX idx_listing_sizes_listing_id ON listing_sizes(listing_id);

-- listing_dimensions
CREATE INDEX idx_listing_dimensions_listing_id ON listing_dimensions(listing_id);

-- carousels
CREATE INDEX idx_carousels_user_id ON carousels(user_id);
CREATE INDEX idx_carousels_user_posicion ON carousels(user_id, posicion);

-- carousel_images
CREATE INDEX idx_carousel_images_carousel_id ON carousel_images(carousel_id);

-- businesses
CREATE INDEX idx_businesses_user_id ON businesses(user_id);

-- turismo
CREATE INDEX idx_turismo_tours_user_id ON turismo_tours(user_id);
CREATE INDEX idx_turismo_portada_user_id ON turismo_portada(user_id);
CREATE INDEX idx_turismo_pagina_user_id ON turismo_pagina(user_id);

-- analytics
CREATE INDEX idx_analytics_user_id ON analytics(user_id);
CREATE INDEX idx_analytics_listing_id ON analytics(listing_id);
CREATE INDEX idx_analytics_created_at ON analytics(created_at);

-- page_visits
CREATE INDEX idx_page_visits_user_id ON page_visits(user_id);
CREATE INDEX idx_page_visits_created_at ON page_visits(created_at);

-- site_visits
CREATE INDEX idx_site_visits_created_at ON site_visits(created_at);

-- user_sessions
CREATE INDEX idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX idx_user_sessions_created_at ON user_sessions(created_at);

-- activity_log
CREATE INDEX idx_activity_log_user_id ON activity_log(user_id);
CREATE INDEX idx_activity_log_accion ON activity_log(accion);

-- password_resets
CREATE INDEX idx_password_resets_token ON password_resets(token);
CREATE INDEX idx_password_resets_user_id ON password_resets(user_id);

-- subcategorias
CREATE INDEX idx_subcategorias_categoria_id ON subcategorias(categoria_id);

-- categorias
CREATE INDEX idx_categorias_tipo ON categorias(tipo);

-- eventos
CREATE INDEX idx_eventos_categoria_evento_id ON eventos(categoria_evento_id);
CREATE INDEX idx_eventos_activo ON eventos(activo);

-- locales_barrio
CREATE INDEX idx_locales_barrio_categoria_id ON locales_barrio(categoria_barrio_id);
CREATE INDEX idx_locales_barrio_activo ON locales_barrio(activo);

-- =====================
-- 2. FOREIGN KEYS
-- =====================

-- users -> plans
ALTER TABLE users
  ADD CONSTRAINT fk_users_plan_id
  FOREIGN KEY (plan_id) REFERENCES plans(id);

-- listings -> users
ALTER TABLE listings
  ADD CONSTRAINT fk_listings_user_id
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

-- listing_images -> listings
ALTER TABLE listing_images
  ADD CONSTRAINT fk_listing_images_listing_id
  FOREIGN KEY (listing_id) REFERENCES listings(id) ON DELETE CASCADE;

-- listing_sizes -> listings
ALTER TABLE listing_sizes
  ADD CONSTRAINT fk_listing_sizes_listing_id
  FOREIGN KEY (listing_id) REFERENCES listings(id) ON DELETE CASCADE;

-- listing_dimensions -> listings
ALTER TABLE listing_dimensions
  ADD CONSTRAINT fk_listing_dimensions_listing_id
  FOREIGN KEY (listing_id) REFERENCES listings(id) ON DELETE CASCADE;

-- carousels -> users
ALTER TABLE carousels
  ADD CONSTRAINT fk_carousels_user_id
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

-- carousel_images -> carousels
ALTER TABLE carousel_images
  ADD CONSTRAINT fk_carousel_images_carousel_id
  FOREIGN KEY (carousel_id) REFERENCES carousels(id) ON DELETE CASCADE;

-- businesses -> users
ALTER TABLE businesses
  ADD CONSTRAINT fk_businesses_user_id
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

-- turismo_tours -> users
ALTER TABLE turismo_tours
  ADD CONSTRAINT fk_turismo_tours_user_id
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

-- turismo_portada -> users
ALTER TABLE turismo_portada
  ADD CONSTRAINT fk_turismo_portada_user_id
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

-- turismo_pagina -> users
ALTER TABLE turismo_pagina
  ADD CONSTRAINT fk_turismo_pagina_user_id
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

-- subcategorias -> categorias
ALTER TABLE subcategorias
  ADD CONSTRAINT fk_subcategorias_categoria_id
  FOREIGN KEY (categoria_id) REFERENCES categorias(id) ON DELETE CASCADE;

-- eventos -> categorias_evento
ALTER TABLE eventos
  ADD CONSTRAINT fk_eventos_categoria_evento_id
  FOREIGN KEY (categoria_evento_id) REFERENCES categorias_evento(id);

-- locales_barrio -> categorias_barrio
ALTER TABLE locales_barrio
  ADD CONSTRAINT fk_locales_barrio_categoria_id
  FOREIGN KEY (categoria_barrio_id) REFERENCES categorias_barrio(id);

-- analytics -> users
ALTER TABLE analytics
  ADD CONSTRAINT fk_analytics_user_id
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

-- page_visits -> users
ALTER TABLE page_visits
  ADD CONSTRAINT fk_page_visits_user_id
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

-- user_sessions -> users
ALTER TABLE user_sessions
  ADD CONSTRAINT fk_user_sessions_user_id
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

-- activity_log -> users
ALTER TABLE activity_log
  ADD CONSTRAINT fk_activity_log_user_id
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

-- password_resets -> users
ALTER TABLE password_resets
  ADD CONSTRAINT fk_password_resets_user_id
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
