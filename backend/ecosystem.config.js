module.exports = {
  apps: [{
    name: "soloaunclick",
    script: "server.js",
    cwd: "/var/www/soloaunclick/backend",
    instances: 1,
    exec_mode: "fork",
    env_production: {
      DEV_MODE: "true",
      NODE_ENV: "production",
      PORT: 3001,
      DB_HOST: "localhost",
      DB_USER: "soloaunclick",
      DB_PASS: "SoloUnClick2026",
      DB_NAME: "soloaunclick",
      JWT_SECRET: "soloaunclick_jwt_2026_villarrica_key_change_this",
      SMTP_HOST: "smtp.gmail.com",
      SMTP_PORT: "587",
      SMTP_USER: "",
      SMTP_PASS: "",
      SMTP_FROM: "noreply@soloaunclick.cl",
      SITE_URL: "https://soloaunclick.cl"
    }
  }]
}
