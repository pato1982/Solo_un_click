import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import AdminHeader from './components/AdminHeader'
import AdminSidebar from './components/AdminSidebar'

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const user = JSON.parse(localStorage.getItem('user') || '{}')
  const isProg = (user.rol || 'usuario') === 'programador'

  return (
    <div className={`min-h-screen flex flex-col ${isProg ? 'bg-slate-800' : 'bg-gray-100'}`}>
      <AdminHeader onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

      <div className="flex flex-1">
        <AdminSidebar open={sidebarOpen} />

        <main
          className={`flex-1 p-6 transition-all duration-300 ${
            sidebarOpen ? 'ml-64' : 'ml-0'
          }`}
        >
          <Outlet />
        </main>
      </div>
    </div>
  )
}
