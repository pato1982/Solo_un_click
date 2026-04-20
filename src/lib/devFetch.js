/**
 * Interceptor de fetch para modo desarrollo.
 * Inyecta el header X-Dev-User-Id en todas las peticiones API
 * cuando Vite está en modo DEV, permitiendo bypass de autenticación.
 */

const API = import.meta.env.VITE_API || ''

export function installDevFetchInterceptor() {
  if (!import.meta.env.DEV) return

  const originalFetch = window.fetch

  window.fetch = function devFetch(...args) {
    const [url, config = {}] = args
    const urlStr = typeof url === 'string' ? url : url instanceof Request ? url.url : ''

    // Solo inyectar header en peticiones a nuestra API
    if (urlStr.includes('/api/')) {
      const userId = localStorage.getItem('dev_user_id')
      if (userId) {
        config.headers = {
          ...config.headers,
          'X-Dev-User-Id': userId,
        }
        return originalFetch(url, config)
      }
    }

    return originalFetch(...args)
  }

  console.log('[DEV] Fetch interceptor instalado — X-Dev-User-Id header inyectado en peticiones API')
}
