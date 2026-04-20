-- Fix site_visits: rename visitor_ip -> ip, add pagina y user_agent
-- Aplicado en VPS 2026-04-20. Requerido por servidor.js POST /visita

ALTER TABLE site_visits
  CHANGE COLUMN visitor_ip ip VARCHAR(50) NULL,
  ADD COLUMN pagina VARCHAR(100) NULL AFTER ip,
  ADD COLUMN user_agent VARCHAR(255) NULL AFTER pagina;
