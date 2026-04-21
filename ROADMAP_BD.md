# Roadmap de Base de Datos — Solo a un Click

**Fecha:** 19 de Abril 2026
**Branch:** `feature/db-schema-v2`
**Estado:** Plan de convergencia homologado contra código real.

> 🔄 Sustituye a `PROPUESTA_nueva_estructura_BD.md` (16-abr). El plan original asumía un estado que no se correspondía con la realidad del código. Este roadmap parte del estado actual verificado.

---

## Principio rector

> **Documentar lo que hace el código. Cambiar el código solo si el cambio aporta valor medible.**

No se refactoriza por elegancia arquitectónica. Cada ítem del roadmap justifica su coste.

---

## Sprint 1 — Limpieza inmediata (bajo riesgo, alto retorno)

Ejecutable en el branch actual `feature/db-schema-v2`.

### S1.1 — DROP `listing_images`

**Qué:** Eliminar tabla muerta.
**Por qué:** 0 filas, 0 referencias en el código, 0 mención en docs válidos. Solo genera confusión.
**SQL:**
```sql
DROP TABLE IF EXISTS listing_images;
```
**Riesgo:** Nulo.
**Validación:** `grep -r "listing_images" backend/ src/` → debe devolver 0 resultados.

---

### S1.2 — Eliminar FK dual en `turismo_*`

**Qué:** Cada tabla tiene 2 FKs en `user_id`. La FK hacia `businesses.user_id` es redundante y confunde.
**Por qué:** El código nunca la consulta. `businesses.user_id` no es ni siquiera PK, por lo que la FK es semánticamente débil.
**SQL:**
```sql
-- Identificar nombres de constraints
SELECT CONSTRAINT_NAME FROM information_schema.KEY_COLUMN_USAGE
WHERE TABLE_SCHEMA='soloaunclick'
  AND TABLE_NAME IN ('turismo_tours','turismo_portada','turismo_pagina')
  AND REFERENCED_TABLE_NAME='businesses';

-- Luego:
ALTER TABLE turismo_tours DROP FOREIGN KEY <nombre_constraint>;
ALTER TABLE turismo_portada DROP FOREIGN KEY <nombre_constraint>;
ALTER TABLE turismo_pagina DROP FOREIGN KEY <nombre_constraint>;
```
**Riesgo:** Bajo. Solo elimina la FK, no la columna.

---

### S1.3 — Documentar tablas de auth faltantes

**Qué:** Agregar `refresh_tokens` y `mfa_pending_tokens` al diagrama oficial.
**Por qué:** Ya están en producción y activas. No documentarlas rompe la confianza del esquema.
**Archivo:** `diagrama_BD_v2.md` (ya incluye estas tablas).

---

## Sprint 2 — Normalización de categorías (mediano plazo)

### S2.1 — Migrar frontend a `categoria_id` / `subcategoria_id`

**Qué:** Reemplazar uso de `categoria` (varchar) por `categoria_id` (FK) en todos los componentes de `src/`.
**Por qué:**
- Integridad referencial (no se pueden tipear categorías inexistentes).
- Performance de queries (join por índice vs. WHERE varchar).
- Permite renombrar una categoría sin actualizar todas las filas.

**Impacto:** Frontend (selects, filtros, formularios), ~8-12 componentes.
**Backend:** Ya soporta ambos campos — no requiere cambio inmediato.

### S2.2 — DROP columnas varchar `categoria` / `subcategoria`

**Precondición:** S2.1 completado + 2 semanas de observación en producción sin errores.
**SQL:**
```sql
ALTER TABLE listings DROP COLUMN categoria;
ALTER TABLE listings DROP COLUMN subcategoria;
```
**Riesgo:** Medio. Requiere validación exhaustiva.

---

## Sprint 3 — Migración `user_id` → `business_id` (pospuesto, justificado)

### Justificación del aplazamiento

La propuesta original (abril 16) planteaba este cambio como urgente. Revisado con el código real:

| Argumento a favor | Realidad |
|---|---|
| "Un usuario podría tener 2 negocios" | Regla actual: 1 usuario = 1 business (enforced en `auth.js` y `business.js`). No hay ticket ni roadmap de producto para cambiar esto. |
| "El negocio es el dueño conceptual" | Correcto conceptualmente, pero ningún endpoint ni UI requiere este cambio para funcionar mejor. |
| "Escalar a franquicias" | No está en el roadmap de producto 2026. |

**Coste estimado del refactor:**
- Migración SQL de 5 tablas con datos en producción (riesgo real de corrupción).
- Reescritura de ~20 endpoints del backend.
- Reescritura de ~15 componentes frontend.
- Tests de regresión completos.

**Veredicto:** Pospuesto hasta que exista un requerimiento de producto concreto que lo justifique. Mantener el diseño actual `user_id` es **óptimo por simplicidad**.

### Si eventualmente se ejecuta, este es el plan

1. Agregar columna `business_id` nullable en las 5 tablas.
2. Backfill: `UPDATE listings l JOIN businesses b ON l.user_id=b.user_id SET l.business_id=b.id`.
3. Refactor backend (endpoint por endpoint, con tests).
4. Refactor frontend (puede quedar transparente si backend mantiene el contrato).
5. Drop `user_id` en las 5 tablas.

---

## Sprint 4 — Consolidación final (opcional, 2027+)

- Evaluar si `turismo_*` debería usar tabla `media` como el resto. Hoy el patrón JSON es óptimo para arrays pequeños con metadata de crop — no hay razón técnica para cambiarlo.
- Evaluar compresión/archivo de `analytics` y `page_visits` (crecen linealmente).

---

## Resumen ejecutivo para dirección

| Sprint | Riesgo | Beneficio | Esfuerzo | Prioridad |
|---|---|---|---|---|
| S1 — Limpieza | Muy bajo | Docs coherentes, esquema más limpio | 1 día | 🔴 Alta |
| S2 — Categorías FK | Bajo | Integridad referencial, mejor UX de filtros | 1-2 semanas | 🟡 Media |
| S3 — business_id | Alto | Solo si hay requerimiento de negocio | 1 mes | ⚪ Pospuesto |
| S4 — Consolidación | Bajo | Mantenibilidad | — | ⚪ Backlog |

---

## Qué NO está en el roadmap (decisiones explícitas)

- ❌ **No consolidar imágenes de turismo en `media`.** El patrón JSON actual es intencional y óptimo para arrays pequeños con metadata (crop).
- ❌ **No migrar `user_id → business_id` ahora.** No hay requerimiento de producto que lo justifique.
- ❌ **No agregar soft delete a tablas que no lo necesitan** (analytics, page_visits, site_visits, user_sessions, refresh_tokens — son logs inmutables).

---

*Roadmap homologado contra: BD real de producción, backend `backend/routes/*.js`, frontend `src/**/*.jsx`. Verificación: 19-abr-2026 22:30 GMT-4.*
