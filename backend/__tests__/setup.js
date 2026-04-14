// Cargar variables de entorno de testing ANTES de cualquier require
const path = require('path')
require('dotenv').config({ path: path.join(__dirname, '..', '.env.test') })

// Verificar que estamos apuntando a la BD de testing
if (!process.env.DB_NAME || !process.env.DB_NAME.includes('test')) {
  throw new Error('SEGURIDAD: DB_NAME debe contener "test". No ejecutar tests contra producción.')
}

module.exports = async () => {
  // Aquí se puede agregar setup adicional (ej: crear tablas si no existen)
  console.log(`\n🧪 Tests corriendo contra BD: ${process.env.DB_NAME}`)
}
