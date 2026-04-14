module.exports = async () => {
  // Cerrar conexiones de pool para que Jest pueda terminar limpiamente
  try {
    const pool = require('../db')
    await pool.end()
  } catch (e) {
    // pool ya cerrado o no inicializado
  }
}
