import { useState, useEffect } from 'react'
import { Navigate } from 'react-router-dom'

const API = import.meta.env.VITE_API || ''

export default function ProtectedRoute({ children }) {
  const [status, setStatus] = useState('checking')

  useEffect(() => {
    async function checkAuth() {
      try {
        const res = await fetch(`${API}/api/v1/auth/me`, { credentials: 'include' })
        if (res.ok) {
          setStatus('ok')
          return
        }
        // access_token expirado → intentar refresh
        const refreshRes = await fetch(`${API}/api/v1/auth/refresh`, {
          method: 'POST',
          credentials: 'include',
        })
        setStatus(refreshRes.ok ? 'ok' : 'redirect')
      } catch {
        setStatus('redirect')
      }
    }
    checkAuth()
  }, [])

  if (status === 'checking') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-slate-400 text-sm">Verificando sesión...</div>
      </div>
    )
  }

  if (status === 'redirect') return <Navigate to="/" replace />

  return children
}
