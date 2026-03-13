import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import App from './App'
import AdminLayout from './admin/AdminLayout'
import AdminProductos from './admin/pages/AdminProductos'
import AdminNegocio from './admin/pages/AdminNegocio'
import AdminCarruseles from './admin/pages/AdminCarruseles'
import AdminBanner from './admin/pages/AdminBanner'
import AdminEstadisticas from './admin/pages/AdminEstadisticas'
import AdminTour from './admin/pages/AdminTour'
import AdminPortada from './admin/pages/AdminPortada'
import AdminPagina from './admin/pages/AdminPagina'
import ProgramadorLocales from './admin/pages/ProgramadorLocales'
import ProgramadorEventos from './admin/pages/ProgramadorEventos'
import DevLogin from './admin/DevLogin'
import './index.css'

function AdminIndex() {
  const user = JSON.parse(localStorage.getItem('user') || '{}')
  if (user.rol === 'programador') return <Navigate to="/admin/programador/locales" replace />
  if (user.tipo_cuenta === 'turismo') return <Navigate to="/admin/tour" replace />
  return <AdminProductos />
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/dev" element={<DevLogin />} />
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminIndex />} />
          <Route path="negocio" element={<AdminNegocio />} />
          <Route path="carruseles" element={<AdminCarruseles />} />
          <Route path="banner" element={<AdminBanner />} />
          <Route path="estadisticas" element={<AdminEstadisticas />} />
          <Route path="portada" element={<AdminPortada />} />
          <Route path="tour" element={<AdminTour />} />
          <Route path="pagina" element={<AdminPagina />} />
          <Route path="programador/locales" element={<ProgramadorLocales />} />
          <Route path="programador/eventos" element={<ProgramadorEventos />} />
        </Route>
        <Route path="/*" element={<App />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>,
)
