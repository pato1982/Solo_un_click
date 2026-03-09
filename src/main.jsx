import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import App from './App'
import AdminLayout from './admin/AdminLayout'
import AdminProductos from './admin/pages/AdminProductos'
import DevLogin from './admin/DevLogin'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/dev" element={<DevLogin />} />
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminProductos />} />
        </Route>
        <Route path="/*" element={<App />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>,
)
