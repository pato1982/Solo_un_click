module.exports = {
  apps: [{
    name: 'soloaunclick-dev',
    script: 'server.js',
    cwd: '/srv/soloaunclick-dev/backend',
    env: {
      NODE_ENV: 'development',
      DB_HOST: 'localhost',
      DB_USER: 'sac_test',
      DB_PASS: 'SacTest2026!',
      DB_NAME: 'soloaunclick_test',
      JWT_SECRET: 'test_jwt_secret_no_usar_en_produccion_48chars_sac26',
      PORT: '3001',
      LOG_LEVEL: 'warn',
      SITE_URL: 'http://localhost:3001',
      SMTP_HOST: 'localhost',
      SMTP_PORT: '25',
      SMTP_USER: '',
      SMTP_PASS: '',
      SMTP_FROM: 'test@soloaunclick.cl',
      DEV_BYPASS: 'true'
    },
    watch: false,
    max_memory_restart: '200M',
    error_file: '/srv/soloaunclick-dev/backend/logs/pm2-error.log',
    out_file: '/srv/soloaunclick-dev/backend/logs/pm2-out.log'
  }]
}
