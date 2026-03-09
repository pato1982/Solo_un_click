const plans = [
  {
    name: 'Plan Gratuito',
    price: '$0',
    period: null,
    buttonText: 'Seleccionar',
    buttonStyle: 'bg-slate-200 text-slate-700 hover:bg-slate-300',
    highlight: false,
    basics: {
      images: '5',
    },
    visibility: {
      mainPage: true,
      search: true,
      featured: false,
      priority: 'Normal',
    },
    features: {
      panel: true,
      edit: true,
      storeInfo: true,
      slogan: true,
    },
    ownPage: {
      enabled: false,
      carousel: false,
      banner: false,
      stats: false,
    },
  },
  {
    name: 'Plan Normal',
    price: '$2.990',
    period: '+ IVA Mensual',
    buttonText: 'Seleccionar',
    buttonStyle: 'bg-primary text-white hover:bg-primary-light',
    highlight: false,
    basics: {
      images: '25',
    },
    visibility: {
      mainPage: true,
      search: true,
      featured: true,
      priority: 'Alta',
    },
    features: {
      panel: true,
      edit: true,
      storeInfo: true,
      slogan: true,
    },
    ownPage: {
      enabled: false,
      carousel: false,
      banner: false,
      stats: false,
    },
  },
  {
    name: 'Plan Premium',
    price: '$4.990',
    period: '+ IVA Mensual',
    buttonText: 'Plan Actual',
    buttonStyle: 'bg-accent text-primary font-black cursor-default',
    highlight: true,
    basics: {
      images: '100',
    },
    visibility: {
      mainPage: true,
      search: true,
      featured: true,
      priority: 'Maxima',
    },
    features: {
      panel: true,
      edit: true,
      storeInfo: true,
      slogan: true,
    },
    ownPage: {
      enabled: true,
      carousel: '3 Carruseles',
      banner: true,
      stats: true,
    },
  },
]

import { useState } from 'react'

function Check() {
  return <span className="material-symbols-outlined text-green-500 text-sm">check_circle</span>
}

function Cross() {
  return <span className="material-symbols-outlined text-red-400 text-sm">cancel</span>
}

function BoolIcon({ value }) {
  return value ? <Check /> : <Cross />
}

function InfoTooltip({ text }) {
  const [show, setShow] = useState(false)
  return (
    <span className="relative inline-flex">
      <button
        onClick={(e) => { e.stopPropagation(); setShow(!show) }}
        className="h-5 w-5 rounded-full bg-amber-100 hover:bg-amber-200 text-amber-500 flex items-center justify-center transition-colors"
      >
        <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>help</span>
      </button>
      {show && (
        <>
          <div className="fixed inset-0" style={{ zIndex: 10001 }} onClick={() => setShow(false)}></div>
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[10px] leading-relaxed rounded-lg px-3 py-2 w-52 shadow-xl" style={{ zIndex: 10002 }}>
            <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-slate-800 rotate-45"></div>
          <span className="normal-case font-normal tracking-normal" style={{ textAlign: 'justify', display: 'block' }}>{text}</span>
          </div>
        </>
      )}
    </span>
  )
}

function ValueOrBool({ value }) {
  if (value === true) return <Check />
  if (value === false) return <Cross />
  return <span className="text-[11px] font-bold text-primary">{value}</span>
}

export default function PlansModal({ onClose }) {
  return (
    <div className="fixed inset-0 flex items-center justify-center p-4" style={{ zIndex: 10000 }} onClick={onClose}>
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm"></div>
      <div
        className="relative bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <button onClick={onClose} className="absolute top-3 right-3 z-10 h-7 w-7 bg-slate-100 hover:bg-slate-200 rounded-full flex items-center justify-center transition-colors">
          <span className="material-symbols-outlined text-slate-600 text-base">close</span>
        </button>

        <div className="p-4 pt-5">
          <div className="grid grid-cols-3 gap-3">
            {plans.map((plan) => (
              <div
                key={plan.name}
                className={`rounded-xl border-2 p-3 flex flex-col transition-all ${
                  plan.highlight
                    ? 'border-accent shadow-lg shadow-accent/20 relative'
                    : 'border-slate-200 hover:border-primary/30'
                }`}
              >
                {plan.highlight && (
                  <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-accent text-primary text-[8px] font-black uppercase tracking-wider px-3 py-0.5 rounded-full">
                    Recomendado
                  </span>
                )}

                <div className="text-center mb-1.5">
                  <h3 className="text-sm font-black text-slate-800 leading-tight">{plan.name}</h3>
                  <div className="flex items-baseline justify-center gap-1">
                    <span className="text-xl font-black text-primary">{plan.price}</span>
                    {plan.period && (
                      <span className="text-[10px] text-slate-400">{plan.period}</span>
                    )}
                  </div>
                </div>

                <button className={`w-full py-1 rounded-lg text-xs font-bold uppercase tracking-wide transition-all mb-2 ${plan.buttonStyle}`}>
                  {plan.buttonText}
                </button>

                <div className="mb-1.5">
                  <h4 className="text-[10px] font-black text-primary uppercase tracking-wider mb-1 border-b border-primary/20 pb-0.5">Caracteristicas basicas</h4>
                  <div className="space-y-0.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] text-slate-600">Imagenes permitidas</span>
                      <span className="text-[11px] font-bold text-primary">{plan.basics.images}</span>
                    </div>
                  </div>
                </div>

                <div className="mb-1.5">
                  <h4 className="text-[10px] font-black text-primary uppercase tracking-wider mb-1 border-b border-primary/20 pb-0.5">Visibilidad</h4>
                  <div className="space-y-0.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] text-slate-600">Pagina principal</span>
                      <BoolIcon value={plan.visibility.mainPage} />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] text-slate-600">Buscadores</span>
                      <BoolIcon value={plan.visibility.search} />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] text-slate-600">Producto destacado</span>
                      <BoolIcon value={plan.visibility.featured} />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] text-slate-600">Prioridad de aparicion</span>
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                        plan.visibility.priority === 'Maxima' ? 'bg-accent text-primary' :
                        plan.visibility.priority === 'Alta' ? 'bg-primary/10 text-primary' :
                        'bg-slate-100 text-slate-500'
                      }`}>{plan.visibility.priority}</span>
                    </div>
                  </div>
                </div>

                <div className="mb-1.5">
                  <h4 className="text-[10px] font-black text-primary uppercase tracking-wider mb-1 border-b border-primary/20 pb-0.5">Funcionalidades</h4>
                  <div className="space-y-0.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] text-slate-600">Panel de control</span>
                      <BoolIcon value={plan.features.panel} />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] text-slate-600">Editar informacion</span>
                      <BoolIcon value={plan.features.edit} />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] text-slate-600">Info de la tienda</span>
                      <BoolIcon value={plan.features.storeInfo} />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] text-slate-600">Slogan</span>
                      <BoolIcon value={plan.features.slogan} />
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-[10px] font-black text-primary uppercase tracking-wider mb-1 border-b border-primary/20 pb-0.5 flex items-center gap-1">
                    Pagina propia
                    {plan.highlight && <InfoTooltip text="Tu negocio tendra su propia pagina dentro de Solo a un Click con toda tu informacion, productos y contacto. Podras compartir el enlace directo con tus clientes para que accedan a tu tienda facilmente." />}
                  </h4>
                  <div className="space-y-0.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] text-slate-600">Pagina propia</span>
                      <BoolIcon value={plan.ownPage.enabled} />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] text-slate-600">Carrusel</span>
                      <ValueOrBool value={plan.ownPage.carousel} />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] text-slate-600">Banner</span>
                      <BoolIcon value={plan.ownPage.banner} />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] text-slate-600">Estadisticas</span>
                      <BoolIcon value={plan.ownPage.stats} />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
