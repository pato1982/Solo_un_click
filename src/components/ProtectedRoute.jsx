import { useState, useEffect } from 'react'
import { Navigate } from 'react-router-dom'

const API = import.meta.env.VITE_API || ''

const DEFAULT_DEV_USER = {
  id: 1,
  nombre: 'Dev Programador',
  email: 'dev@local',
  rol: 'programador',
  plan_id: 3,
  tipo_cuenta: 'general',
  vende_productos: 1,
  ofrece_servicios: 1,
  ofrece_arriendos: 1,
}

export default function ProtectedRoute({ children }) {
  // --- Modo Desarrollo: bypass completo ---
  if (import.meta.env.DEV) {
    const [devUser, setDevUser] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
      async function loadDevUser() {
        const savedId = localStorage.getItem('dev_user_id') || ''
        const storedUser = localStorage.getItem('user')

        // Si el id guardado es un perfil mock, usarlo directamente sin consultar backend
        if (savedId.startsWith('mock-') && storedUser) {
          setDevUser(JSON.parse(storedUser))
          localStorage.setItem('token', 'dev-bypass')
          setLoading(false)
          return
        }

        try {
          // Intentar obtener usuarios reales desde el backend (dev-info endpoint)
          const res = await fetch(`${API}/api/v1/auth/dev-info`)
          if (res.ok) {
            const data = await res.json()
            if (data.users && data.users.length > 0) {
              // Si el savedId coincide con un usuario real, usarlo; si no, respetar localStorage
              const found = savedId ? data.users.find(u => u.id === parseInt(savedId)) : null
              if (found) {
                const userData = {
                  id: found.id, nombre: found.nombre, email: found.email,
                  rol: found.rol, plan_id: found.plan_id, tipo_cuenta: found.tipo_cuenta,
                  vende_productos: found.vende_productos, ofrece_servicios: found.ofrece_servicios,
                  ofrece_arriendos: found.ofrece_arriendos,
                }
                localStorage.setItem('user', JSON.stringify(userData))
                localStorage.setItem('token', 'dev-bypass')
                setDevUser(userData)
                setLoading(false)
                return
              }
              // savedId no encontrado en BD — respetar usuario ya guardado o usar primero de la lista
              if (storedUser) {
                localStorage.setItem('token', 'dev-bypass')
                setDevUser(JSON.parse(storedUser))
                setLoading(false)
                return
              }
              const first = data.users[0]
              const userData = {
                id: first.id, nombre: first.nombre, email: first.email,
                rol: first.rol, plan_id: first.plan_id, tipo_cuenta: first.tipo_cuenta,
                vende_productos: first.vende_productos, ofrece_servicios: first.ofrece_servicios,
                ofrece_arriendos: first.ofrece_arriendos,
              }
              localStorage.setItem('user', JSON.stringify(userData))
              localStorage.setItem('token', 'dev-bypass')
              localStorage.setItem('dev_user_id', String(first.id))
              setDevUser(userData)
              setLoading(false)
              return
            }
          }
        } catch {
          // Backend no disponible — usar usuario ya guardado o default
        }

        const fallback = storedUser ? JSON.parse(storedUser) : DEFAULT_DEV_USER
        if (!storedUser) {
          localStorage.setItem('user', JSON.stringify(DEFAULT_DEV_USER))
          localStorage.setItem('dev_user_id', String(DEFAULT_DEV_USER.id))
        }
        localStorage.setItem('token', 'dev-bypass')
        setDevUser(fallback)
        setLoading(false)
      }
      loadDevUser()
    }, [])

    if (loading) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
          <div className="text-slate-400 text-sm">Cargando usuario de desarrollo...</div>
        </div>
      )
    }

    return children
  }

  // --- Modo Producción: verificación real de sesión ---
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
