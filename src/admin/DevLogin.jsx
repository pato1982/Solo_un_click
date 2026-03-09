import { useNavigate } from 'react-router-dom'

const devUsers = {
  general: {
    id: 0,
    nombre: 'Dev Admin',
    email: 'dev@soloaunclick.cl',
    tipo_cuenta: 'general',
    plan_id: 3,
    vende_productos: 1,
    ofrece_servicios: 1,
    ofrece_arriendos: 1,
  },
  turismo: {
    id: 0,
    nombre: 'Dev Turismo',
    email: 'dev-turismo@soloaunclick.cl',
    tipo_cuenta: 'turismo',
    plan_id: 3,
    vende_productos: 0,
    ofrece_servicios: 0,
    ofrece_arriendos: 0,
  },
}

export default function DevLogin() {
  const navigate = useNavigate()

  const enter = (type) => {
    localStorage.setItem('token', 'dev-token')
    localStorage.setItem('user', JSON.stringify(devUsers[type]))
    navigate('/admin')
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white rounded-2xl shadow-lg p-8 max-w-sm w-full text-center space-y-6">
        <div>
          <span className="material-symbols-outlined text-primary text-4xl">code</span>
          <h1 className="text-lg font-black text-gray-800 mt-2">Dev Login</h1>
          <p className="text-xs text-gray-400 mt-1">Acceso de desarrollo</p>
        </div>

        <div className="space-y-3">
          <button
            onClick={() => enter('general')}
            className="w-full flex items-center justify-center gap-2 bg-primary text-white font-bold py-3 rounded-lg hover:bg-primary/90 transition-colors"
          >
            <span className="material-symbols-outlined">storefront</span>
            Admin General
            <span className="text-[10px] font-normal opacity-70">(productos/servicios/arriendos)</span>
          </button>

          <button
            onClick={() => enter('turismo')}
            className="w-full flex items-center justify-center gap-2 bg-teal-600 text-white font-bold py-3 rounded-lg hover:bg-teal-700 transition-colors"
          >
            <span className="material-symbols-outlined">tour</span>
            Admin Turismo
            <span className="text-[10px] font-normal opacity-70">(experiencias/tours)</span>
          </button>
        </div>

        <p className="text-[10px] text-gray-300">Solo visible en desarrollo</p>
      </div>
    </div>
  )
}
