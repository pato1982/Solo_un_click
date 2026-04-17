// IMPORTANTE: Los secretos (DB_PASS, JWT_SECRET, SMTP_PASS) NO van aquí.
// Deben estar en /var/www/soloaunclick/backend/.env en el servidor.
// Ver .env.example para la lista completa de variables requeridas.
module.exports = {
  apps: [{
    name: "soloaunclick",
    script: "server.js",
    cwd: "/var/www/soloaunclick/backend",
    instances: 1,
    exec_mode: "fork",
    env_production: {
      NODE_ENV: "production",
      PORT: 3001
    }
  }]
}
