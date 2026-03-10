import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import App from './App'
import AdminLayout from './admin/AdminLayout'
import AdminProductos from './admin/pages/AdminProductos'
import AdminNegocio from './admin/pages/AdminNegocio'
import AdminCarruseles from './admin/pages/AdminCarruseles'
import AdminBanner from './admin/pages/AdminBanner'
import AdminEstadisticas from './admin/pages/AdminEstadisticas'
import DevLogin from './admin/DevLogin'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/dev" element={<DevLogin />} />
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminProductos />} />
          <Route path="negocio" element={<AdminNegocio />} />
          <Route path="carruseles" element={<AdminCarruseles />} />
          <Route path="banner" element={<AdminBanner />} />
          <Route path="estadisticas" element={<AdminEstadisticas />} />
        </Route>
        <Route path="/*" element={<App />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>,
)
