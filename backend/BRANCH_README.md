# Branch: `feature/db-schema-v2` — Migración BD Fase 1

> **Estado:** En desarrollo · **Base:** `main` · **Fecha de inicio:** 2026-04-13

## ¿Qué hace este branch?

Implementa la **Fase 1 de la migración del modelo de datos** de Solo a un Click, con dos objetivos principales:

1. **Unificar `businesses` + `turismo_negocios`** en una sola tabla con campo `tipo='general'|'turismo'`
2. **Soft delete en `listings`** — reemplaza `DELETE FROM` por `deleted_at = NOW()`

Los cambios son **100% aditivos y retrocompatibles**: el frontend actual no requiere ninguna modificación.

---

## Archivos modificados / creados

### SQL (Migraciones)
| Archivo | Propósito |
|---------|-----------|
| `migrations/000_schema_base.sql` | Schema completo para crear la BD desde cero (prod o testing) |
| `migrations/001_indices_y_foreign_keys.sql` | Índices y FKs (existente, sin cambios) |
| `migrations/002_fase1_businesses_unificado.sql` | **Migración Fase 1** — aplica sobre BD existente |
| `migrations/seed_test.sql` | Datos de prueba para entorno de testing |

### Backend (Rutas)
| Archivo | Cambio |
|---------|--------|
| `routes/turismo.js` | Redirige de `turismo_negocios` → `businesses WHERE tipo='turismo'` |
| `routes/business.js` | Agrega soporte para `ubicacion`, `tipo='general'`, y `parseHorarios()` |
| `routes/listings.js` | Soft delete: `DELETE FROM` → `UPDATE SET deleted_at=NOW()` + filtro en GET |

### Testing
| Archivo | Propósito |
|---------|-----------|
| `.env.test.example` | Template de variables de entorno para testing |
| `jest.config.js` | Configuración de Jest |
| `__tests__/setup.js` | Setup global: carga `.env.test`, protege contra BD de prod |
| `__tests__/teardown.js` | Cierra el pool MySQL al finalizar |
| `__tests__/business.test.js` | Tests de integración para businesses unificado |
| `__tests__/listings.test.js` | Tests de integración para soft delete |

---

## Setup del entorno de testing

### Paso 1 — Crear la BD de testing en MySQL

```bash
mysql -u root -p -e "CREATE DATABASE soloaunclick_test CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
```

### Paso 2 — Cargar el schema

```bash
mysql -u root -p soloaunclick_test < backend/migrations/000_schema_base.sql
```

### Paso 3 — Cargar datos de prueba (seed)

```bash
mysql -u root -p soloaunclick_test < backend/migrations/seed_test.sql
```

### Paso 4 — Configurar variables de entorno

```bash
cd backend
cp .env.test.example .env.test
# Editar .env.test con tus credenciales MySQL locales
```

El `.env.test` mínimo necesario:
```env
DB_HOST=localhost
DB_USER=root
DB_PASS=tu_password
DB_NAME=soloaunclick_test
JWT_SECRET=test_jwt_secret_32chars_minimo
PORT=3001
NODE_ENV=test
```

### Paso 5 — Ejecutar los tests

```bash
cd backend
npm test
```

---

## Migrar una BD existente (producción o staging)

Para aplicar los cambios de Fase 1 sobre una BD ya existente (con datos reales), ejecutar **solo** el script de migración incremental:

```bash
mysql -u root -p soloaunclick < backend/migrations/002_fase1_businesses_unificado.sql
```

Este script es **idempotente** (seguro de ejecutar más de una vez) y **no destruye datos**.

### Qué hace la migración sobre la BD existente:
1. Agrega columnas `tipo`, `ubicacion`, `activo` a `businesses`
2. Cambia `horarios` de TEXT a JSON nativo
3. Migra datos de `turismo_negocios` → `businesses` con `tipo='turismo'`
4. Agrega columna `deleted_at` a `listings`
5. Muestra un resumen de verificación al finalizar

---

## Qué NO cambia (retrocompatibilidad)

- Todos los endpoints REST tienen la **misma URL y el mismo shape de respuesta**
- El frontend no requiere ningún cambio
- La tabla `turismo_negocios` se mantiene intacta (no se borra)
- Los listings eliminados físicamente antes de este branch se quedan como están

---

## Pruebas de regresión manual

Antes de hacer merge, verificar manualmente:

- [ ] Login de usuario general funciona
- [ ] Login de usuario turismo funciona
- [ ] `GET /api/v1/business/public/1` retorna negocio con horarios como objeto
- [ ] `GET /api/v1/turismo/public` retorna solo negocios turismo
- [ ] `DELETE /api/v1/listings/:id` ya no borra físicamente (verificar en BD)
- [ ] La tienda pública no muestra listings eliminados
- [ ] `POST /api/v1/turismo` crea en `businesses` con `tipo='turismo'`

---

## Próxima fase (Fase 2)

- FK real en `listings.categoria_id` → `categorias`
- Tipo JSON nativo para `imagenes` en turismo_tours
- Tours como tipo de listing (`tipo='tour'` en tabla `listings`)

---

*Documentado el 2026-04-13 · Branch: feature/db-schema-v2*
