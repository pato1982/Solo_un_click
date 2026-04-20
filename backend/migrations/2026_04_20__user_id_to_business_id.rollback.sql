-- ROLLBACK de migración user_id → business_id
-- Ejecutar SOLO si la migración fue aplicada y se detectó un problema.

START TRANSACTION;

ALTER TABLE listings DROP FOREIGN KEY fk_listings_business_id;
ALTER TABLE listings DROP INDEX idx_listings_business_id;
ALTER TABLE listings DROP COLUMN business_id;

ALTER TABLE carousels DROP FOREIGN KEY fk_carousels_business_id;
ALTER TABLE carousels DROP INDEX idx_carousels_business_id;
ALTER TABLE carousels DROP COLUMN business_id;

ALTER TABLE turismo_tours DROP FOREIGN KEY fk_turismo_tours_business_id;
ALTER TABLE turismo_tours DROP INDEX idx_turismo_tours_business_id;
ALTER TABLE turismo_tours DROP COLUMN business_id;

ALTER TABLE turismo_portada DROP FOREIGN KEY fk_turismo_portada_business_id;
ALTER TABLE turismo_portada DROP INDEX uk_turismo_portada_business_id;
ALTER TABLE turismo_portada DROP COLUMN business_id;

ALTER TABLE turismo_pagina DROP FOREIGN KEY fk_turismo_pagina_business_id;
ALTER TABLE turismo_pagina DROP INDEX uk_turismo_pagina_business_id;
ALTER TABLE turismo_pagina DROP COLUMN business_id;

-- COMMIT;
