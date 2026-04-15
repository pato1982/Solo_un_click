import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

const API = import.meta.env.VITE_API || ''

export default function DevLogin() {
  const navigate = useNavigate()
  const [status, setStatus] = useState('Iniciando sesión de desarrollo...')
  const [error, setError] = useState(null)

  useEffect(() => {
    // Auto-login al montar el componente
    autoLogin('general')
  }, [])

  const autoLogin = async (tipo) => {
    setStatus('Conectando con el servidor...')
    setError(null)
    try {
      const res = await fetch(`${API}/api/v1/auth/dev-auto-login`)
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || `HTTP ${res.status}`)
      }
      const { token, user } = await res.json()

      // Si se pide turismo, forzar tipo_cuenta
      const finalUser = tipo === 'turismo'
        ? { ...user, tipo_cuenta: 'turismo', vende_productos: 0, ofrece_servicios: 0, ofrece_arriendos: 0 }
        : user

      localStorage.setItem('token', token)
      localStorage.setItem('user', JSON.stringify(finalUser))

      setStatus('¡Sesión iniciada! Redirigiendo...')
      setTimeout(() => navigate('/admin'), 500)
    } catch (err) {
      setError(`Error: ${err.message}`)
      setStatus('Falló el auto-login')
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white rounded-2xl shadow-lg p-8 max-w-sm w-full text-center space-y-6">
        <div>
          <span className="material-symbols-outlined text-primary text-4xl">code</span>
          <h1 className="text-lg font-black text-gray-800 mt-2">Dev Login</h1>
          <p className="text-xs text-gray-400 mt-1">Acceso de desarrollo</p>
        </div>

        {!error ? (
          <div className="space-y-3">
            <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
              <svg className="animate-spin h-4 w-4 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
              </svg>
              {status}
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-xs text-red-500">{error}</p>
            <div className="space-y-2">
              <button
                onClick={() => autoLogin('general')}
                className="w-full flex items-center justify-center gap-2 bg-primary text-white font-bold py-3 rounded-lg hover:bg-primary/90 transition-colors"
              >
                <span className="material-symbols-outlined">storefront</span>
                Reintentar como Admin General
              </button>
              <button
                onClick={() => autoLogin('turismo')}
                className="w-full flex items-center justify-center gap-2 bg-teal-600 text-white font-bold py-3 rounded-lg hover:bg-teal-700 transition-colors"
              >
                <span className="material-symbols-outlined">tour</span>
                Reintentar como Admin Turismo
              </button>
            </div>
          </div>
        )}

        <p className="text-[10px] text-gray-300">Solo visible en desarrollo</p>
      </div>
    </div>
  )
}
