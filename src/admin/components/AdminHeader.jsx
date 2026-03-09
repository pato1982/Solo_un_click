export default function AdminHeader({ onToggleSidebar }) {
  return (
    <header className="sticky top-0 z-50 bg-primary text-white shadow-lg border-b-2 border-accent">
      <div className="flex items-center h-16 px-6">
        {/* Botón hamburguesa */}
        <button
          onClick={onToggleSidebar}
          className="p-2 rounded-lg hover:bg-white/10 transition-colors mr-4"
        >
          <span className="material-symbols-outlined text-2xl">menu</span>
        </button>

        {/* Panel Admin centrado */}
        <div className="flex-1 flex items-center justify-center">
          <span className="text-lg font-bold uppercase tracking-wider text-white">
            Panel Administrador
          </span>
        </div>

        {/* Logo Solo a un Click a la derecha */}
        <a href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity shrink-0">
          <div className="bg-accent p-1.5 rounded-lg text-primary leading-none">
            <span className="material-symbols-outlined block text-2xl font-bold">ads_click</span>
          </div>
          <div className="flex flex-col leading-none">
            <span className="text-[10px] font-bold uppercase tracking-widest text-white/70">Solo a</span>
            <span className="text-xl font-black italic tracking-tight text-white">
              un <span className="text-accent uppercase">CLICK</span>
            </span>
          </div>
        </a>
      </div>
    </header>
  )
}
